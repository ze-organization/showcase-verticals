"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/registry/cn";

export interface CardSpotlightProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Radius of the spotlight in px */
  radius?: number;
  /** Spotlight color (e.g. rgba(255,255,255,0.1)) */
  color?: string;
  /** Disable spotlight (e.g. prefers-reduced-motion) */
  prefersReducedMotion?: boolean;
}

export function CardSpotlight({
  children,
  radius = 350,
  color = "rgba(255, 255, 255, 0.1)",
  prefersReducedMotion = false,
  className,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}: CardSpotlightProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const frameRef = useRef<number | null>(null);
  const nextMouseRef = useRef({ x: 0, y: 0 });

  const isSpotlightVisible = !prefersReducedMotion && (isHovering || isFocused);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseMove?.(e);
      if (prefersReducedMotion || !isSpotlightVisible) return;
      const rect = e.currentTarget.getBoundingClientRect();
      nextMouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      if (frameRef.current != null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        setMouse(nextMouseRef.current);
        frameRef.current = null;
      });
    },
    [onMouseMove, prefersReducedMotion, isSpotlightVisible],
  );

  useEffect(() => {
    return () => {
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const maskStyle = useMemo(() => {
    if (!isSpotlightVisible) return { opacity: 0 };
    const gradient = `radial-gradient(${radius}px circle at ${mouse.x}px ${mouse.y}px, white, transparent 80%)`;
    return {
      opacity: 1,
      backgroundColor: color,
      WebkitMaskImage: gradient,
      maskImage: gradient,
    } as React.CSSProperties;
  }, [isSpotlightVisible, mouse, radius, color]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the pointer/focus handlers only drive a decorative spotlight effect — this is a presentational wrapper, not an interactive control, so no ARIA role applies.
    <div
      className={cn(
        "group relative h-full self-stretch rounded-default bg-secondary transition-all duration-400",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => {
        setIsHovering(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovering(false);
        onMouseLeave?.(e);
      }}
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur?.(e);
      }}
      data-slot="card-spotlight"
      {...props}
    >
      {!prefersReducedMotion && (
        <div
          className="pointer-events-none absolute -inset-px z-0 rounded-[inherit] transition duration-300"
          style={maskStyle}
          aria-hidden
        />
      )}
      <div className="relative z-10 flex h-full w-full transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
