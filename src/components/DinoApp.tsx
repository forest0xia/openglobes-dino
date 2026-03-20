import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  GlobeRoot,
  Globe,
  FilterPanel,
  DetailDrawer,
  SearchBar,
  ZoomControls,
  useSpatialIndex,
  useResponsive,
  type PointItem,
  type DetailData,
} from '@openglobes/core';
import Fuse from 'fuse.js';
import { DINO_THEME } from '../dinoTheme';
import { TimeSlider } from './TimeSlider';

/** Filter points by era age range relative to the time slider value. */
function filterByTime(points: PointItem[], mya: number): PointItem[] {
  return points.filter((p) => {
    const earlyAge = p.early_age as number | undefined;
    const lateAge = p.late_age as number | undefined;
    if (earlyAge == null || lateAge == null) return true;
    // Show point if the time slider value falls within its age range
    return mya >= lateAge && mya <= earlyAge;
  });
}

/** Filter points by active filter values. */
function filterByFilters(points: PointItem[], filters: Record<string, unknown>): PointItem[] {
  return points.filter((p) => {
    // Era filter
    const eras = filters.era as string[] | undefined;
    if (eras && eras.length > 0 && !eras.includes(p.era as string)) return false;

    // Type filter
    const types = filters.type as string[] | undefined;
    if (types && types.length > 0 && !types.includes(p.type as string)) return false;

    // Country filter
    const countries = filters.country as string[] | undefined;
    if (countries && countries.length > 0 && !countries.includes(p.country as string)) return false;

    return true;
  });
}

export default function DinoApp() {
  // Time slider state — start at mid-Jurassic
  const [timeMya, setTimeMya] = useState(170);

  // Filter values
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});

  // Selected fossil for detail drawer
  const [selectedDetail, setSelectedDetail] = useState<DetailData | null>(null);

  // Mobile sheet state
  const [filterSheetSnap, setFilterSheetSnap] = useState<'closed' | 'peek' | 'expanded'>('closed');

  // Responsive
  const { isMobile } = useResponsive();

  // Spatial index — fetches tile data based on camera position
  const { points: rawPoints, updateCamera, loading } = useSpatialIndex({
    tileBaseUrl: '/data/tiles',
    maxZoom: 7,
    filters: filterValues,
  });

  // Globe ref for zoom control
  const globeContainerRef = useRef<HTMLDivElement>(null);

  // Apply filters and time slider
  const visiblePoints = useMemo(() => {
    const timeFiltered = filterByTime(rawPoints, timeMya);
    return filterByFilters(timeFiltered, filterValues);
  }, [rawPoints, timeMya, filterValues]);

  // Camera change handler — feed spatial index
  const handleCameraChange = useCallback(
    (distance: number) => {
      // Approximate viewport bounds from camera distance
      const fov = 50;
      const halfFov = (fov / 2) * (Math.PI / 180);
      const latSpan = Math.atan(Math.tan(halfFov) * distance / 200) * (180 / Math.PI) * 2;
      const lngSpan = latSpan * 1.5;

      updateCamera(distance, {
        north: Math.min(90, latSpan / 2),
        south: Math.max(-90, -latSpan / 2),
        west: -lngSpan / 2,
        east: lngSpan / 2,
      });
    },
    [updateCamera],
  );

  // Point click — fetch species detail
  const handlePointClick = useCallback(async (point: PointItem) => {
    try {
      const resp = await fetch(`/data/species/${point.id}.json`);
      if (resp.ok) {
        const data = await resp.json() as DetailData;
        setSelectedDetail(data);
      }
    } catch {
      // Silently fail — detail not available
    }
  }, []);

  // Search setup — build index from visible points
  const fuse = useMemo(() => {
    return new Fuse(rawPoints, {
      keys: ['name'],
      threshold: 0.3,
      limit: 6,
    });
  }, [rawPoints]);

  const handleSearch = useCallback(
    (query: string): PointItem[] => {
      return fuse.search(query).map((r) => r.item);
    },
    [fuse],
  );

  const handleSearchSelect = useCallback(
    (item: PointItem) => {
      handlePointClick(item);
    },
    [handlePointClick],
  );

  // Filter change
  const handleFilterChange = useCallback((key: string, value: unknown) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Zoom controls — dispatch wheel events on the globe container
  const handleZoomIn = useCallback(() => {
    globeContainerRef.current?.dispatchEvent(
      new WheelEvent('wheel', { deltaY: -100, bubbles: true }),
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    globeContainerRef.current?.dispatchEvent(
      new WheelEvent('wheel', { deltaY: 100, bubbles: true }),
    );
  }, []);

  // Trigger initial camera update
  useEffect(() => {
    // Start with a wide view
    handleCameraChange(350);
  }, [handleCameraChange]);

  return (
    <GlobeRoot theme={DINO_THEME} className="dino-root">
      {/* Full-screen globe */}
      <div
        ref={globeContainerRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
        }}
      >
        <Globe
          points={visiblePoints}
          onPointClick={handlePointClick}
          onCameraChange={handleCameraChange}
        />
      </div>

      {/* Search bar — top center */}
      <div className="search-container">
        <SearchBar
          onSelect={handleSearchSelect}
          onSearch={handleSearch}
          placeholder="Search fossils..."
        />
      </div>

      {/* Filter panel — left sidebar (desktop) / bottom sheet (mobile) */}
      <FilterPanel
        values={filterValues}
        onChange={handleFilterChange}
        resultCount={visiblePoints.length}
        sheetSnap={isMobile ? filterSheetSnap : undefined}
        onSheetSnapChange={isMobile ? setFilterSheetSnap : undefined}
      />

      {/* Detail drawer — right sidebar (desktop) / bottom sheet (mobile) */}
      <DetailDrawer
        data={selectedDetail}
        onClose={() => setSelectedDetail(null)}
      />

      {/* Time slider — bottom center, the hero feature */}
      <TimeSlider value={timeMya} onChange={setTimeMya} />

      {/* Zoom controls — bottom right, above time slider */}
      <div style={{ position: 'fixed', bottom: 120, right: 16, zIndex: 50 }}>
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      </div>

      {/* Attribution */}
      <div className="attribution-bar">
        Data from <a href="https://paleobiodb.org" target="_blank" rel="noopener noreferrer">Paleobiology Database</a> (CC-BY 4.0)
      </div>

      {/* Mobile filter toggle button */}
      {isMobile && filterSheetSnap === 'closed' && (
        <button
          type="button"
          onClick={() => setFilterSheetSnap('peek')}
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 200,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--og-bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--og-border)',
            borderRadius: 10,
            color: 'var(--og-text-secondary)',
            cursor: 'pointer',
          }}
          aria-label="Open filters"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 6h16M4 12h10M4 18h6" />
          </svg>
        </button>
      )}
    </GlobeRoot>
  );
}
