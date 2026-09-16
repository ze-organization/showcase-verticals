import type { MapAdapter } from "./types";
import { leafletMapAdapter } from "./adapters/leaflet-map-adapter";

/**
 * The only module to edit when swapping map vendors.
 * Return a Mapbox / MapLibre / Google adapter here; callers stay unchanged.
 */
export function createMapAdapter(): MapAdapter {
  return leafletMapAdapter;
}
