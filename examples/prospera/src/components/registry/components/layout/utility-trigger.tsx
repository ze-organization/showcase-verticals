"use client";

import { type ReactNode, useState } from "react";
import { iconByName } from "@/components/registry/graphics/icons/named-icon/icon-vocabulary";
import { NamedIcon } from "@/components/registry/graphics/icons/named-icon/named-icon";
import { buttonVariants } from "@/components/registry/primitives/core/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/registry/primitives/core/dialog";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/registry/primitives/core/popover";
import { Link } from "@/components/registry/primitives/editables/link";
import { cn } from "@/lib/registry/cn";
import { resolveEditingMode } from "@/lib/registry/editing-mode";
import {
  buttonColorScheme,
  isEnabled,
  parseButtonVariant,
  parseColorScheme,
  type SitecoreBoolInput,
} from "@/lib/registry/param-parsers";
import { resolvePlaceholderChildren } from "@/lib/registry/placeholder-children";
import {
  parseSectionBackgroundIntensity,
  parseSectionColorScheme,
  resolveSectionSurfaceClass,
} from "@/lib/registry/section-surface";
import {
  type LinkField,
  Placeholder,
  type TextField,
} from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";

export interface UtilityTriggerFields {
  /**
   * Visible trigger text. ALWAYS wins over the Link field's own text —
   * the link text is hover metadata (`title` attribute) and only
   * becomes the visible label when `Label` is empty.
   */
  Label?: TextField;
  /** When present and `HasPanel` is off, the trigger renders as a plain link. */
  Link?: LinkField;
  /**
   * Opt-in for a panel placeholder. When true, the trigger toggles a
   * dynamic `trigger-panel-{ph}` placeholder that authors fill with
   * arbitrary renderings (Form, PreviewSearch, RichText, LinkLists,
   * Buttons, etc.). The `PanelLayout` param picks how it opens
   * (inline dropdown / full-width band / modal dialog).
   *
   * As a datasource field it arrives in the JSS checkbox wrapper
   * (`{ value: boolean }`) — `isEnabled` unwraps every accepted shape.
   */
  HasPanel?: SitecoreBoolInput;
}

export type UtilityTriggerProps = ComponentProps & {
  fields: UtilityTriggerFields;
  params?: { [key: string]: string };
  isEditing?: boolean;
  /**
   * Render the trigger's panel already open. Preview seam only — both
   * panel layouts (Dialog and Popover) are Radix-portalled and absent
   * from the DOM until a gesture opens them, so a static preview paints
   * a bare trigger and the panel can never be seen or measured.
   */
  defaultOpen?: boolean;
};

/** `panel-layout@1` values. Unknown / empty parse to `inline`. */
export type PanelLayoutValue = "inline" | "full-width" | "modal";

const PANEL_LAYOUT_VALUES: ReadonlySet<PanelLayoutValue> = new Set([
  "inline",
  "full-width",
  "modal",
]);

export function parsePanelLayout(
  value: string | undefined,
  fallback: PanelLayoutValue = "inline",
): PanelLayoutValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return PANEL_LAYOUT_VALUES.has(normalized as PanelLayoutValue)
    ? (normalized as PanelLayoutValue)
    : fallback;
}

/**
 * Resolve the trigger icon from the `IconName` rendering parameter —
 * the shared `icon-name@1` vocabulary. `none` is the Droplink clearing
 * sentinel (mirrors card-block's `iconBadgeNode` guard), and a value
 * outside the vocabulary renders no icon.
 */
function resolveTriggerIcon(paramIconName: string | undefined): ReactNode {
  const fromParam = paramIconName?.trim().toLowerCase();
  if (fromParam && fromParam !== "none" && iconByName(fromParam)) {
    return <NamedIcon name={fromParam} className="size-5" />;
  }
  return null;
}

