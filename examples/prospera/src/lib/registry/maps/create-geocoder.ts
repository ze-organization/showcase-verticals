import { nominatimGeocoder } from "./adapters/nominatim-geocoder";
import type { Geocoder } from "./types";

/**
 * The only module to edit when swapping geocoding vendors.
 * Return a Mapbox / Google geocoder here; `/api/geocode` stays unchanged.
 */
export function createGeocoder(): Geocoder {
  return nominatimGeocoder;
}
