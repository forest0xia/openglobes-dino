# DinoGlobe

Interactive 3D globe showing 22,000+ dinosaur fossil discovery sites worldwide. Part of the [OpenGlobes](https://openglobes.com) series.

**Live:** [dino.openglobes.com](https://dino.openglobes.com)

## Features

- **Time slider** — Scrub through 186 million years of geological time (252–66 Mya). Fossils fade in/out as you drag across the Triassic, Jurassic, and Cretaceous periods.
- **3D globe** — Earth terrain texture with amber atmosphere glow, powered by Three.js via [@openglobes/core](https://github.com/openglobes/openglobes-core).
- **Era-colored points** — Triassic (red-pink), Jurassic (teal-green), Cretaceous (cyan-blue).
- **Filters** — Era, dinosaur type (Theropod, Sauropod, Ornithischian, Marine Reptile, Pterosaur), and country.
- **Fuzzy search** — Find any taxon by name with Fuse.js.
- **Detail drawer** — Taxon name, classification, age range, formation, links to PBDB and Wikipedia.
- **Responsive** — Desktop sidebars collapse to draggable bottom sheets on mobile.
- **Spatial tile loading** — Data fetched on demand by viewport at zoom levels 0–7.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro 5](https://astro.build) (static output) |
| UI | [React 19](https://react.dev) via `@astrojs/react` |
| Globe engine | [@openglobes/core](https://github.com/openglobes/openglobes-core) (Three.js + three-globe) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) + openglobes design system tokens |
| Search | [Fuse.js](https://www.fusejs.io/) |
| Hosting | [GitHub Pages](https://pages.github.com) |

## Project Structure

```
src/
├── pages/
│   └── index.astro          # Single page entry
├── layouts/
│   └── Layout.astro          # HTML shell, Google Fonts
├── components/
│   ├── DinoApp.tsx            # Main app — wires Globe, filters, search, detail drawer
│   └── TimeSlider.tsx         # Hero feature — geological time range slider
├── styles/
│   └── global.css             # Dino theme overrides, time slider styles, Tailwind
└── dinoTheme.ts               # GlobeTheme config (colors, filters, detail fields)

data/                           # Symlinked from openglobes-etl (gitignored)
├── tiles/z{0-7}/{x}_{y}.json  # Spatial tiles with points and clusters
├── species/{id}.json           # Per-taxon detail files
└── index.json                  # Master index with filter definitions

public/
└── favicon.svg
```

## Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- [@openglobes/core](https://github.com/openglobes/openglobes-core) cloned as a sibling directory

### Install

```bash
# Link the core engine
cd ../openglobes-core && pnpm link --global
cd ../openglobes-dino && pnpm link --global @openglobes/core

# Symlink pre-built data from the ETL repo
ln -s ../openglobes-etl/output/dino data

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Astro dev server with HMR |
| `pnpm build` | Build static site to `dist/` |
| `pnpm preview` | Preview the production build locally |

## Data

All data is pre-generated from the [Paleobiology Database](https://paleobiodb.org) by the `openglobes-etl` repo. No runtime API calls are made — everything is static JSON.

- **22,930 fossil taxa** across 20 countries
- **Tile system:** Slippy-map convention, zoom levels 0–7
- **Filters:** Era, type, age range (Ma), country
- **License:** CC-BY 4.0

## Design

- **Background:** `#0d0800` (warm dark)
- **Accent:** `#d4a373` (amber)
- **Atmosphere:** Amber glow
- **Typography:** Syne (display), DM Sans (body), JetBrains Mono (mono)
- **UI:** Glassmorphism panels with backdrop blur, matching the [openglobes design system](../openglobes-core/docs/DESIGN_SYSTEM.md)

### Era Colors

| Period | Color | Range |
|--------|-------|-------|
| Triassic | `#ef476f` (red-pink) | 252–201 Mya |
| Jurassic | `#56d6a0` (teal-green) | 201–145 Mya |
| Cretaceous | `#4cc9f0` (cyan-blue) | 145–66 Mya |

## Deployment

CI/CD is configured in `.github/workflows/deploy.yml`:

1. Clones `openglobes-etl`, copies `output/dino` to `./data`
2. Installs dependencies and builds with `pnpm build`
3. Deploys `dist/` to GitHub Pages at `dino.openglobes.com`

## License

Code: AGPL-3.0. Data: [Paleobiology Database](https://paleobiodb.org) — CC-BY 4.0.
