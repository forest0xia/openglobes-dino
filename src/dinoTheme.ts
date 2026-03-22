import type { GlobeTheme, PointItem } from '@openglobes/core';

/** Era → color mapping */
const ERA_COLORS: Record<string, string> = {
  Triassic: '#ef476f',
  Jurassic: '#56d6a0',
  Cretaceous: '#4cc9f0',
};

export const DINO_THEME: GlobeTheme = {
  id: 'dino',
  name: 'DinoGlobe',
  tagline: 'Dinosaur fossil sites worldwide',

  // Earth terrain texture — natural topography
  globeTexture: '//unpkg.com/three-globe/example/img/earth-topology.png',
  atmosphereColor: '#d4a373',
  backgroundColor: '#0d0800',
  terrain: {
    bumpMap: '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png',
    bumpScale: 15,
    specularMap: '//cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png',
    specular: '#8b7355',
    shininess: 10,
  },

  pointColor: (item: PointItem) => {
    const era = item.era as string;
    return ERA_COLORS[era] ?? '#d4a373';
  },
  pointSize: () => 0.3,
  clusterColor: (count: number) => {
    if (count > 1000) return '#d4a373';
    if (count > 100) return '#f0c987';
    return '#e8d5b7';
  },

  colors: {
    primary: '#d4a373',
    surface: 'rgba(20, 14, 4, 0.55)',
    text: 'rgba(230, 240, 255, 0.95)',
    textMuted: 'rgba(160, 180, 210, 0.72)',
    accent: '#d4a373',
    gradient: ['#d4a373', '#0d0800'],
  },

  fonts: {
    display: "'Syne', sans-serif",
    body: "'DM Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  filters: [
    {
      key: 'era',
      label: 'Era',
      type: 'chips',
      options: ['Triassic', 'Jurassic', 'Cretaceous'],
    },
    {
      key: 'type',
      label: 'Type',
      type: 'chips',
      options: ['Theropod', 'Sauropod', 'Ornithischian', 'Marine Reptile', 'Pterosaur', 'Other'],
    },
    {
      key: 'country',
      label: 'Country',
      type: 'chips',
      options: ['US', 'CA', 'CN', 'ES', 'MN', 'AR', 'UK', 'FR', 'BR', 'AU', 'MX', 'PT', 'MA', 'UZ', 'KR', 'IN', 'TZ', 'RO', 'ZA', 'DE'],
    },
  ],

  detailFields: [
    { key: 'era', label: 'Era' },
    { key: 'type', label: 'Type' },
    { key: 'age', label: 'Age' },
    { key: 'country', label: 'Country' },
    { key: 'formation', label: 'Formation' },
    { key: 'class', label: 'Classification' },
    { key: 'family', label: 'Family' },
  ],

  attribution: [
    {
      name: 'Paleobiology Database',
      url: 'https://paleobiodb.org',
      license: 'CC-BY 4.0',
    },
  ],

  externalLinks: (item: PointItem) => {
    const links: { label: string; url: string }[] = [];
    if (item.id) {
      links.push({
        label: 'PBDB',
        url: `https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=${item.id}`,
      });
    }
    links.push({
      label: 'Wikipedia',
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(String(item.name).replace(/ /g, '_'))}`,
    });
    return links;
  },
};
