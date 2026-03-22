# CLAUDE.md — Instructions for AI agents working on this repo

## What is this?
dino.openglobes.com — an interactive 3D globe showing dinosaur fossil discovery sites worldwide.
Part of the OpenGlobes series (openglobes.com). Built with Astro 5 + @openglobes/core.

## Setup (local dev)
```bash
# 1. Clone sibling repos if not present
#    ../openglobes-core — the shared globe engine
#    ../openglobes-etl  — data pipeline (has pre-generated output)
# 2. Symlink data from ETL output
ln -s ../openglobes-etl/output/dino data
# 3. Install deps (file: link resolves to sibling core)
pnpm install
# 4. Build core first if not already built
cd ../openglobes-core && pnpm build && cd ../openglobes-dino
# 5. Run dev server
pnpm dev
```
Data is ALREADY GENERATED from the Paleobiology Database (CC-BY 4.0). Do NOT call any external APIs.

## What @openglobes/core provides
This repo imports the shared engine. Key exports you'll use:
- **Components:** `Globe`, `GlobeRoot`, `FilterPanel`, `DetailDrawer`, `SearchBar`, `MobileSheet`, `ZoomControls`, `LoadingOrb`
- **Hooks:** `useSpatialIndex` (fetches JSON tiles by viewport), `useResponsive` (breakpoints), `useGlobeTheme` (theme context)
- **Layers:** `applyArcLayer` (animated arcs), `applyTrailLayer` (multi-waypoint flow)
- **CSS:** `@openglobes/core/tokens.css` — all `og-*` utility classes (og-glass, og-chip, og-mono-value, etc.)
- **Types:** `GlobeTheme`, `FilterConfig`, `DetailFieldConfig`, `PointItem`, `ClusterItem`
- **Globe callbacks:** `onSceneReady(refs)` for Three.js scene access, `onFrame(dt)` for animation loop
- Do NOT modify core from this repo. If you need core changes, note them in .agent-state/dino-globe.md.

## Data
- data/tiles/z{0-7}/{x}_{y}.json — spatial tiles (clusters at z0-3, points at z4-7)
- data/species/{id}.json — per-fossil-taxon detail files
- data/index.json — master index with filter definitions
- data/search.json — compact taxon list for Fuse.js search

## Tech stack
- Astro 5 with React integration (@astrojs/react)
- @openglobes/core for Globe, FilterPanel, DetailDrawer, hooks
- Tailwind 4
- Static site output — deployed to GitHub Pages at dino.openglobes.com

## Design direction
Read ../openglobes-core/docs/DESIGN_SYSTEM.md for the full design system.
DinoGlobe overrides only the color palette:

- Globe texture: earth terrain with natural topography (not ocean)
- Background: #0d0800 (warm dark)
- Atmosphere glow: #d4a373 (amber)
- Accent color: #d4a373 (amber)
- Point colors by era:
  - Triassic: #ef476f (red-pink) — 252-201 Mya
  - Jurassic: #56d6a0 (teal-green) — 201-145 Mya
  - Cretaceous: #4cc9f0 (cyan-blue) — 145-66 Mya
- Typography: display=Syne (Google Fonts), body=DM Sans, mono=JetBrains Mono
- Glassmorphism panels matching DESIGN_SYSTEM.md (dark glass, backdrop-blur)

## Hero feature: TIME SLIDER
The unique interaction that makes DinoGlobe special:
- A horizontal time slider pinned to the bottom of the screen
- Range: 252 Mya (Triassic start) → 66 Mya (K-Pg extinction)
- Dragging the slider filters which fossils are visible on the globe
- Points fade in/out as the user scrubs through geological time
- Labeled tick marks at period boundaries: Triassic | Jurassic | Cretaceous
- Current value shown as "145 million years ago" in mono font
- Glass panel style, full width on mobile, centered 600px on desktop
- This is the FIRST thing a user should want to interact with

## Page structure
Single page:
- Full-screen globe as hero (earth terrain texture)
- Time slider at bottom (the star feature)
- Left sidebar (desktop) / bottom sheet (mobile): filters for era, type, country
- Right sidebar (desktop) / bottom sheet (mobile): fossil detail on click
- Top: search bar with fuzzy search
- Bottom-right: zoom controls
- Bottom: attribution (Paleobiology Database CC-BY 4.0)

## Filter dimensions
- Era: Triassic / Jurassic / Cretaceous (chip buttons, color-coded)
- Type: Theropod / Sauropod / Ornithischian / Marine Reptile / Pterosaur / Other
- Age: range slider 252-66 Mya (synced with the hero time slider)
- Country: top 20 countries by fossil count

## Detail drawer fields
- Taxon name (display font, large)
- Taxonomic classification (order, family)
- Era + age range in Mya
- Discovery country + geological formation
- Links: Paleobiology Database page + Wikipedia
- Image: placeholder for v1 (dark gradient + dino silhouette SVG)

## Mobile behavior
- Globe fills viewport
- Time slider at bottom, above the bottom sheet
- Filter panel = draggable bottom sheet, collapsed by default
- Tap a point → fossil detail slides up as bottom sheet
- Pinch to zoom, drag to rotate

## Performance
- Astro static HTML renders first (zero JS blocking)
- Globe lazy-loads after page interactive
- Data tiles fetched on demand by viewport
- Target: Lighthouse mobile > 80

## CI/CD
- .github/workflows/deploy.yml builds and deploys on push to main
- Workflow clones openglobes-etl, copies output/dino to ./data
- Workflow clones openglobes-core, builds it so file: link resolves
- Deploys static output to GitHub Pages at dino.openglobes.com
- data/ is in .gitignore (symlinked locally, copied in CI)

## Session continuity
- Update .agent-state/dino-globe.md after every session
- Read .agent-state/ on startup to continue from last checkpoint
