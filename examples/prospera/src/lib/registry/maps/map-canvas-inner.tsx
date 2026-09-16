"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/registry/cn";
import { createMapAdapter } from "./create-map-adapter";
import type { MapHandle, MapMarker } from "./types";

export interface MapCanvasInnerProps {
  markers: MapMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * Client-only map surface. Instantiates the adapter from
 * `create-map-adapter` so this file stays vendor-agnostic.
 */
export function MapCanvasInner({
  markers,
  selectedId,
  onSelect,
  className,
}: MapCanvasInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<MapHandle | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const markersRef = useRef(markers);
  markersRef.current = markers;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const adapter = createMapAdapter();
    handleRef.current = adapter.mount(node, {
      markers: markersRef.current,
      selectedId: selectedRef.current,
      onSelect: (id) => onSelectRef.current?.(id),
    });
    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, []);

  useEffect(() => {
    handleRef.current?.update({ markers, selectedId });
  }, [markers, selectedId]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full min-h-[16rem] w-full", className)}
      data-slot="map-canvas"
    />
  );
}
