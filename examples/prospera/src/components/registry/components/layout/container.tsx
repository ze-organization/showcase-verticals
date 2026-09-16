import { cn } from "@/lib/registry/cn";
import { extractMediaUrl } from "@/lib/registry/extract-media-url";
import {
  resolveSectionSurfaceClass,
  type SectionBackgroundIntensity,
  type SectionColorScheme,
} from "@/lib/registry/section-surface";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";

/**
 * Flat props delivered by `withSitecore`'s default convention:
 *   - `params.BackgroundImage`      → `backgroundImage` (Sitecore media URL string)
 *   - `params.DynamicPlaceholderId` → `dynamicPlaceholderId` (per-placement digits)
 *   - `params.Position`             → `position` (`position@1` enum)
 *   - `params.MaxWidth`             → `maxWidth` (`max-width@1` enum)
 *   - `params.Alignment`            → `alignment` (`alignment@1` enum)
 *
 * `CmsProps` covers `id`, `styles`, `isEditing`, and `rendering` — all
 * forwarded by `withSitecore`'s default convention at component-map
 * generation time.
 */
export interface ContainerProps extends CmsProps {
  backgroundImage?: string;
  /**
   * Per-placement digit suffix SXA injects when the rendering is marked
   * `IsRenderingsWithDynamicPlaceholders=true` (set by the recipe's
   * `dynamicPlaceholders: true`). Concatenated with the prefix to form
   * `container-${id}`, which must match the SDK's `^container-\d+$`
   * pattern derived from `container-{*}`.
   */
  dynamicPlaceholderId?: string;
  /**
   * Vertical placement axis. `inline` flows with the page;
   * `sticky-top` and `sticky-bottom` pin via CSS `position: sticky`.
   * Place the container near the page root for true viewport pinning —
   * sticky resolves against the nearest scroll container.
   */
  position?: "inline" | "sticky-top" | "sticky-bottom";
  /**
   * Inner content-width cap for the **Default** variant.
   * `narrow|standard|wide` apply Tailwind `max-w-*` utilities.
   * `full` is treated as `wide` on Default so this variant cannot
   * impersonate FullBleed. The FullBleed variant ignores this param
   * and is always unconstrained.
   */
  maxWidth?: "narrow" | "standard" | "wide" | "full";
  /**
   * Layout-service `params.FieldNames` (variant name or GUID). Used so
   * Default still goes full-bleed when Pages mounts Default as the
   * fallback for an unresolved `FullBleed` export.
   */
  fieldNames?: string;
  params?: { FieldNames?: string; fieldNames?: string };
  /**
   * Horizontal placement of the constrained block within the parent's
   * available width. Logical utilities (`me-auto` / `mx-auto` /
   * `ms-auto`) so the choice flips correctly under RTL. No-op when
   * `maxWidth` is `full` (block already fills parent).
   */
  alignment?: "start" | "center" | "end";
  /**
   * Surface fill for the container. `default` = transparent (the
   * container adopts whatever's behind it). The remaining values map
   * to the shared `color-scheme@1` enum — each picks the matching
   * subdued background token so child renderings sit on a colored
   * band without authors needing CSS access. RTL-safe; tokens are
   * direction-neutral.
   */
  colorScheme?: SectionColorScheme;
  /**
   * Saturation of the background fill. `subtle` (default) uses the
   * weak `bg-<scheme>-background` token (light tint); `bold` swaps to
   * the pure `bg-<scheme>` token and pairs it with
   * `text-<scheme>-foreground` so text inside the container inverts
   * via CSS inheritance. Only meaningful when `backgroundColor` picks
   * one of the brand schemes (primary / secondary / tertiary /
   * accent / accent-2 / accent-3); other schemes ignore the bold
   * option and stay on their subtle treatment.
   */
  backgroundIntensity?: SectionBackgroundIntensity;
  /**
   * Vertical padding token applied as `py-*` on the Default shell.
   * Defaults to `lg` (the original marketing indent). Ignored by
   * FullBleed (always flush against the header).
   */
  paddingY?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
}

/**
 * Variant lookup. Pages / Layout Service send the Headless Variant
 * name on `params.FieldNames`. Match that even when the SDK mounted
 * the Default export (missing named export, HMR, client-map miss).
 */
function isFullBleedVariant(
  explicit: boolean | undefined,
  fieldNames?: string,
  params?: ContainerProps["params"],
  rendering?: ContainerProps["rendering"],
): boolean {
  if (explicit) return true;
  const raw =
    fieldNames ??
    params?.FieldNames ??
    params?.fieldNames ??
    rendering?.params?.FieldNames;
  if (!raw) return false;
  return raw.replace(/[{}]/g, "").trim().toLowerCase() === "fullbleed";
}

/** Default never paints edge-to-edge — `full` falls back to `wide`. */
function resolveDefaultMaxWidth(
  maxWidth: ContainerProps["maxWidth"],
): "narrow" | "standard" | "wide" {
  if (maxWidth === "narrow" || maxWidth === "standard" || maxWidth === "wide") {
    return maxWidth;
  }
  return "wide";
}

const PADDING_Y_CLASSES: Record<
  NonNullable<ContainerProps["paddingY"]>,
  string
> = {
  none: "py-0",
  sm: "py-4",
  md: "py-8",
  lg: "py-12",
  xl: "py-20",
  "2xl": "py-32",
};

