"use client";

import { Share2, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  buttonVariants,
} from "@/components/registry/primitives/core/button";
import { cn } from "@/lib/registry/cn";

/** Minimum touch target; use px so size is not affected by ancestor font-size. */
const MOBILE_TRIGGER_PX = 48;
const MOBILE_ICON_PX = 24;

export interface FloatingDockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
}

export interface FloatingDockProps {
  items: FloatingDockItem[];
  displayOptions?: {
    /** Controls responsive rendering mode for CMS/preview usage. */
    mode?: "auto" | "mobile" | "desktop";
    /**
     * Render the mobile dock's item menu already open. Preview seam
     * only — the menu is state-gated and renders nothing until tapped,
     * so a static preview paints a bare trigger and the dock items can
     * never be seen or measured.
     */
    defaultMenuOpen?: boolean;
  };
  styleOptions?: {
    desktopClassName?: string;
    mobileClassName?: string;
  };
}

const iconWrapperClass =
  "inline-flex size-5 shrink-0 items-center justify-center [&>svg]:size-5 [&>svg]:shrink-0";

export function FloatingDock({
  items,
  displayOptions,
  styleOptions,
}: FloatingDockProps) {
  const mode = displayOptions?.mode ?? "auto";
  const showDesktop = mode === "desktop" || mode === "auto";
  const showMobile = mode === "mobile" || mode === "auto";

  return (
    <div className="contents">
      {showDesktop && (
        <FloatingDockDesktop
          items={items}
          className={styleOptions?.desktopClassName}
        />
      )}
      {showMobile && (
        <FloatingDockMobile
          items={items}
          className={styleOptions?.mobileClassName}
          isForcedMobile={mode === "mobile"}
          defaultOpen={displayOptions?.defaultMenuOpen}
        />
      )}
    </div>
  );
}

function FloatingDockDesktop({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mx-auto h-auto w-fit flex-col items-center gap-3 rounded-2xl border border-border/60 bg-background/90 px-2 py-3 shadow-lg backdrop-blur-sm",
        "hidden md:flex",
        className,
      )}
      aria-label="Share options"
    >
      {items.map((item) => (
        <Button
          key={item.title}
          asChild
          variant="ghost"
          size="icon"
          colorScheme="neutral"
          className="rounded-full bg-muted/60 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={item.title}
        >
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={item.onClick}
          >
            <span className={iconWrapperClass}>{item.icon}</span>
          </a>
        </Button>
      ))}
    </section>
  );
}

function FloatingDockMobile({
  items,
  className,
  isForcedMobile = false,
  defaultOpen,
}: {
  items: FloatingDockItem[];
  className?: string;
  isForcedMobile?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);
  const toggleMenu = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (open && firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, [open]);

  const triggerIcon = useMemo(
    () =>
      open ? (
        <X
          aria-hidden
          style={{
            width: MOBILE_ICON_PX,
            height: MOBILE_ICON_PX,
            flexShrink: 0,
          }}
        />
      ) : (
        <Share2
          aria-hidden
          style={{
            width: MOBILE_ICON_PX,
            height: MOBILE_ICON_PX,
            flexShrink: 0,
          }}
        />
      ),
    [open],
  );

  return (
    <section
      className={cn(
        "relative z-50 shrink-0",
        "block md:hidden",
        isForcedMobile && "md:block",
        className,
      )}
      style={{ minWidth: MOBILE_TRIGGER_PX }}
      aria-label="Share menu"
    >
      {open && (
        <>
          <div className="absolute inset-x-0 bottom-full z-50 mb-2 flex min-w-10 flex-col items-center gap-2">
            {items.map((item, index) => (
              <Button
                key={item.title}
                asChild
                variant="ghost"
                size="icon"
                colorScheme="neutral"
                className="shrink-0 rounded-full border border-border/60 bg-background/95 shadow-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={item.title}
              >
                <a
                  ref={index === 0 ? firstItemRef : undefined}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    item.onClick?.();
                    closeMenu();
                  }}
                >
                  <span className={iconWrapperClass}>{item.icon}</span>
                </a>
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            colorScheme="neutral"
            className="fixed inset-0 z-40 h-full min-h-0 w-full min-w-0 rounded-none bg-black/20 backdrop-blur-sm hover:bg-black/20"
            onClick={closeMenu}
            aria-label="Close menu"
          />
        </>
      )}
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: "icon",
            colorScheme: "neutral",
            className:
              "shrink-0 rounded-full border border-border/60 bg-background/90 shadow-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          }),
        )}
        style={{
          width: MOBILE_TRIGGER_PX,
          height: MOBILE_TRIGGER_PX,
          minWidth: MOBILE_TRIGGER_PX,
          minHeight: MOBILE_TRIGGER_PX,
          flexShrink: 0,
        }}
        onClick={toggleMenu}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? "Close share menu" : "Open share menu"}
      >
        <span
          className="inline-flex shrink-0 items-center justify-center [&>svg]:shrink-0"
          style={{
            width: MOBILE_ICON_PX,
            height: MOBILE_ICON_PX,
            minWidth: MOBILE_ICON_PX,
            minHeight: MOBILE_ICON_PX,
          }}
        >
          {triggerIcon}
        </span>
      </button>
    </section>
  );
}
