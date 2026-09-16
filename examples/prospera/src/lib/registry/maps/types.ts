/**
 * Vendor-agnostic map contracts.
 *
 * Leaflet / OSM is the demo adapter. Swap vendors by adding another
 * adapter and pointing `create-map-adapter.ts` at it. Cards, details,
 * and `locations-map@1` must import from this file — never from Leaflet.
 */

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  href?: string;
  address?: string;
}

export interface MapViewOptions {
  markers: MapMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export interface MapHandle {
  update: (options: Pick<MapViewOptions, "markers" | "selectedId">) => void;
  destroy: () => void;
}

export interface MapAdapter {
  mount: (container: HTMLElement, options: MapViewOptions) => MapHandle;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  label?: string;
}

export interface Geocoder {
  geocode: (query: string) => Promise<GeocodeResult | null>;
}
