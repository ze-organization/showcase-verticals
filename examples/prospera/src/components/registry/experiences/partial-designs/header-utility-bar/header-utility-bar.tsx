import {
  HeaderEnd,
  HeaderInner,
  HeaderNav,
  Header as HeaderPrimitive,
  HeaderStart,
} from "@/components/registry/primitives/core/header";

/**
 * Showcase rendering of the `header-utility-bar@1` stock header
 * experience.
 *
 * The Sitecore-side recipe is pure composition — header@1 Default
 * shell with an always-visible menu trigger + brand in `header-start`
 * and an inline search affordance + phone CTA in `header-end`. This
 * file mirrors that composition inline so the showcase has a static
 * visual preview to render.
 *
 * Mirrors the recipe's stage-1 fidelity notes: the menu trigger
 * renders at every viewport width (it lives in the always-visible
 * start slot, mirroring the `mobile-menu@1` Drawer placement) and is
 * icon-only — the field-driven Utility shell variant's visible "Menu"
 * label is not expressible as composition today.
 */
export function Default() {
  return (
    <HeaderPrimitive className="border-b">
      <HeaderInner>
        <HeaderStart className="gap-3">
          <button
            type="button"
            aria-label="Open menu"
            className="flex items-center rounded-md border px-2.5 py-2 text-foreground text-sm hover:bg-muted"
          >
            ☰
          </button>
          <a
            href="/"
            className="font-heading font-semibold text-foreground text-lg tracking-tight"
          >
            Showcase
          </a>
        </HeaderStart>
        <HeaderNav className="hidden lg:flex" />
        <HeaderEnd className="hidden gap-3 lg:flex">
          <span className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-muted-foreground text-sm">
            <span aria-hidden>⌕</span>
            Search
          </span>
          <a
            href="tel:+18005550123"
            className="rounded-md border px-4 py-2 font-medium text-foreground text-sm hover:bg-muted"
          >
            ☎ Call us
          </a>
        </HeaderEnd>
      </HeaderInner>
    </HeaderPrimitive>
  );
}

export default Default;
