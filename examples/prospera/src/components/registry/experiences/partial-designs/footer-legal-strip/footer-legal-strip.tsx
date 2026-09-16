import { InlineSeparated as LinkListInlineSeparated } from "@/components/registry/components/navigation/link-list";

/**
 * Showcase rendering of the `footer-legal-strip@1` stock footer
 * experience.
 *
 * The Sitecore-side recipe is pure composition — footer@1 Default
 * (single tier, small padding) hosting a 2-column splitter with the
 * copyright line and an InlineSeparated legal-links row. This file
 * mirrors that composition for the showcase, REUSING the real
 * link-list InlineSeparated variant for the legal row.
 */
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
    <footer className="component footer relative w-full overflow-hidden bg-background-muted text-foreground">
      <div className="container mx-auto flex flex-col items-start justify-between gap-3 px-4 py-4 md:flex-row md:items-center">
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
    </footer>
  );
}

export default Default;
