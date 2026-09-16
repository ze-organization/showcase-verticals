"use client";

import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/registry/primitives/core/collapsible";
import { ThemeIcon } from "@/components/registry/primitives/core/theme-icon";
import { cn } from "@/lib/registry/cn";

type TreeCaretSide = "left" | "right";

const TreeContext = React.createContext<{ caretSide: TreeCaretSide }>({
  caretSide: "left",
});

function TreeRoot({
  className,
  caretSide = "left",
  ...props
}: React.ComponentProps<"ul"> & {
  /** Side on which expand/collapse carets are shown. Default "left". */
  caretSide?: TreeCaretSide;
}) {
  return (
    <TreeContext.Provider value={{ caretSide }}>
      <ul
        data-slot="tree"
        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: WAI-ARIA tree pattern — the tree container has no semantic HTML equivalent.
        role="tree"
        data-caret-side={caretSide}
        className={cn("list-none space-y-0.5", className)}
        {...props}
      />
    </TreeContext.Provider>
  );
}
TreeRoot.displayName = "Tree";

function TreeNode({
  className,
  children,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="tree-node"
      role="treeitem"
      // Roving tabindex: the node is programmatically focusable; keyboard
      // interaction is owned by the inner CollapsibleTrigger button.
      tabIndex={-1}
      className={cn("flex flex-col", className)}
      {...props}
    >
      {children}
    </li>
  );
}
TreeNode.displayName = "TreeNode";

export interface TreeTriggerProps
  extends React.ComponentProps<typeof CollapsibleTrigger> {
  /** Whether this node is expanded. */
  expanded?: boolean;
  /** Whether this node has children (shows expand icon). */
  hasChildren?: boolean;
}

function TreeTrigger({
  className,
  expanded = false,
  hasChildren = true,
  children,
  ...props
}: TreeTriggerProps) {
  const { caretSide } = React.useContext(TreeContext);
  const caret = (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center transition-transform",
        expanded && "rotate-90",
      )}
      aria-hidden
    >
      {hasChildren ? (
        <ThemeIcon name="chevron-right" className="size-4" />
      ) : (
        <span className="size-4" />
      )}
    </span>
  );
  return (
    <CollapsibleTrigger
      data-slot="tree-trigger"
      className={cn(
        "inline-flex items-center gap-2 rounded px-2 py-1.5 text-start text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      {...props}
    >
      {caretSide === "right" ? (
        <>
          {children}
          {caret}
        </>
      ) : (
        <>
          {caret}
          {children}
        </>
      )}
    </CollapsibleTrigger>
  );
}
TreeTrigger.displayName = "TreeTrigger";

function TreeContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tree-content"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}
TreeContent.displayName = "TreeContent";

function TreeChildren({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA tree pattern requires role="group" for nested treeitems; <fieldset> implies form-field grouping that does not apply.
    <ul
      data-slot="tree-children"
      role="group"
      className={cn(
        "ms-6 mt-0.5 list-none border-border border-s ps-2",
        className,
      )}
      {...props}
    />
  );
}
TreeChildren.displayName = "TreeChildren";

function TreeItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tree-item"
      className={cn(
        "flex items-center gap-2 rounded px-2 py-1.5 text-sm",
        className,
      )}
      {...props}
    />
  );
}
TreeItem.displayName = "TreeItem";

export interface TreeBranchProps {
  /** Label or trigger content. */
  label: React.ReactNode;
  /** Child nodes (rendered inside CollapsibleContent). */
  children?: React.ReactNode;
  /** Default open state. */
  defaultOpen?: boolean;
  className?: string;
}

/** Expandable tree branch: label toggles children. */
function TreeBranch({
  label,
  children,
  defaultOpen = false,
  className,
}: TreeBranchProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const hasChildren = React.Children.count(children) > 0;
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <TreeNode className={className}>
        <TreeTrigger expanded={open} hasChildren={hasChildren}>
          {label}
        </TreeTrigger>
        {hasChildren && (
          <CollapsibleContent>
            <TreeChildren>{children}</TreeChildren>
          </CollapsibleContent>
        )}
      </TreeNode>
    </Collapsible>
  );
}
TreeBranch.displayName = "TreeBranch";

export type { TreeCaretSide };

export {
  TreeBranch,
  TreeChildren,
  TreeContent,
  TreeItem,
  TreeNode,
  TreeRoot as Tree,
  TreeTrigger,
};
