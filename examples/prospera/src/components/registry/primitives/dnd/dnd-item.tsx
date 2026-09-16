"use client";

import { type UniqueIdentifier, useDraggable } from "@dnd-kit/core";
import {
  type AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as React from "react";

import { cn } from "@/lib/registry/cn";
import { useDndMounted } from "./dnd-context";

type DndListeners = ReturnType<typeof useDraggable>["listeners"];
type DndAttributes = ReturnType<typeof useDraggable>["attributes"];

type DndItemBaseProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  setNodeRef?: (node: HTMLElement | null) => void;
  listeners?: DndListeners;
  attributes?: DndAttributes;
};

function DndItemBase({
  as: Component = "div",
  setNodeRef,
  listeners,
  attributes,
  className,
  children,
  ...props
}: DndItemBaseProps) {
  return (
    <Component
      ref={setNodeRef}
      className={className}
      {...listeners}
      {...attributes}
      {...props}
    >
      {children}
    </Component>
  );
}

type DndItemClassNameProps = {
  className?: string;
  isDragging?: boolean;
  isOver?: boolean;
  disabled?: boolean;
  withHandle?: boolean;
  touchNone?: boolean;
};

function getDndItemClassName({
  className,
  isDragging,
  isOver,
  disabled,
  withHandle,
  touchNone,
}: DndItemClassNameProps) {
  return cn(
    touchNone && "touch-none",
    isDragging && "opacity-50 z-50",
    !disabled && !withHandle && "cursor-grab",
    isDragging && "cursor-grabbing",
    isOver && "ring-2 ring-primary",
    disabled && "cursor-not-allowed opacity-60",
    className,
  );
}

export interface DraggableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "id"> {
  /** Unique identifier for this draggable item */
  id: UniqueIdentifier;
  /** Whether dragging is disabled */
  disabled?: boolean;
  /** Optional data to pass along with drag events */
  data?: Record<string, unknown>;
  /** Element type to render (default: div) */
  as?: React.ElementType;
  children: React.ReactNode;
  /**
   * Required for screen-reader users. dnd-kit announces "Picked up
   * draggable item ${aria-label}" on activation; without one, all items
   * sound identical. Example: aria-label="Hero section".
   */
  "aria-label"?: string;
}

function DraggableInner({
  id,
  disabled = false,
  data,
  children,
  className,
  as: Component = "div",
  style,
  ...props
}: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled,
      data,
    });

  const resolvedStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    ...style,
  };

  return (
    <DndItemBase
      as={Component}
      setNodeRef={setNodeRef}
      style={resolvedStyle}
      data-draggable-id={id}
      data-dragging={isDragging}
      className={getDndItemClassName({ isDragging, disabled, className })}
      listeners={listeners}
      attributes={attributes}
      {...props}
    >
      {children}
    </DndItemBase>
  );
}