const POSITION_CLASSES: Record<
  NonNullable<ContainerProps["position"]>,
  string
> = {
  inline: "",
  "sticky-top": "sticky top-0 z-40",
  "sticky-bottom": "sticky bottom-0 z-40",
};

const MAX_WIDTH_CLASSES: Record<
  NonNullable<ContainerProps["maxWidth"]>,
  string
> = {
  narrow: "max-w-[640px]",
  standard: "max-w-[896px]",
  wide: "max-w-[1280px]",
  full: "max-w-none",
};

const ALIGNMENT_CLASSES: Record<
  NonNullable<ContainerProps["alignment"]>,
  string
> = {
  start: "me-auto",
  center: "mx-auto",
  end: "ms-auto",
};

/**
 * Concrete slot name for `container-{*}`. Layout Service often keys
 * children as `container-{*}` or `container-1`; Pages may use the SXA
 * `container-*-0-{id}` form. Requesting the literal `{*}` token misses
 * children. Ignore leftover `container-full-*` keys from the nested
 * full-slot experiment so they cannot steal this slot.
 */
function containerPlaceholderName(
  rendering: ContainerProps["rendering"],
  dynamicPlaceholderId?: string,
): string {
  const id = dynamicPlaceholderId ?? "1";
  const fallback = `container-${id}`;
  const placeholders = (
    rendering as { placeholders?: Record<string, unknown> } | undefined
  )?.placeholders;
  const keys = placeholders ? Object.keys(placeholders) : [];
  const isSlotKey = (key: string) =>
    (key === "container" ||
      key === "container-{*}" ||
      key.startsWith("container-")) &&
    !key.startsWith("container-full");
  const sxa = keys.find((key) => isSlotKey(key) && key.includes("-*-"));
  if (sxa) return sxa;
  if (keys.includes(fallback)) return fallback;
  if (keys.includes("container-{*}")) return "container-{*}";
  const existing = keys.find(isSlotKey);
  if (existing) return existing;
  return fallback;
}

interface ContainerShellProps extends ContainerProps {
  /**
   * Variant flag. `true` drops MaxWidth / Alignment / PaddingY so
   * children (FullBleed heroes) span the viewport. Set by the
   * `FullBleed` export; authors pick the variant in Pages, not a param.
   */
  fullBleed?: boolean;
}

/**
 * Layout container with an optional background image and a single
 * dynamic placeholder slot (`container-{*}`). Permissive — any
 * rendering can be dropped.
 *
 * Two variants:
 *   - `Default`   — original marketing indent (`MaxWidth` + `PaddingY`).
 *                    Never edge-to-edge; `full` is treated as `wide`.
 *   - `FullBleed` — viewport-width, no padding. Page-top heroes go here.
 *
 * Exported as `ContainerPresentation` for unit tests. The generator
 * wraps `Default` / `FullBleed` with `withSitecore` at component-map
 * build time.
 */
export function ContainerPresentation({
  id,
  styles,
  backgroundImage,
  colorScheme,
  backgroundIntensity = "subtle",
  paddingY = "lg",
  dynamicPlaceholderId,
  position = "inline",
  maxWidth = "wide",
  alignment = "center",
  rendering,
  fieldNames,
  params,
  fullBleed: fullBleedProp = false,
}: ContainerShellProps) {
  const mediaUrl = extractMediaUrl(backgroundImage);
  const backgroundStyle = mediaUrl
    ? { backgroundImage: `url('${mediaUrl}')` }
    : undefined;
  const phKey = containerPlaceholderName(rendering, dynamicPlaceholderId);
  const fullBleed = isFullBleedVariant(
    fullBleedProp,
    fieldNames,
    params,
    rendering,
  );
  const resolvedMaxWidth = fullBleed
    ? "full"
    : resolveDefaultMaxWidth(maxWidth);
  const isConstrained = resolvedMaxWidth !== "full";
  const backgroundClass = resolveSectionSurfaceClass(
    colorScheme ?? "default",
    backgroundIntensity,
  );
  const paddingYClass = fullBleed ? "py-0" : PADDING_Y_CLASSES[paddingY];

  return (
    <div
      className={cn(
        "component container-default",
        fullBleed && "w-full max-w-none",
        POSITION_CLASSES[position],
        backgroundClass,
        paddingYClass,
        styles,
      )}
      id={id}
      data-variant={fullBleed ? "FullBleed" : "Default"}
    >
      <div className="component-content w-full" style={backgroundStyle}>
        <div
          className={cn(
            "w-full",
            MAX_WIDTH_CLASSES[resolvedMaxWidth],
            isConstrained && ALIGNMENT_CLASSES[alignment],
          )}
        >
          {rendering ? (
            <Placeholder name={phKey} rendering={rendering} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function Default(props: ContainerProps) {
  return <ContainerPresentation {...props} />;
}

/**
 * Edge-to-edge shell — no MaxWidth cap, no PaddingY. Page-top heroes
 * belong here. Default stays the original 1280 indent.
 */
export function FullBleed(props: ContainerProps) {
  return <ContainerPresentation {...props} fullBleed />;
}

export default Default;

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants (Headless, Media, etc.) fail to resolve. No runtime
 * behaviour change: the file stays a plain RSC server component
 * (no useState, no client-only hooks here); the universal marker
 * is purely a generate-map signal.
 */
export const componentType = "universal";
