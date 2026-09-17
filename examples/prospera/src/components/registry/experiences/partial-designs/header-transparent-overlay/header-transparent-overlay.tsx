import {
  HeaderEnd,
  HeaderInner,
  HeaderNav,
  Header as HeaderPrimitive,
  HeaderStart,
} from "@/components/registry/primitives/core/header";

/**
 * Showcase rendering of the `header-transparent-overlay@1` stock
 * header experience.
 *
 * The Sitecore-side recipe is pure composition — header@1 Default
 * shell's `Overlay` variant hosting the logo in `header-start`,
 * the primary nav strip in `header-nav`, a primary CTA in
 * `header-end`, and a mobile drawer in `header-mobile`. This file
 * mirrors that composition inline so the showcase has a static visual
 * preview to render: a dark stand-in "hero" section with the
 * transparent, light-on-dark bar floating over it (on a live page the
 * imagery comes from the page's own first section).
 */
export function Default() {
  const navItems = [
    { label: "Products", href: "#" },
    { label: "Solutions", href: "#" },
    { label: "Resources", href: "#" },
    { label: "About", href: "#" },
  ];

  return (
    <div className="relative min-h-56 overflow-hidden rounded-md bg-gradient-to-br from-theme-black via-theme-black/90 to-primary/40">
      <HeaderPrimitive className="absolute inset-x-0 top-0 z-40 w-full bg-linear-to-b bg-transparent from-theme-black/50 to-transparent text-theme-white">
        <HeaderInner>
          <HeaderStart>
            <a
              href="/"
              className="font-heading font-semibold text-lg text-theme-white tracking-tight"
            >
              Showcase
            </a>
          </HeaderStart>
          <HeaderNav className="hidden lg:flex">
            <ul className="flex h-full flex-nowrap items-center justify-start gap-5">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="px-3 py-2 text-sm text-theme-white/90 hover:text-theme-white hover:underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </HeaderNav>
          <HeaderEnd className="hidden lg:flex">
            <a
              href="/get-started"
              className="inline-flex h-8 items-center rounded-md border border-theme-white/40 px-3 text-sm text-theme-white transition-colors hover:border-theme-white"
            >
              Get started
            </a>
          </HeaderEnd>
          <div className="flex items-center text-sm text-theme-white lg:hidden">
            ☰
          </div>
        </HeaderInner>
      </HeaderPrimitive>
      {/* Stand-in hero body so the overlay has something to float over. */}
      <div className="flex min-h-56 items-end px-6 pb-6">
        <p className="max-w-sm text-sm text-theme-white/80">
          The page's first section (a full-bleed hero) shows through the
          transparent header bar.
        </p>
      </div>
    </div>
  );
}

export default Default;
