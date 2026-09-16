import { Horizontal as LinkListHorizontal } from "@/components/registry/components/navigation/link-list";

/**
 * Showcase rendering of the `footer-bands@1` stock footer experience.
 *
 * The Sitecore-side recipe is pure composition — footer@1's `Bands`
 * variant with four `section-wrapper@1` bands inside it. This file
 * mirrors that composition so the showcase has a static preview.
 *
 * The point of the preview is the RHYTHM: the four bands deliberately
 * run at four different heights (py-4 / py-8 / py-14 / py-4, mirroring
 * the recipe's sm / md / xl / sm), separated by full-bleed rules. A
 * uniform gap here would reproduce exactly the flaw the Bands variant
 * exists to fix — so if this preview ever starts looking evenly spaced,
 * the composition has regressed.
 */
const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com/acme" },
  { label: "Instagram", href: "https://instagram.com/acme" },
  { label: "YouTube", href: "https://youtube.com/@acme" },
];

const APP_LINKS = [
  {
    label: "Download on the App Store",
    href: "https://apps.apple.com/app/id0",
  },
  {
    label: "Get it on Google Play",
    href: "https://play.google.com/store/apps/details?id=com.acme",
  },
];

// Real paths, not `href="#"` — the placeholder anchor trips
// `lint/a11y/useValidAnchor`, and these mirror the actual link-list
// datasources (footer-column-*@1) which carry real destinations.
const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Products", href: "/Products" },
      { label: "Offers", href: "/Offers" },
      { label: "Pricing", href: "/Pricing" },
      { label: "Services", href: "/Services" },
      { label: "Solutions", href: "/Solutions" },
      { label: "Destinations", href: "/Destinations" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/About" },
      { label: "Leadership", href: "/Leadership" },
      { label: "People", href: "/People" },
      { label: "Careers", href: "/Careers" },
      { label: "Partners", href: "/Partners" },
      { label: "Locations", href: "/Locations" },
      { label: "Contact", href: "/Contact" },
      { label: "Get Started", href: "/Get-Started" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Articles", href: "/Articles" },
      { label: "News", href: "/News" },
      { label: "Case Studies", href: "/Case-Studies" },
      { label: "Events", href: "/Events" },
      { label: "Documentation", href: "/Documentation" },
      { label: "Support", href: "/Support" },
      { label: "FAQs", href: "/FAQs" },
      { label: "Search", href: "/Search" },
      { label: "Landing Pages", href: "/Landing-Pages" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/Privacy" },
      { label: "Terms", href: "/Terms" },
      { label: "Accessibility", href: "/Accessibility" },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/Privacy" },
  { label: "Terms", href: "/Terms" },
  { label: "Accessibility", href: "/Accessibility" },
];

// Bare envelope for the programmatic render path (the link-list
// contract requires the CMS trio even when items are inline).
const mockRendering = { componentName: "LinkList" } as never;

export function Default() {
  return (
    <footer className="component footer relative w-full divide-y divide-border overflow-hidden bg-background-muted text-foreground">
      {/* Band 1 — tagline. The shallowest band. */}
      <div className="container mx-auto px-4 py-4">
        <p className="text-center font-medium text-foreground text-sm tracking-wide">
          Building better products, together.
        </p>
      </div>

      {/* Band 2 — social profiles + app-store badges. */}
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-8">
        <LinkListHorizontal
          params={{}}
          rendering={mockRendering}
          fields={{}}
          items={SOCIAL_LINKS}
          displayOptions={{ showTitle: false, itemStyle: "social-icon" }}
        />
        <LinkListHorizontal
          params={{}}
          rendering={mockRendering}
          fields={{}}
          items={APP_LINKS}
          displayOptions={{ showTitle: false, itemStyle: "app-badge" }}
        />
      </div>

      {/* Band 3 — the link tree. Tallest by a wide margin. */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.heading} className="flex min-w-0 flex-col gap-3">
              <h3 className="font-semibold text-foreground text-sm">
                {column.heading}
              </h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-muted-foreground text-sm hover:text-foreground hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Band 4 — copyright + legal. Back to a slim band. */}
      <div className="container mx-auto flex flex-col items-start justify-between gap-3 px-4 py-4 md:flex-row md:items-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Acme Corp. All rights reserved.
        </p>
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {LEGAL_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-muted-foreground text-sm hover:text-foreground hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

export default Default;
