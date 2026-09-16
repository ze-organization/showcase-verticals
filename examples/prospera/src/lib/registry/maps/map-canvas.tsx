"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/registry/cn";
import type { MapCanvasInnerProps } from "./map-canvas-inner";

const MapCanvasLoaded = dynamic(
  () => import("./map-canvas-inner").then((mod) => mod.MapCanvasInner),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full min-h-[16rem] w-full bg-muted"
        data-slot="map-canvas-loading"
      />
    ),
  },
);

/** Public map surface. SSR-safe wrapper around the vendor adapter. */
export function MapCanvas({ className, ...props }: MapCanvasInnerProps) {
  return <MapCanvasLoaded className={cn(className)} {...props} />;
}
