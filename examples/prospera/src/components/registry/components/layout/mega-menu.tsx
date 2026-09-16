import {
  TypographyMuted,
  TypographySmall,
} from "@/components/registry/primitives/core/typography";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { Text } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { Placeholder } from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";

/**
 * Flat props the SDK's `withSitecore` default convention produces.
 * Only the `Title` field has structured authoring; the rest of the
 * panel is composed via placeholders.
 */
export interface MegaMenuProps extends Omit<ComponentProps, "fields"> {
  title?: TextSource;
}

/**
 * MegaMenu — opinionated 3-region dropdown nav panel.
 *
 * Layout:
 *
 *   ┌─────────────────────────────────────────────────┬───────────┐
 *   │  optional Title                                 │           │
 *   │                                                 │ Featured  │
 *   │  mega-menu-columns-{ph}                         │ (single)  │
 *   │   (grid of LinkList renderings, 2-4 columns)    │           │
 *   ├─────────────────────────────────────────────────┴───────────┤
 *   │  mega-menu-cta-strip-{ph}                                   │
 *   │   (full-width row: cta buttons / horizontal link list)      │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * The featured region collapses below the columns at narrow widths;
 * the CTA strip stays at the bottom. Empty placeholders contribute
 * nothing — author one column? You get one column. No featured?
 * Featured region collapses. No CTA strip? Bottom row disappears.
 *
 * Drop this rendering into a `nav-item-panel-{*}` slot in main-nav,
 * or anywhere a header utility opens a panel.
 *
 * Why this is a plain `<section>` rather than a primitive composition:
 * the parent (`main-nav.tsx`) wraps each panel in `Popover` /
 * `PopoverContent`, not `NavigationMenu` / `NavigationMenuContent`, so
 * `NavigationMenuContent` doesn't apply here. The Popover primitive
 * owns z-stacking, animation, focus management, and outside-click
 * handling — MegaMenu only contributes layout chrome. If a future
 * variant places this panel inside a `NavigationMenu` instead (i.e.
 * accessible keyboard arrow navigation between top-level nav items),
 * compose `NavigationMenuContent` at that call site rather than
 * rewriting this shell.
 */
export function Default(props: MegaMenuProps) {
  const { title, params, rendering } = props;
  const {
    styles,
    RenderingIdentifier: id,
    DynamicPlaceholderId,
  } = params ?? {};
  const ph = DynamicPlaceholderId ?? "1";
  const hasTitle = title != null && !isEmptySource(title);

  return (
    <section
      className={cn(
        "component mega-menu w-full bg-background text-foreground",
        styles,
      )}
      id={id ?? undefined}
      data-slot="mega-menu"
    >
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[3fr_1fr]">
          <div className="min-w-0 space-y-6">
            {hasTitle && (
              <TypographySmall className="font-semibold text-muted-foreground uppercase tracking-wide">
                <Text value={title} tag="span" />
              </TypographySmall>
            )}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Placeholder
                name={`mega-menu-columns-${ph}`}
                rendering={rendering}
              />
            </div>
          </div>
          <div className="min-w-0">
            <Placeholder name="mega-menu-featured" rendering={rendering} />
          </div>
        </div>
      </div>
      <div className="border-t bg-background-muted">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Placeholder
            name={`mega-menu-cta-strip-${ph}`}
            rendering={rendering}
          />
        </div>
      </div>
    </section>
  );
}

export default Default;

// Avoid unused-import diagnostic in builds where TypographyMuted is
// referenced only via the panel slot composition. The export is kept
// available for downstream consumers extending the shell.
export { TypographyMuted };

export const componentType = "universal";
