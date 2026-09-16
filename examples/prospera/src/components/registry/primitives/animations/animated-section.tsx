"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDirection } from "@/hooks/registry/use-direction";
import { cn } from "@/lib/registry/cn";

export type AnimatedSectionDirection = "up" | "down" | "start" | "end";
export type AnimatedSectionType = "slide" | "rotate";

export interface AnimatedSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Slide direction when animationType is "slide" */
  direction?: AnimatedSectionDirection;
  /** Distance to slide in rem */
  distanceInRem?: number;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation duration (ms) */
  duration?: number;
  animationType?: AnimatedSectionType;
  /** End rotation in degrees when animationType is "rotate" */
  endRotation?: number;
  /** IntersectionObserver threshold (0–1) */
  threshold?: number;
  /** Disable animation (e.g. prefers-reduced-motion) */
  reducedMotion?: boolean;
  /** When true, show content immediately (e.g. page editing) */
  isPageEditing?: boolean;
}

// LTR-baseline initial offsets. `start` slides toward inline-start
// (in LTR: visually leftward → starts to the right of its final
// position, so positive x). `end` is the inverse. In RTL the x sign
// flips at render time so the animation visually mirrors with the
// reading direction.
const directionTransforms: Record<
  AnimatedSectionDirection,
  { x: string; y: string }
> = {
  up: { x: "0", y: "1rem" },
  down: { x: "0", y: "-1rem" },
  start: { x: "1rem", y: "0" },
  end: { x: "-1rem", y: "0" },
};

type StyleInputs = {
  visible: boolean;
  reducedMotion: boolean;
  isPageEditing: boolean;
  direction: AnimatedSectionDirection;
  distanceInRem: number;
  delay: number;
  duration: number;
  animationType: AnimatedSectionType;
  endRotation: number;
  dir: string;
};

const buildTransition = ({
  duration,
  delay,
  animationType,
}: Pick<StyleInputs, "duration" | "delay" | "animationType">): string =>
  `transform ${duration}ms ${delay}ms ease-out${animationType === "slide" ? `, opacity ${duration}ms ${delay}ms ease-out` : ""}`;

const buildRotateStyle = (
  inputs: StyleInputs,
  transition: string,
): React.CSSProperties => ({
  transform: inputs.visible
    ? `rotate(${inputs.endRotation}deg)`
    : "rotate(0deg)",
  transition:
    inputs.reducedMotion || inputs.isPageEditing ? "none" : transition,
});

const buildSlideStyle = (
  inputs: StyleInputs,
  transition: string,
): React.CSSProperties => {
  const d = directionTransforms[inputs.direction];
  // Flip the X sign for inline-axis animations under RTL so a
  // `direction="end"` slide visually originates from the start side
  // (inline-end in RTL = visual left) and lands at its final
  // position, mirroring the reading direction.
  const xSign =
    (inputs.direction === "start" || inputs.direction === "end") &&
    inputs.dir === "rtl"
      ? -1
      : 1;
  const translateX = `${Number.parseFloat(d.x) * inputs.distanceInRem * xSign}rem`;
  const translateY = `${Number.parseFloat(d.y) * inputs.distanceInRem}rem`;
  return {
    transform: inputs.visible
      ? "translate(0, 0)"
      : `translate(${translateX}, ${translateY})`,
    opacity: inputs.reducedMotion || inputs.visible ? 1 : 0,
    transition:
      inputs.reducedMotion || inputs.isPageEditing ? "none" : transition,
  };
};

const buildAnimatedStyle = (inputs: StyleInputs): React.CSSProperties => {
  const transition = buildTransition(inputs);
  return inputs.animationType === "rotate"
    ? buildRotateStyle(inputs, transition)
    : buildSlideStyle(inputs, transition);
};

export function AnimatedSection({
  children,
  className,
  direction = "up",
  distanceInRem = 2,
  delay = 0,
  duration = 1000,
  animationType = "slide",
  endRotation = 180,
  threshold = 0.3,
  reducedMotion = false,
  isPageEditing = false,
  ...props
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dir = useDirection();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setIsVisible(true);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const visible = isPageEditing || reducedMotion || isVisible;

  const style = useMemo(
    () =>
      buildAnimatedStyle({
        visible,
        reducedMotion,
        isPageEditing,
        direction,
        distanceInRem,
        delay,
        duration,
        animationType,
        endRotation,
        dir,
      }),
    [
      visible,
      reducedMotion,
      isPageEditing,
      direction,
      distanceInRem,
      delay,
      duration,
      animationType,
      endRotation,
      dir,
    ],
  );

  return (
    <div
      ref={ref}
      className={cn("animated-section", className)}
      style={style}
      data-slot="animated-section"
      {...props}
    >
      {children}
    </div>
  );
}
