"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import type { MapMarker } from "@/lib/registry/maps/types";

/** Minimal pin source — avoids importing the list-grid module (cycle). */
export interface LocationMapItem {
  id: string;
  title?: string;
  href?: string;
  extras?: {
    lat?: number;
    lng?: number;
    address1?: unknown;
    city?: unknown;
    state?: unknown;
  };
}

export interface LocationsMapContextValue {
  markers: MapMarker[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

const LocationsMapContext = createContext<LocationsMapContextValue | null>(
  null,
);

function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  return getSourceText(value as TextSource) ?? "";
}

export function locationItemsToMarkers(items: LocationMapItem[]): MapMarker[] {
  const markers: MapMarker[] = [];
  for (const item of items) {
    const lat = item.extras?.lat;
    const lng = item.extras?.lng;
    if (typeof lat !== "number" || typeof lng !== "number") continue;
    const address = [
      textOf(item.extras?.address1),
      [textOf(item.extras?.city), textOf(item.extras?.state)]
        .filter(Boolean)
        .join(", "),
    ]
      .filter(Boolean)
      .join(" · ");
    markers.push({
      id: item.id,
      lat,
      lng,
      title: typeof item.title === "string" ? item.title : textOf(item.title),
      href: item.href,
      address: address || undefined,
    });
  }
  return markers;
}

export function LocationsMapProvider({
  items,
  children,
}: {
  items: LocationMapItem[];
  children: ReactNode;
}) {
  const markers = useMemo(() => locationItemsToMarkers(items), [items]);
  const markerIds = useMemo(() => new Set(markers.map((m) => m.id)), [markers]);
  const [selectedId, setSelectedIdState] = useState<string | null>(null);

  const setSelectedId = useCallback(
    (id: string | null) => {
      if (id && !markerIds.has(id)) {
        setSelectedIdState(null);
        return;
      }
      setSelectedIdState(id);
    },
    [markerIds],
  );

  const value = useMemo<LocationsMapContextValue>(
    () => ({
      markers,
      selectedId: selectedId && markerIds.has(selectedId) ? selectedId : null,
      setSelectedId,
    }),
    [markers, selectedId, markerIds, setSelectedId],
  );

  return (
    <LocationsMapContext.Provider value={value}>
      {children}
    </LocationsMapContext.Provider>
  );
}

export function useLocationsMapContext(): LocationsMapContextValue | null {
  return useContext(LocationsMapContext);
}
