import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export { picsum } from "./_theme-photos";

type Link = { href: string; text: string };

export type HubPlacement = NonNullable<
  NonNullable<PageRecipe["layout"]>["placeholders"]
>[string][number];

export function hubHero(options: {
  slot?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  primary: Link;
  secondary?: Link;
  imageSeed?: string;
  imageAlt?: string;
  backgroundColor?: string;
  /** `display` browse hubs; `compact` utility / Help. */
  headingLayout?: "display" | "compact";
  /** Image family = FullBleed; Help compact intro = Placeholders. */
  variant?: "FullBleed" | "Placeholders";
  /** Opt in to hero CDP view / CTA / dwell / scroll-past events. */
  trackEvents?: boolean;
  /** Stable analytics handle (e.g. `home-hero`). */
  instanceKey?: string;
}): HubPlacement {
  const fields: Record<string, unknown> = {
    Eyebrow: options.eyebrow,
    Title: options.title,
    Subtitle: options.subtitle,
    PrimaryAction: options.primary,
  };
  if (options.secondary) fields.SecondaryAction = options.secondary;
  if (options.imageSeed) {
    fields.Image = {
      shape: "image",
      mediaPath: picsum(options.imageSeed),
      alt: options.imageAlt ?? options.eyebrow,
    };
  }
  const params: Record<string, string> = {
    HeadingLayout: options.headingLayout ?? "display",
    Layout: "centered",
    PrimaryActionColorScheme: "primary",
  };
  if (options.trackEvents) params.TrackEvents = "true";
  if (options.instanceKey) params.InstanceKey = options.instanceKey;
  if (options.imageSeed) {
    params.OverlayStyle = "solid";
    params.OverlayColorScheme = "primary";
    params.OverlayOpacity = "72";
  } else {
    params.BackgroundColor = options.backgroundColor ?? "primary";
    params.OverlayStyle = "none";
  }
  return {
    componentHandle: "hero@1",
    variant: options.variant ?? "FullBleed",
    params,
    datasourceRef: {
      kind: "scoped",
      slot: options.slot ?? "Hero",
      fields,
    },
  };
}

/** Short FDIC / equal-housing / illustrative-rate footnote for bank pages. */
export const FDIC_DISCLOSURE =
  "Prospera Bank, N.A., Member FDIC. Equal Housing Lender. Annual percentage yields (APY), annual percentage rates (APR), and fees shown on this site are illustrative for a demonstration and are not live offers.";

export function hubPromoCloser(options: {
  slot?: string;
  eyebrow?: string;
  title: string;
  description: string;
  cta: Link;
  imageSeed?: string;
  imageAlt?: string;
  /** Closer = default surface; supporting band = neutral. */
  surfaceTone?: string;
}): HubPlacement {
  const fields: Record<string, unknown> = {
    Title: options.title,
    Description: `<p>${options.description}</p>`,
    Link: options.cta,
  };
  if (options.eyebrow) fields.Eyebrow = options.eyebrow;
  if (options.imageSeed) {
    fields.Image = {
      shape: "image",
      mediaPath: picsum(options.imageSeed),
      alt: options.imageAlt ?? options.title,
    };
  }
  return {
    componentHandle: "promo@1",
    variant: "Default",
    params: {
      ImagePosition: options.imageSeed ? "end" : "hidden",
      SurfaceTone: options.surfaceTone ?? "default",
      PrimaryActionColorScheme: "primary",
      PrimaryActionVariant: "default",
      EyebrowStyle: "text",
    },
    datasourceRef: {
      kind: "scoped",
      slot: options.slot ?? "Closer",
      fields,
    },
  };
}

export function hubContentBlock(options: {
  slot: string;
  eyebrow?: string;
  title: string;
  body: string;
  headingLayout?: "start" | "center";
}): HubPlacement {
  const fields: Record<string, unknown> = {
    Title: options.title,
    Body: options.body,
  };
  if (options.eyebrow) fields.Eyebrow = options.eyebrow;
  return {
    componentHandle: "content-block@1",
    variant: "Default",
    params: {
      HeadingLayout: options.headingLayout ?? "start",
      EyebrowStyle: "text",
    },
    datasourceRef: {
      kind: "scoped",
      slot: options.slot,
      fields,
    },
  };
}

export function hubStatsGrid(options: {
  slot?: string;
  title: string;
  lead: string;
  headingLayout?: "start" | "center";
  stats: { slot: string; label: string; value: string }[];
}): HubPlacement {
  return {
    componentHandle: "stats-list-grid@1",
    variant: "Grid",
    params: { HeadingLayout: options.headingLayout ?? "start" },
    datasourceRef: {
      kind: "scoped",
      slot: options.slot ?? "Stats",
      fields: {
        Title: options.title,
        Lead: `<p>${options.lead}</p>`,
      },
    },
    placeholders: {
      "cards-stats": options.stats.map((stat) => ({
        componentHandle: "stats-card@1",
        variant: "Default",
        datasourceRef: {
          kind: "scoped",
          slot: stat.slot,
          fields: { Label: stat.label, Value: stat.value },
        },
      })),
    },
  };
}

