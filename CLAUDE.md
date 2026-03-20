# CLAUDE.md — Instructions for AI agents working on this repo

## What is this?
dino.openglobes.com — an interactive 3D globe showing dinosaur fossil discovery sites worldwide.
Part of the OpenGlobes series (openglobes.com). Built with Astro 5 + @openglobes/core.

## Setup
Core engine is at sibling directory: ../openglobes-core
```bash
cd ../openglobes-core && pnpm link --global
cd ../openglobes-dino && pnpm link --global @openglobes/core
```
Or in package.json: `"@openglobes/core": "file:../openglobes-core"`

## Data
Pre-built tile data symlinked from ETL repo:
```bash
ln -s ../openglobes-etl/output/dino data
```
Data is ALREADY GENERATED from the Paleobiology Database (CC-BY 4.0 — commercial use OK).
Do NOT call any external APIs. All data is static JSON.

Files:
- data/tiles/z{0-7}/{x}_{y}.json — spatial tiles
- data/species/{id}.json — per-fossil-taxon detail files
- data/index.json — master index with filter definitions
- data/search.json — compact taxon list for Fuse.js search

## Tech stack
- Astro 5 with React integration (@astrojs/react)
- @openglobes/core for Globe, FilterPanel, DetailDrawer, hooks
- Tailwind 4
- Static site output → Cloudflare Pages at dino.openglobes.com

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
- .github/workflows/deploy.yml clones openglobes-etl, copies output/dino to ./data
- Deploys to Cloudflare Pages at dino.openglobes.com
- data/ is in .gitignore (symlink locally, copied in CI)

## Session continuity
- Update .agent-state/dino-globe.md after every session
- Read .agent-state/ on startup to continue from last checkpoint
