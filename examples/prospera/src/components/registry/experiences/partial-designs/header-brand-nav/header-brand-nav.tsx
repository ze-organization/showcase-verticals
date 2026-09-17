import {
  HeaderEnd,
  HeaderInner,
  HeaderNav,
  Header as HeaderPrimitive,
  HeaderStart,
} from "@/components/registry/primitives/core/header";

/**
 * Showcase rendering of the `header-brand-nav@1` stock header
 * experience.
 *
 * The Sitecore-side recipe is pure composition — header@1 Default
 * (pure-placeholder shell) hosting the logo in `header-start`, the
 * primary nav strip in `header-nav`, and a mobile drawer in
 * `header-mobile`. This file mirrors that composition inline so the
 * showcase has a static visual preview to render.
 *
 * What's rendered:
 *   - Logo wordmark on the start side (mirrors the `image@1` placement
 *     bound to `site-logo-content@1`)
 *   - Five primary nav links on the desktop nav strip (mirrors the
 *     `main-nav@1` placement bound to `primary-nav-content@1`)
 *   - Get started CTA in `header-end` → `/Get-Started`
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

  return (
    <HeaderPrimitive className="border-b">
      <HeaderInner>
        <HeaderStart>
          <a
            href="/"
            className="font-heading font-semibold text-foreground text-lg tracking-tight"
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
                  className="px-3 py-2 text-foreground text-sm hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </HeaderNav>
        <HeaderEnd className="hidden lg:flex">
          <a
            href="/Get-Started"
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
          >
            Get started
          </a>
        </HeaderEnd>
        <div className="flex items-center text-muted-foreground text-sm lg:hidden">
          ☰
        </div>
      </HeaderInner>
    </HeaderPrimitive>
  );
}

export default Default;
