import {
  Default as LinkListColumn,
  InlineSeparated as LinkListInlineSeparated,
} from "@/components/registry/components/navigation/link-list";

/**
 * Showcase rendering of the `footer-link-columns@1` stock footer
 * experience.
 *
 * The Sitecore-side recipe is pure composition — footer@1 TwoTier with
 * a grouped link-list MultiColumn in `footer-main` and copyright +
 * InlineSeparated legal links in `footer-bottom`. This file mirrors
 * that composition for the showcase, REUSING the real link-list
 * variants (programmatic props) inside the shell's TwoTier chrome
 * (divide-border tier hairline, narrow second row) rather than
 * re-implementing link markup.
 */
const COLUMNS: Array<{
  title: string;
  items: Array<{ label: string; href: string }>;
}> = [
  {
    title: "Product",
    items: [
      { label: "Products", href: "/Products" },
      { label: "Offers", href: "/Offers" },
      { label: "Pricing", href: "/Pricing" },
      { label: "Services", href: "/Services" },
      { label: "Solutions", href: "/Solutions" },
      { label: "Destinations", href: "/Destinations" },
    ],
  },
  {
    title: "Company",
    items: [
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
    title: "Resources",
    items: [
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
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid min-w-0 gap-10 sm:grid-cols-2 md:grid-cols-3">
          {COLUMNS.map((column) => (
            <LinkListColumn
              key={column.title}
              params={{}}
              rendering={mockRendering}
              fields={{}}
              title={column.title}
              items={column.items}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="container mx-auto flex flex-col items-start justify-between gap-4 px-4 py-4 md:flex-row md:items-center md:py-5">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Acme Corp. All rights reserved.
          </p>
          <LinkListInlineSeparated
            params={{}}
            rendering={mockRendering}
            fields={{}}
            items={LEGAL_LINKS}
            displayOptions={{ showTitle: false }}
          />
        </div>
      </div>
    </footer>
  );
}

export default Default;