export function hubSupportingBand(options: {
  slot?: string;
  eyebrow?: string;
  title: string;
  description: string;
  cta: Link;
  imageSeed?: string;
  imageAlt?: string;
}): HubPlacement {
  return hubPromoCloser({
    ...options,
    slot: options.slot ?? "Supporting",
    surfaceTone: "neutral",
    imageSeed: options.imageSeed ?? "promo-closer",
    imageAlt: options.imageAlt,
  });
}

export function featureCardPlacement(options: {
  slot: string;
  title: string;
  description: string;
  href: string;
  linkText: string;
  imageSeed: string;
  imageAlt: string;
  variant?: "MediaStacked" | "Default";
}): HubPlacement {
  return {
    componentHandle: "feature-card@1",
    variant: options.variant ?? "Default",
    params: { Elevation: "none" },
    datasourceRef: {
      kind: "scoped",
      slot: options.slot,
      fields: {
        Title: options.title,
        Description: `<p>${options.description}</p>`,
        Image: {
          shape: "image",
          mediaPath: picsum(options.imageSeed),
          alt: options.imageAlt,
        },
        Link: { href: options.href, text: options.linkText },
      },
    },
  };
}

export function featuresListGrid(options: {
  slot: string;
  title: string;
  lead: string;
  cards: HubPlacement[];
  headingLayout?: "start" | "center";
  firstFeatured?: boolean;
}): HubPlacement {
  const cards = options.cards.map((card, index) => {
    if (index === 0 && (options.firstFeatured || card.variant === "MediaStacked")) {
      return { ...card, variant: "MediaStacked" as const };
    }
    return { ...card, variant: card.variant ?? "Default" };
  });
  return {
    componentHandle: "features-list-grid@1",
    variant: "MediaStacked",
    params: { HeadingLayout: options.headingLayout ?? "start" },
    datasourceRef: {
      kind: "scoped",
      slot: options.slot,
      fields: {
        Title: options.title,
        Lead: `<p>${options.lead}</p>`,
      },
    },
    placeholders: { "cards-features": cards },
  };
}

/**
 * Marketing / hub page FINAL layout. Pages labels the root body slot
 * **Main** (`headless-main` in `src/Layout.tsx`). Classic SXA `main`
 * is unused — do not place there, and do not delete `headless-main`.
 *
 * Addressing `container-1` at the page root orphans the stack: the
 * page-design Container on SHARED does not create an editable
 * `/headless-main/container-1` for FINAL, so the editor shows empty
 * Main and the components never render. Place Container on
 * `headless-main` in FINAL and nest children in its `container` slot
 * (compiled as `container-1`).
 *
 * Leading FullBleed heroes / carousels go in a **FullBleed**
 * Container (same `container-{*}` slot, no max-width / padding). The
 * body stays in a sibling **Default** Container so listings keep the
 * width cap. Authors never drop the hero on Main.
 */
export function container1Layout(
  placements: HubPlacement[],
): NonNullable<PageRecipe["layout"]> {
  const { fullBleed, contained } = splitLeadingFullBleed(placements);
  const stack: HubPlacement[] = [];
  if (fullBleed.length > 0) {
    stack.push(
      pageContainer({ variant: "FullBleed", placements: fullBleed }),
    );
  }
  stack.push(pageContainer({ variant: "Default", placements: contained }));
  return {
    placeholders: {
      "headless-main": stack,
    },
  };
}

function pageContainer(options: {
  variant: "Default" | "FullBleed";
  placements: HubPlacement[];
}): HubPlacement {
  const isFullBleed = options.variant === "FullBleed";
  return {
    componentHandle: "container@1",
    variant: options.variant,
    params: isFullBleed
      ? { MaxWidth: "full", Alignment: "center", PaddingY: "none" }
      : {
          MaxWidth: "wide",
          Alignment: "center",
          PaddingY: "lg",
        },
    datasourceRef: { kind: "none" },
    placeholders: {
      container: options.placements,
    },
  };
}

/**
 * Page-top full-bleed shells that must sit outside Container's
 * MaxWidth / PaddingY wrapper. Compact Help heroes stay contained.
 */
function isFullBleedShell(placement: HubPlacement): boolean {
  if (placement.componentHandle === "hero-carousel@1") return true;
  if (placement.componentHandle === "hero@1") {
    return placement.variant === "FullBleed";
  }
  return placement.variant === "FullBleed";
}

function splitLeadingFullBleed(placements: HubPlacement[]): {
  fullBleed: HubPlacement[];
  contained: HubPlacement[];
} {
  const fullBleed: HubPlacement[] = [];
  const contained: HubPlacement[] = [];
  let peeling = true;
  for (const placement of placements) {
    if (peeling && isFullBleedShell(placement)) {
      fullBleed.push(placement);
    } else {
      peeling = false;
      contained.push(placement);
    }
  }
  return { fullBleed, contained };
}
