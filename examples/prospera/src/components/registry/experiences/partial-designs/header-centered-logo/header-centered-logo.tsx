import {
  HeaderEnd,
  Header as HeaderPrimitive,
} from "@/components/registry/primitives/core/header";

/**
 * Showcase rendering of the `header-centered-logo@1` stock header
 * experience.
 *
 * The Sitecore-side recipe is pure composition — header@1 Default
 * shell's `CenteredStack` variant: the brand centered on its
 * own row (end cluster pinned to the row's inline end), the nav strip
 * centered on a bordered row below. This file mirrors that Stage 2
 * arrangement inline so the showcase has a static visual preview to
 * render — the previous mirror still showed the Stage 1 single
 * start/nav/end bar, i.e. a "Centered Logo" card whose logo was not
 * centered.
 */
export function Default() {
  const navItems = [
    { label: "Products", href: "#" },
    { label: "Solutions", href: "#" },
    { label: "Resources", href: "#" },
    { label: "About", href: "#" },
  ];

  return (
    <HeaderPrimitive className="border-b">
      {/* Brand row: brand centered; utility cluster pinned inline-end. */}
      <div className="container relative mx-auto flex min-h-16 items-center justify-center px-4 py-3">
        <a
          href="/"
          className="font-heading font-semibold text-foreground text-xl tracking-tight"
        >
          Showcase
        </a>
        <HeaderEnd className="absolute end-4 top-1/2 hidden -translate-y-1/2 gap-4 md:flex">
          <span className="text-muted-foreground text-sm">EN ▾</span>
          <a
            href="/account"
            className="text-foreground text-sm hover:underline"
          >
            Log in
          </a>
        </HeaderEnd>
        <div className="absolute end-4 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground text-sm md:hidden">
          ☰
        </div>
      </div>
      {/* Nav row: centered on a bordered row below the brand. */}
      <div className="hidden border-t md:block">
        <div className="container mx-auto flex items-center justify-center gap-6 px-4">
          <ul className="flex flex-wrap items-center justify-center gap-5">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="px-3 py-2 text-foreground text-sm hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </HeaderPrimitive>
  );
}

export default Default;