export function Draggable({
  children,
  className,
  as: Component = "div",
  id,
  disabled,
  data,
  ...props
}: DraggableProps) {
  const isMounted = useDndMounted();

  // Render static version on server
  if (!isMounted) {
    return (
      <Component className={className} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <DraggableInner
      className={className}
      as={Component}
      id={id}
      disabled={disabled}
      data={data}
      {...props}
    >
      {children}
    </DraggableInner>
  );
}

export interface DraggableHandleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Use this component to create a drag handle within a Draggable.
 * Pass the listeners and attributes from useDraggable to this component.
 */
export function DraggableHandle({
  children,
  className,
  ...props
}: DraggableHandleProps) {
  return (
    <div
      className={cn("cursor-grab active:cursor-grabbing", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Context for passing sortable props to handles
interface SortableContextValue {
  listeners: ReturnType<typeof useSortable>["listeners"];
  attributes: ReturnType<typeof useSortable>["attributes"];
  isDragging: boolean;
  isMounted: boolean;
}

// Default context value for server-side rendering
const defaultContextValue: SortableContextValue = {
  listeners: undefined,
  attributes: {} as ReturnType<typeof useSortable>["attributes"],
  isDragging: false,
  isMounted: false,
};

const SortableItemContext =
  React.createContext<SortableContextValue>(defaultContextValue);

export interface SortableItemProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "id"> {
  /** Unique identifier for this sortable item */
  id: UniqueIdentifier;
  /** Whether sorting is disabled for this item */
  disabled?: boolean;
  /** Optional data to pass along with drag events */
  data?: Record<string, unknown>;
  /** Element type to render (default: div) */
  as?: React.ElementType;
  /** Whether to use a handle (if true, spreading listeners won't make the whole element draggable) */
  withHandle?: boolean;
  children: React.ReactNode;
  /**
   * Required for screen-reader users. dnd-kit announces "Picked up
   * sortable item ${aria-label}" on activation; without one, all items
   * sound identical. Example: aria-label="Row 3, Product card".
   */
  "aria-label"?: string;
}

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function SortableItemInner({
  id,
  disabled = false,
  data,
  children,
  className,
  as: Component = "div",
  withHandle = false,
  style,
  ...props
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id,
    disabled,
    data,
    animateLayoutChanges,
  });

  const resolvedStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...style,
  };

  // If using a handle, don't spread listeners on the container
  const containerListeners = withHandle ? undefined : listeners;

  // Context value for child handles
  const contextValue = React.useMemo(
    () => ({ listeners, attributes, isDragging, isMounted: true }),
    [listeners, attributes, isDragging],
  );

  return (
    <SortableItemContext.Provider value={contextValue}>
      <DndItemBase
        as={Component}
        setNodeRef={setNodeRef}
        style={resolvedStyle}
        data-sortable-id={id}
        data-dragging={isDragging}
        data-over={isOver}
        className={getDndItemClassName({
          className,
          isDragging,
          isOver,
          disabled,
          withHandle,
          touchNone: true,
        })}
        listeners={containerListeners}
        attributes={attributes}
        {...props}
      >
        {children}
      </DndItemBase>
    </SortableItemContext.Provider>
  );
}

export function SortableItem({
  children,
  className,
  as: Component = "div",
  id,
  disabled,
  data,
  withHandle,
  ...props
}: SortableItemProps) {
  const isMounted = useDndMounted();

  // Render static version on server with default context
  if (!isMounted) {
    return (
      <SortableItemContext.Provider value={defaultContextValue}>
        <Component className={className} {...props}>
          {children}
        </Component>
      </SortableItemContext.Provider>
    );
  }

  return (
    <SortableItemInner
      className={className}
      as={Component}
      id={id}
      disabled={disabled}
      data={data}
      withHandle={withHandle}
      {...props}
    >
      {children}
    </SortableItemInner>
  );
}

/**
 * Hook to get sortable listeners and attributes for a custom drag handle.
 * Must be used within a SortableItem with withHandle={true}.
 */
export function useSortableItemContext() {
  return React.useContext(SortableItemContext);
}

export interface SortableHandleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

/**
 * A component that serves as the drag handle within a SortableItem.
 * Must be used within a SortableItem with withHandle={true}.
 */
export function SortableHandle({
  children,
  className,
  as: Component = "div",
  ...props
}: SortableHandleProps) {
  const { listeners, attributes, isDragging, isMounted } =
    useSortableItemContext();

  // Render static version when not mounted
  if (!isMounted) {
    return (
      <Component className={cn("cursor-grab touch-none", className)} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={cn(
        "cursor-grab touch-none",
        isDragging && "cursor-grabbing",
        className,
      )}
      {...listeners}
      {...attributes}
      {...props}
    >
      {children}
    </Component>
  );
}

// Re-export hooks/utilities for convenience
export { useDraggable } from "@dnd-kit/core";
export { useSortable } from "@dnd-kit/sortable";
export { CSS } from "@dnd-kit/utilities";
