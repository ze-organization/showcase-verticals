import { Horizontal as LinkListHorizontal } from "@/components/registry/components/navigation/link-list";

/**
 * Showcase rendering of the `footer-brand-social@1` stock footer
 * experience.
 *
 * The Sitecore-side recipe is pure composition — footer@1 TwoTier with
 * a 2-column splitter in `footer-main` (logo + blurb | social links +
 * app badges) and the copyright line in `footer-bottom`. This file
 * mirrors that composition for the showcase, REUSING the real
 * link-list Horizontal variant twice: `itemStyle: "social-icon"`
 * (URL-host icon resolution) for the follow row, and
 * `itemStyle: "app-badge"` (URL-host store resolution) for the
 * download row beneath it.
 *
 * The two rows are deliberately separate lists, not one merged row:
 * social profiles and store links are different calls to action, and
 * the badge shape is a fixed-height mark that would fight the icon
 * row's rhythm if interleaved.
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

// Bare envelope for the programmatic render path (the link-list
// contract requires the CMS trio even when items are inline).
const mockRendering = { componentName: "LinkList" } as never;

export function Default() {
  return (
    <footer className="component footer relative w-full divide-y divide-border overflow-hidden bg-background-muted text-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
          <div className="flex min-w-0 flex-col gap-5">
            <a
              href="/"
              className="font-heading font-semibold text-foreground text-lg tracking-tight"
            >
              Acme Corp
            </a>
            <p className="max-w-sm text-muted-foreground text-sm">
              Build, ship, and grow. Tools for teams that move fast and care
              about craft.
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-6 md:items-end">
            <div className="flex min-w-0 flex-col gap-3 md:items-end">
              <h3 className="font-semibold text-foreground text-sm">
                Follow us
              </h3>
              <LinkListHorizontal
                params={{}}
                rendering={mockRendering}
                fields={{}}
                items={SOCIAL_LINKS}
                displayOptions={{ showTitle: false, itemStyle: "social-icon" }}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-3 md:items-end">
              <h3 className="font-semibold text-foreground text-sm">
                Get the app
              </h3>
              <LinkListHorizontal
                params={{}}
                rendering={mockRendering}
                fields={{}}
                items={APP_LINKS}
                displayOptions={{ showTitle: false, itemStyle: "app-badge" }}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="container mx-auto px-4 py-4 md:py-5">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Acme Corp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Default;