function TriggerContent({
  label,
  icon,
  showChevron,
}: {
  label: string | undefined;
  icon: ReactNode;
  showChevron: boolean;
}) {
  return (
    <>
      {icon}
      {label ? <span>{label}</span> : null}
      {showChevron ? (
        <LibraryIcon
          name="chevron-down"
          className="size-4"
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}

/**
 * Strip the authored text/title off a Link field before handing it to
 * the `<Link>` editable. The primitive's content resolution is
 * `value.text ?? value.title ?? children` — link text OVERRIDES the
 * children fallback — but for the utility trigger the authored `Label`
 * is always the visible label, and the link's own text is demoted to
 * hover metadata (`title` attribute). Field-level Pages metadata
 * survives the shallow clone, so inline editing keeps working.
 */
function stripLinkText(link: LinkField | undefined): LinkField | undefined {
  if (!link) return undefined;
  return {
    ...link,
    value: { ...(link.value ?? {}), text: undefined, title: undefined },
  } as LinkField;
}

/**
 * Single header utility trigger — an icon, a label, or both, optionally
 * with a panel placeholder for richer affordances (search overlay,
 * account dropdown, geo zip picker, mega-menu panel).
 *
 * Label precedence: the authored `Label` field is ALWAYS the visible
 * label. The Link field's own text is hover metadata (`title`
 * attribute) and is used as the visible label only when `Label` is
 * empty — a single-value fallback, never an override.
 *
 * Three rendering paths driven by field presence:
 *
 *   1. `Link` present + `HasPanel` off  → plain link (with optional
 *      leading icon). Use for direct-action items (Log in, Find an
 *      Agent, Cart link).
 *
 *   2. `HasPanel` on (Link absent)      → the whole trigger toggles the
 *      panel placeholder `trigger-panel-{ph}`. Use for icon-led
 *      affordances that reveal a panel (Search → input; Location →
 *      ZIP picker; Account → login form).
 *
 *   3. `Link` present + `HasPanel` on   → label is a link (navigates
 *      on click); the chevron toggles the panel.
 *
 * Chrome axes (rendering parameters):
 *
 *   - `TriggerStyle` (`button-variant@1`, default `ghost` — the
 *     dropdown-caret look) + `ColorScheme` (`color-scheme@1`, default
 *     `none` = inherit) style the trigger via the Button primitive's
 *     variant × scheme compounds (solid pairing on the trigger only).
 *   - `PanelLayout` (`panel-layout@1`, default `inline`) picks how the
 *     panel opens: anchored dropdown / full-width header band
 *     (main-nav MegaPanel's `absolute inset-x-0` — spans the nearest
 *     positioned ancestor, conventionally the header row) / modal
 *     dialog.
 *   - `PanelBackground` (`color-scheme@1`, default `none`) +
 *     `PanelBackgroundIntensity` (`background-intensity@1`, default
 *     `subtle`) paint the panel surface via the shared section-surface
 *     vocabulary (bold → `surface-invert` re-toning).
 *
 * Editing mode renders the panel placeholder as a visible tray below
 * the trigger so authors can fill it — panel content must never be
 * locked inside a closed popover in Pages.
 *
 * When both `Label` and the icon are empty, renders nothing (defensive).
 */
export function Default(props: UtilityTriggerProps) {
  const resolved = resolveTrigger(props);

  // Defensive: need at least a label or icon to render anything.
  if (!resolved.label && !resolved.icon) return null;

  // Path 1: plain link.
  if (resolved.hasLink && !resolved.hasPanel) {
    return (
      <Link
        value={resolved.linkForRender}
        className={cn(resolved.triggerClass, resolved.styles)}
        id={resolved.id}
        title={resolved.hoverTitle}
      >
        <TriggerContent
          label={resolved.label}
          icon={resolved.icon}
          showChevron={false}
        />
      </Link>
    );
  }

  // EDITING: the panel must be a visible, fillable tray — placeholder
  // content locked inside a closed popover/dialog is unreachable for
  // authors (the "HasPanel doesn't do anything" failure mode).
  if (resolved.editing) return <EditingTray resolved={resolved} />;

  if (resolved.panelLayout === "modal") {
    return <ModalPanelTrigger resolved={resolved} />;
  }
  if (resolved.panelLayout === "full-width") {
    return <FullWidthPanelTrigger resolved={resolved} />;
  }
  return <InlinePanelTrigger resolved={resolved} />;
}

/** Everything the layout renderers need, computed once. */
interface ResolvedTrigger {
  label: string | undefined;
  hoverTitle: string | undefined;
  icon: ReactNode;
  hasLink: boolean;
  hasPanel: boolean;
  editing: boolean;
  linkForRender: LinkField | undefined;
  triggerClass: string;
  triggerLabel: string;
  panelLayout: PanelLayoutValue;
  panelSurfaceClass: string;
  panelKey: string;
  rendering: UtilityTriggerProps["rendering"];
  id: string | undefined;
  styles: string | undefined;
  defaultOpen: boolean | undefined;
}

function resolveTrigger({
  fields,
  params = {},
  rendering,
  isEditing,
  defaultOpen,
}: UtilityTriggerProps): ResolvedTrigger {
  const authoredLabel = fields?.Label?.value?.trim() || undefined;
  const linkValue = fields?.Link?.value;
  const linkText = linkValue?.text?.trim() || undefined;
  const linkOwnTitle =
    (linkValue as { title?: string } | undefined)?.title?.trim() || undefined;
  // Label is the visible label, always; link text is a fallback only.
  const label = authoredLabel ?? linkText;
  // Demoted link text becomes hover metadata when Label wins. A link
  // field's own `title` (already hover-semantics in Sitecore) wins
  // over the demoted text.
  const hoverTitle =
    linkOwnTitle ??
    (authoredLabel && linkText && linkText !== authoredLabel
      ? linkText
      : undefined);

  // Trigger chrome: Button primitive's variant × colorScheme compounds.
  // `ghost` + `none` is the historical caret look (inherit text, soft
  // hover); `default` paints the solid role pairing on the trigger only.
  const triggerVariant = parseButtonVariant(params.TriggerStyle, "ghost");
  const triggerClass = cn(
    buttonVariants({
      variant: triggerVariant,
      size: "sm",
      colorScheme: buttonColorScheme(
        parseColorScheme(params.ColorScheme, "none"),
      ),
    }),
    "utility-trigger gap-2 text-sm",
  );

  // Base page surface first so an unset/`none` scheme still paints a
  // complete panel; the resolved scheme classes override via twMerge.
  const panelSurfaceClass = cn(
    "bg-background text-foreground",
    resolveSectionSurfaceClass(
      parseSectionColorScheme(params.PanelBackground, "none"),
      parseSectionBackgroundIntensity(
        params.PanelBackgroundIntensity,
        "subtle",
      ),
    ),
  );

  // Suffix-drift-tolerant placeholder resolution (visual-tabs pattern):
  // the exact `trigger-panel-{DynamicPlaceholderId}` key misses when
  // the param doesn't reach the component (metadata editing payloads,
  // older snapshots) — the prefix match recovers the real key so the
  // panel isn't silently empty.
  const { key: panelKey } = resolvePlaceholderChildren(
    rendering,
    "trigger-panel",
    params.DynamicPlaceholderId,
  );

  const hasPanel = isEnabled(fields?.HasPanel);

  return {
    label,
    hoverTitle,
    icon: resolveTriggerIcon(params.IconName),
    hasLink: Boolean(linkValue?.href),
    hasPanel,
    editing: hasPanel && resolveEditingMode({ isEditing, params }),
    linkForRender: stripLinkText(fields?.Link),
    triggerClass,
    triggerLabel: label ?? "Open",
    panelLayout: parsePanelLayout(params.PanelLayout),
    panelSurfaceClass,
    panelKey,
    rendering,
    id: params.RenderingIdentifier ?? undefined,
    styles: params.styles?.trimEnd(),
    defaultOpen,
  };
}

/**
 * The navigating-label half of a link+panel trigger (paths 2 + 3
 * share it): the Link when present, plus the toggle's inner content
 * (chevron only when the label is a link; full trigger content
 * otherwise) and its shared ARIA attributes.
 */
function buildTriggerParts(resolved: ResolvedTrigger) {
  const { hasLink, label, icon, triggerClass, triggerLabel, hoverTitle } =
    resolved;
  return {
    linkNode: hasLink ? (
      <Link
        value={resolved.linkForRender}
        className={cn(triggerClass, "pe-1")}
        title={hoverTitle}
      >
        <TriggerContent label={label} icon={icon} showChevron={false} />
      </Link>
    ) : null,
    toggleInner: hasLink ? (
      <LibraryIcon name="chevron-down" className="size-4" aria-hidden="true" />
    ) : (
      <TriggerContent label={label} icon={icon} showChevron={true} />
    ),
    toggleClass: cn(triggerClass, hasLink && "min-w-0 ps-1"),
    ariaLabel: hasLink ? `Open ${triggerLabel} menu` : triggerLabel,
    toggleTitle: hasLink ? undefined : hoverTitle,
  };
}

function EditingTray({ resolved }: { resolved: ResolvedTrigger }) {
  return (
    <div
      className={cn(
        "utility-trigger inline-flex flex-col items-start gap-2",
        resolved.styles,
      )}
      id={resolved.id}
    >
      <span className={resolved.triggerClass}>
        <TriggerContent
          label={resolved.label}
          icon={resolved.icon}
          showChevron={true}
        />
      </span>
      <div
        data-slot="utility-trigger-editing-tray"
        className={cn(
          "min-w-64 rounded-md border border-border border-dashed p-4",
          resolved.panelSurfaceClass,
        )}
      >
        <Placeholder name={resolved.panelKey} rendering={resolved.rendering} />
      </div>
    </div>
  );
}

/**
 * Modal layout: Dialog overlay hosts the placeholder. With a link,
 * the label navigates and only the chevron opens it.
 */
function ModalPanelTrigger({ resolved }: { resolved: ResolvedTrigger }) {
  const parts = buildTriggerParts(resolved);
  return (
    <Dialog defaultOpen={resolved.defaultOpen}>
      <div
        className={cn("inline-flex items-center", resolved.styles)}
        id={resolved.id}
      >
        {parts.linkNode}
        <DialogTrigger
          className={parts.toggleClass}
          aria-label={parts.ariaLabel}
          title={parts.toggleTitle}
        >
          {parts.toggleInner}
        </DialogTrigger>
      </div>
      <DialogContent
        size="lg"
        className={cn(resolved.panelSurfaceClass, "p-6")}
        data-slot="utility-trigger-modal-panel"
      >
        <DialogTitle className="sr-only pb-0">
          {resolved.triggerLabel}
        </DialogTitle>
        <Placeholder name={resolved.panelKey} rendering={resolved.rendering} />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Full-width layout: click-toggled band spanning the nearest
 * positioned ancestor (main-nav MegaPanel's `absolute inset-x-0`
 * treatment) — conventionally the header row provides the positioning
 * context.
 */
function FullWidthPanelTrigger({ resolved }: { resolved: ResolvedTrigger }) {
  const [open, setOpen] = useState(false);
  const parts = buildTriggerParts(resolved);
  return (
    <div
      className={cn("inline-flex items-center", resolved.styles)}
      id={resolved.id}
    >
      {parts.linkNode}
      <button
        type="button"
        className={parts.toggleClass}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={parts.ariaLabel}
        title={parts.toggleTitle}
        onClick={() => setOpen((current) => !current)}
      >
        {parts.toggleInner}
      </button>
      {open ? (
        <div
          data-slot="utility-trigger-full-width-panel"
          className="absolute inset-x-0 top-full z-50 pt-2"
        >
          <div
            className={cn(
              "border-border border-y py-8 shadow-lg",
              resolved.panelSurfaceClass,
            )}
          >
            <div className="container mx-auto px-4">
              <Placeholder
                name={resolved.panelKey}
                rendering={resolved.rendering}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Inline (default) layout: anchored popover. With a link, the label
 * navigates and only the chevron toggles the panel.
 */
function InlinePanelTrigger({ resolved }: { resolved: ResolvedTrigger }) {
  const parts = buildTriggerParts(resolved);
  return (
    <Popover defaultOpen={resolved.defaultOpen}>
      <div
        className={cn("inline-flex items-center", resolved.styles)}
        id={resolved.id}
      >
        {parts.linkNode}
        <PopoverTrigger
          className={parts.toggleClass}
          aria-label={parts.ariaLabel}
          title={parts.toggleTitle}
        >
          {parts.toggleInner}
        </PopoverTrigger>
      </div>
      <PopoverContent
        align="end"
        sideOffset={8}
        className={cn(
          "z-50 w-screen max-w-md border-border p-6 shadow-lg",
          resolved.panelSurfaceClass,
        )}
        data-slot="utility-trigger-inline-panel"
      >
        <Placeholder name={resolved.panelKey} rendering={resolved.rendering} />
      </PopoverContent>
    </Popover>
  );
}

export default Default;

/**
 * Search variant: icon + expanding inline input. Purely
 * presentational — the input expands on hover/focus (CSS only, no
 * client state, no wiring) so a generated header partial can express
 * the fifa/emirates-style search affordance by placing ONE flat
 * rendering, with no panel placeholder composition.
 *
 * Icon resolution matches Default: the `IconName` param (icon-name@1)
 * picks the glyph, defaulting to the vocabulary's "search" glyph when
 * unset or cleared. `Label` doubles as the
 * input placeholder and the accessible name. `Link` / `HasPanel`
 * belong to the Default variant's trigger paths and are not consumed
 * here.
 */
export function Search({ fields, params = {} }: UtilityTriggerProps) {
  const label = fields?.Label?.value || "Search";
  const icon = resolveTriggerIcon(params.IconName) ?? (
    <NamedIcon name="search" className="size-5" />
  );
  const id = params.RenderingIdentifier;
  const styles = params.styles;

  // `ColorScheme` / `TriggerStyle` were declared on the recipe but this
  // variant read neither, so the search trigger was the one utility
  // trigger with no colour control. Same Button-primitive composition
  // the Default variant uses, so the two tint identically.
  const triggerClass = cn(
    buttonVariants({
      variant: parseButtonVariant(params.TriggerStyle, "ghost"),
      size: "sm",
      colorScheme: buttonColorScheme(
        parseColorScheme(params.ColorScheme, "none"),
      ),
    }),
    "utility-trigger-search-field h-auto cursor-text gap-2 px-3 py-2",
  );

  return (
    <div
      className={cn(
        "utility-trigger utility-trigger-search group/search inline-flex items-center",
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      data-slot="utility-trigger-search"
    >
      <label className={triggerClass}>
        {icon}
        <input
          type="search"
          placeholder={label}
          aria-label={label}
          data-slot="input"
          className={cn(
            // Collapsed to zero width, so the field chrome must not
            // paint until it actually expands — hence the width-gated
            // surface below rather than a permanent input box.
            "w-0 min-w-0 text-sm outline-none transition-[width] duration-200",
            // Surface comes from the INPUT primitive's own theme tokens,
            // not a hardcoded `bg-muted`. That grey read as a dark
            // smudge on a light bar and ignored the theme entirely;
            // `--input-background` defaults to the page background
            // (white in a light theme) and a brand can retint it in one
            // place along with every other field on the site.
            "bg-transparent placeholder:text-(--input-placeholder,var(--color-muted-foreground))",
            "focus:w-40 group-focus-within/search:w-40 group-hover/search:w-40 md:group-hover/search:w-56 md:group-focus-within/search:w-56 md:focus:w-56",
            "focus:rounded-[var(--input-radius,var(--radius-md))] focus:border focus:border-(--input-border,var(--color-border)) focus:bg-(--input-background,var(--color-background)) focus:px-2 focus:text-(--input-foreground,var(--color-foreground))",
            "group-focus-within/search:rounded-[var(--input-radius,var(--radius-md))] group-focus-within/search:border group-focus-within/search:border-(--input-border,var(--color-border)) group-focus-within/search:bg-(--input-background,var(--color-background)) group-focus-within/search:px-2 group-focus-within/search:text-(--input-foreground,var(--color-foreground))",
          )}
        />
      </label>
    </div>
  );
}

export const componentType = "universal";
