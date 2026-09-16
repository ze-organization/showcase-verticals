import type { GeocodeResult, Geocoder } from "../types";

/**
 * OpenStreetMap Nominatim — demo geocoder. Call from a server route
 * (Nominatim blocks most browser CORS and requires a identifying
 * User-Agent). Usage policy: one request per second.
 *
 * https://operations.osmfoundation.org/policies/nominatim/
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT =
  "ze-showcase-starter-locations-demo/1.0 (Sitecore showcase; OSM locator)";

let lastRequestAt = 0;
const MIN_INTERVAL_MS = 1100;

async function waitForSlot(): Promise<void> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_INTERVAL_MS - elapsed),
    );
  }
  lastRequestAt = Date.now();
}

export const nominatimGeocoder: Geocoder = {
  async geocode(query: string): Promise<GeocodeResult | null> {
    const trimmed = query.trim();
    if (!trimmed) return null;

    await waitForSlot();

    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("q", trimmed);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
    }>;
    const first = payload[0];
    if (!first?.lat || !first?.lon) return null;

    const lat = Number.parseFloat(first.lat);
    const lng = Number.parseFloat(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng, label: first.display_name };
  },
};
