import { registerSearchProvider } from "../registry";
import type { FlatItem, SearchConfig, SearchProvider } from "../types";

/**
 * `custom` provider — passthrough adapter for in-page item arrays.
 * Used when an author has a curated Treelist of items but wants to
 * route them through the search-controller (so the same bar renderings
 * apply sort/filter/pagination).
 *
 * The provider stays presentation-agnostic but does apply two filters
 * the controller needs to feel real in previews:
 *
 *   - Free-text search: matches `title` / `description` (case-insensitive).
 *   - Location filter: when `config.location` is populated AND items
 *     carry `extras.lat` / `extras.lng`, items get a `distance` computed
 *     via the haversine formula. If `radius` is also set, the result
 *     set is filtered to items within radius. Either way the set is
 *     sorted by proximity so the locations family's previews behave
 *     like a real backend.
 *
 * Real backends (Sitecore Search, Coveo, Algolia) do this server-side;
 * the `custom` provider does it client-side so showcase previews work
 * without a backend.
 */
const EARTH_RADIUS_MI = 3958.8;
const EARTH_RADIUS_KM = 6371.0088;

function haversine(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  unit: "mi" | "km",
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const c =
    2 *
    Math.asin(
      Math.sqrt(
        sinDLat * sinDLat +
          Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng,
      ),
    );
  return c * (unit === "km" ? EARTH_RADIUS_KM : EARTH_RADIUS_MI);
}

interface ItemWithCoords extends FlatItem {
  extras?: {
    lat?: number;
    lng?: number;
    distance?: number;
    [k: string]: unknown;
  };
}

function extractCoords(
  item: ItemWithCoords,
): { lat: number; lng: number } | null {
  const lat = item.extras?.lat;
  const lng = item.extras?.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return { lat, lng };
}

function applyLocation(
  items: ItemWithCoords[],
  location: NonNullable<SearchConfig["location"]>,
): ItemWithCoords[] {
  if (location.lat == null || location.lng == null) return items;
  const center = { lat: location.lat, lng: location.lng };
  const unit = location.unit ?? "mi";
  const withDistance = items.map((item) => {
    const coords = extractCoords(item);
    if (!coords) return item;
    const distance = haversine(coords, center, unit);
    return {
      ...item,
      extras: { ...(item.extras ?? {}), distance },
    } as ItemWithCoords;
  });
  const filtered =
    location.radius != null
      ? withDistance.filter((item) => {
          const d = item.extras?.distance;
          return typeof d === "number" && d <= (location.radius as number);
        })
      : withDistance;
  filtered.sort((a, b) => {
    const da = a.extras?.distance ?? Number.POSITIVE_INFINITY;
    const db = b.extras?.distance ?? Number.POSITIVE_INFINITY;
    return da - db;
  });
  return filtered;
}

const customSearchProvider: SearchProvider<FlatItem> = {
  key: "custom",
  async fetch(config) {
    const seedItems =
      (config.providerOptions?.items as FlatItem[] | undefined) ?? [];
    let items = seedItems as ItemWithCoords[];

    if (config.freeText) {
      const q = config.freeText.toLowerCase();
      items = items.filter((item) => {
        const fields = [item.title, item.description, item.type]
          .filter((v): v is string => typeof v === "string")
          .join(" ")
          .toLowerCase();
        return fields.includes(q);
      });
    }

    if (config.location) {
      items = applyLocation(items, config.location);
    }

    return {
      items,
      totalItems: items.length,
      facets: [],
    };
  },
};

registerSearchProvider("custom", customSearchProvider);
