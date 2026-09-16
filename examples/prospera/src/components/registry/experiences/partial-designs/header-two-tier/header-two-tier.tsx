import {
  HeaderEnd,
  HeaderInner,
  HeaderNav,
  Header as HeaderPrimitive,
  HeaderStart,
} from "@/components/registry/primitives/core/header";

/**
 * Showcase rendering of the `header-two-tier@1` stock header
 * experience.
 *
 * The Sitecore-side recipe is pure composition — header@1's TwoTier
 * variant with the language switcher + utility links on the desktop
 * utility tier (`header-utility-end`), logo / nav / primary CTA on the
 * main bar, and a mobile drawer. This file mirrors that composition
 * inline so the showcase has a static visual preview to render.
 *
 * What's rendered:
 *   - Utility tier on its own tinted band: locale label + Support /
 *     Contact links
 *     (mirrors `language-switcher@1` + `link-list@1` UtilityBar bound
 *     to `header-utility-content@1`)
 *   - Logo wordmark, primary nav links, and a "Get started" CTA on
 *     the main bar (mirrors `image@1` / `main-nav@1` / `cta-button@1`)
 *   - A hamburger affordance below the breakpoint (mirrors the
 *     `mobile-menu@1` Drawer placement)
 */
export function Default() {
  const navItems = [
    { label: "Products", href: "/Products" },
    { label: "Solutions", href: "/Solutions" },
    { label: "Destinations", href: "/Destinations" },
    { label: "Resources", href: "/Resources" },
    { label: "Company", href: "/About" },
  ];
  const utilityLinks = [
    { label: "Support", href: "/Support" },
    { label: "Contact", href: "/Contact" },
  ];

  return (
    <HeaderPrimitive className="border-b">
      {/* The TwoTier variant's own tinted band (`bg-muted`), not the
          Standard variant's bordered strip — that is what makes the two
          rows read as distinct rows rather than one taller bar. */}
      <div
        className="hidden bg-muted text-sm md:block"
        data-slot="header-utility-tier"
      >
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2">
          <div className="flex min-w-0 flex-wrap items-center gap-3" />
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span className="text-muted-foreground text-xs">EN ▾</span>
            {utilityLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-muted-foreground text-xs hover:text-foreground hover:underline"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <HeaderInner>
        <HeaderStart>
          <a
            href="/"
            className="font-heading font-semibold text-foreground text-lg tracking-tight"
          >
            Showcase
          </a>
        </HeaderStart>
        <HeaderNav className="hidden md:flex">
          <ul className="flex h-full flex-wrap items-center justify-start gap-5">
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
        </HeaderNav>
        <HeaderEnd className="hidden md:flex">
          <a
            href="/Get-Started"
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
          >
            Get started
          </a>
        </HeaderEnd>
        <div className="flex items-center text-muted-foreground text-sm md:hidden">
          ☰
        </div>
      </HeaderInner>
    </HeaderPrimitive>
  );
}

export default Default;
