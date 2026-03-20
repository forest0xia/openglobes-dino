import { useCallback, type CSSProperties } from 'react';

// Geological periods in Mya (million years ago)
const TRIASSIC_START = 252;
const JURASSIC_START = 201;
const CRETACEOUS_START = 145;
const KPG_EXTINCTION = 66;

const TOTAL_RANGE = TRIASSIC_START - KPG_EXTINCTION; // 186 Mya span

// Position percentages for tick marks (from left = old to right = young)
const JURASSIC_PCT = ((TRIASSIC_START - JURASSIC_START) / TOTAL_RANGE) * 100; // ~27.4%
const CRETACEOUS_PCT = ((TRIASSIC_START - CRETACEOUS_START) / TOTAL_RANGE) * 100; // ~57.5%

interface TimeSliderProps {
  /** Current value in Mya — higher = older */
  value: number;
  onChange: (mya: number) => void;
}

export function TimeSlider({ value, onChange }: TimeSliderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Slider input goes 66 → 252 (left = young, right = old)
      // We invert so dragging left = older, right = younger
      const raw = Number(e.target.value);
      // Invert: slider value 66 → Mya 252, slider value 252 → Mya 66
      const mya = TRIASSIC_START + KPG_EXTINCTION - raw;
      onChange(mya);
    },
    [onChange],
  );

  // Invert for the HTML range input
  const sliderValue = TRIASSIC_START + KPG_EXTINCTION - value;

  return (
    <div className="time-slider-container">
      <div className="time-slider-panel og-glass">
        <div className="time-slider-value">
          <span>{Math.round(value)}</span> million years ago
        </div>
        <div className="time-slider-track">
          <input
            type="range"
            min={KPG_EXTINCTION}
            max={TRIASSIC_START}
            value={sliderValue}
            onChange={handleChange}
            aria-label="Geological time"
            aria-valuetext={`${Math.round(value)} million years ago`}
          />
        </div>
        <div className="time-slider-ticks">
          <span className="time-slider-tick triassic">
            Triassic
          </span>
          <span className="time-slider-tick jurassic" style={{ position: 'absolute', left: `${JURASSIC_PCT}%`, transform: 'translateX(-50%)' } as CSSProperties}>
            <span className="time-slider-tick-divider" />
            Jurassic
          </span>
          <span className="time-slider-tick cretaceous" style={{ position: 'absolute', left: `${CRETACEOUS_PCT}%`, transform: 'translateX(-50%)' } as CSSProperties}>
            <span className="time-slider-tick-divider" />
            Cretaceous
          </span>
          <span className="time-slider-tick cretaceous" style={{ opacity: 0.5 }}>
            66 Ma
          </span>
        </div>
      </div>
    </div>
  );
}
