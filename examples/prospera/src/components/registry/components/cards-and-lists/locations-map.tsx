"use client";

import { MapCanvas } from "@/lib/registry/maps/map-canvas";
import { useLocationsMapContext } from "@/lib/registry/maps/locations-map-context";
import { cn } from "@/lib/registry/cn";
import { sitecorePassthrough } from "@/lib/registry/with-sitecore";

/**
 * Finder map rendering. Drops into `locations-map-{*}`. Reads markers
 * from `LocationsMapProvider` (the parent list-grid / carousel).
 * Has no datasource — vendor is chosen in `create-map-adapter.ts`.
 */
function LocationsMap({ className }: { className?: string }) {
  const ctx = useLocationsMapContext();
  const markers = ctx?.markers ?? [];

  if (markers.length === 0) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[16rem] w-full items-center justify-center bg-muted/40 text-muted-foreground",
          className,
        )}
        data-slot="locations-map-empty"
      >
        <span className="font-medium text-sm uppercase tracking-wide">Map</span>
      </div>
    );
  }

  return (
    <MapCanvas
      markers={markers}
      selectedId={ctx?.selectedId}
      onSelect={ctx?.setSelectedId}
      className={className}
    />
  );
}

export const Default = sitecorePassthrough(LocationsMap);
export default Default;
export const componentType = "universal";
