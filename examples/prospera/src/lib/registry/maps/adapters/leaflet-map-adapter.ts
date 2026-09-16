"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapAdapter, MapHandle, MapMarker, MapViewOptions } from "../types";

/**
 * Leaflet + OSM raster tiles. Leaflet is imported only here so the rest
 * of the app can swap vendors without touching cards or details.
 *
 * Default marker images are skipped (webpack / Next URL breakage);
 * pins are a CSS dot via `divIcon`.
 */

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function pinHtml(selected: boolean): string {
  const bg = selected ? "var(--color-primary, #2563eb)" : "#dc2626";
  return `<span style="display:block;width:16px;height:16px;border-radius:999px;background:${bg};border:2px solid #fff;box-shadow:0 1px 4px rgb(0 0 0 / 0.35)"></span>`;
}

function fitOrCenter(map: L.Map, markers: MapMarker[]): void {
  const points = markers
    .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng))
    .map((m) => L.latLng(m.lat, m.lng));
  if (points.length === 0) {
    map.setView([20, 0], 2);
    return;
  }
  if (points.length === 1) {
    map.setView(points[0], 14);
    return;
  }
  map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 12 });
}

export const leafletMapAdapter: MapAdapter = {
  mount(container: HTMLElement, options: MapViewOptions): MapHandle {
    container.style.height = "100%";
    container.style.width = "100%";
    container.style.minHeight = "16rem";
    container.style.zIndex = "0";

    const map = L.map(container, {
      scrollWheelZoom: false,
      attributionControl: true,
    });
    L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);
    const layer = L.layerGroup().addTo(map);
    const markersById = new Map<string, L.Marker>();
    const onSelect = options.onSelect;

    const sync = (next: Pick<MapViewOptions, "markers" | "selectedId">) => {
      layer.clearLayers();
      markersById.clear();
      for (const marker of next.markers) {
        if (!Number.isFinite(marker.lat) || !Number.isFinite(marker.lng)) {
          continue;
        }
        const selected = next.selectedId === marker.id;
        const icon = L.divIcon({
          className: "locations-map-pin",
          html: pinHtml(selected),
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          popupAnchor: [0, -10],
        });
        const pin = L.marker([marker.lat, marker.lng], {
          icon,
          title: marker.title,
        });
        const popupBits = [marker.title, marker.address].filter(Boolean);
        if (popupBits.length > 0) {
          pin.bindPopup(popupBits.join("<br/>"));
        }
        pin.on("click", () => onSelect?.(marker.id));
        pin.addTo(layer);
        markersById.set(marker.id, pin);
      }
      fitOrCenter(map, next.markers);
      const selectedPin = next.selectedId
        ? markersById.get(next.selectedId)
        : undefined;
      if (selectedPin) {
        const ll = selectedPin.getLatLng();
        map.flyTo(ll, Math.max(map.getZoom(), 12), { duration: 0.45 });
        selectedPin.openPopup();
      }
      map.invalidateSize();
    };

    sync(options);

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);

    return {
      update: (next) => sync(next),
      destroy: () => {
        observer.disconnect();
        map.remove();
      },
    };
  },
};
