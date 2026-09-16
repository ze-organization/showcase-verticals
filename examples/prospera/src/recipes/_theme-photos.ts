/**
 * Prospera theme-pack photos — exactly five files. Reuse these; do not
 * invent additional image assets. Paths are same-origin so Next Image
 * can serve them from `public/theme-photos/` before Sitecore media ingest.
 */
export const THEME_PHOTOS = [
  "home-hero.jpg",
  "hub-01.jpg",
  "hub-02.jpg",
  "pdp-01.jpg",
  "promo-closer.jpg",
] as const;

export type ThemePhoto = (typeof THEME_PHOTOS)[number];

const BY_USE: Record<string, ThemePhoto> = {
  "home-hero": "home-hero.jpg",
  "hub-personal": "hub-01.jpg",
  "hub-01": "hub-01.jpg",
  "hub-business": "hub-02.jpg",
  "hub-02": "hub-02.jpg",
  pdp: "pdp-01.jpg",
  "pdp-01": "pdp-01.jpg",
  "promo-closer": "promo-closer.jpg",
  "everyday-checking": "pdp-01.jpg",
  "high-yield-savings": "hub-01.jpg",
  "rewards-visa": "pdp-01.jpg",
  "thirty-year-mortgage": "hub-01.jpg",
  "home-equity-line-of-credit": "hub-02.jpg",
  "checking-and-savings": "hub-01.jpg",
  cards: "pdp-01.jpg",
  lending: "hub-02.jpg",
  business: "hub-02.jpg",
  locations: "promo-closer.jpg",
  services: "hub-02.jpg",
  "wealth-planning": "hub-02.jpg",
  retirement: "hub-01.jpg",
  treasury: "hub-02.jpg",
};

export function themePhoto(file: ThemePhoto): string {
  return `/theme-photos/${file}`;
}

/** Map leftover picsum seeds onto the five pack photos. */
export function picsum(seed: string, _width = 1600, _height = 900): string {
  const mapped = BY_USE[seed];
  if (mapped) return themePhoto(mapped);
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % THEME_PHOTOS.length;
  }
  return themePhoto(THEME_PHOTOS[hash]);
}
