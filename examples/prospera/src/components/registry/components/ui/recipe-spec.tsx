import { Chip } from "@/components/registry/primitives/core/chip";
import { TypographyH2 } from "@/components/registry/primitives/core/typography";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import {
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  type SurfaceTone,
  surfaceToneClass,
} from "@/lib/registry/color-scheme-classes";
import {
  SECTION_PADDING_Y_CLASSES,
  type SectionPaddingY,
} from "@/lib/registry/section-surface";
import type { CmsProps, Field } from "@/lib/registry/sitecore";

/**
 * `RecipeSpec` — the ingredients/preparation spec archetype (the
 * "how to make it" panel on a cocktail or dish detail page): a titled
 * spec with meta chips (serves / prep time / glass / difficulty), an
 * ingredients list, garnish, an emphasized per-serve callout, an
 * equipment list, and a rich-text method.
 *
 * Every field is optional-tolerant: a missing/empty field simply
 * doesn't render its row — no dead chrome, no placeholder labels
 * outside editing mode. This matters doubly on wildcard pages, where
 * fields arrive per-URL via `WildcardBindings` and any given content
 * item may omit some of them.
 *
 * Rendering variants (separate exports, never a discriminator prop):
 *
 *   - `Default` — two-column: ingredients + garnish + per-serve meta
 *     on the inline-start column, equipment + method on the end
 *     column. Stacks to a single column on mobile.
 *   - `Compact` — single column, tighter rhythm: chips, ingredients,
 *     garnish, callout, equipment, method top-to-bottom.
 */
export interface RecipeSpecProps extends CmsProps {
  /** Spec heading (e.g. the drink or dish name). */
  title?: TextSource;
  /** Number of serves the ingredient quantities yield. */
  serves?: Field<number> | number;
  /** Ingredient lines — multiline text, one ingredient per line. */
  ingredients?: TextSource;
  /** Garnish note (e.g. "Lime wedge"). */
  garnish?: TextSource;
  /**
   * Small emphasized per-serve callout (e.g. "15.8 grams of alcohol
   * per serve").
   */
  alcoholPerServe?: TextSource;
  /** Equipment lines — multiline text, one item per line. */
  equipment?: TextSource;
  /** Preparation method — rich text. */
  method?: RichTextSource;
  /** Preparation time in minutes. */
  prepTimeMinutes?: Field<number> | number;
  /** Recommended glassware (e.g. "Highball"). */
  glassType?: TextSource;
  /** Difficulty label (e.g. "Easy"). */
  difficulty?: TextSource;
  /** Section surface tone — shared `color-scheme@1` vocabulary. */
  surfaceTone?: SurfaceTone;
  /** Section vertical padding — shared `padding-y@1` vocabulary. */
  paddingY?: SectionPaddingY;
}

type RecipeSpecLayout = "two-column" | "compact";

/** Read a numeric field (`Field<number>` or bare number) or nothing. */
const readNumber = (
  value: Field<number> | number | undefined,
): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  const raw = value?.value;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  // Edge/authored envelopes may deliver numbers as numeric strings.
  if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

/** Split a multi-line text source into trimmed, non-empty lines. */
const readLines = (source: TextSource | undefined): string[] =>
  (getSourceText(source) ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const hasText = (source: TextSource | undefined): boolean =>
  source != null && !isEmptySource(source) && Boolean(getSourceText(source));

/** Serves / prep time / glass / difficulty meta chips. */
function SpecChips({
  serves,
  prepTimeMinutes,
  glassType,
  difficulty,
}: Pick<
  RecipeSpecProps,
  "serves" | "prepTimeMinutes" | "glassType" | "difficulty"
>) {
  const servesCount = readNumber(serves);
  const prepMinutes = readNumber(prepTimeMinutes);
  const entries = [
    servesCount != null
      ? `Serves ${servesCount === 1 ? "1" : servesCount}`
      : undefined,
    prepMinutes != null ? `${prepMinutes} min prep` : undefined,
    getSourceText(glassType),
    getSourceText(difficulty),
  ].filter((entry): entry is string => !!entry && entry.trim().length > 0);
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5" data-slot="recipe-spec-meta">
      {entries.map((entry) => (
        <Chip key={entry} size="sm">
          {entry}
        </Chip>
      ))}
    </div>
  );
}

/** Bulleted line list under a small heading (Ingredients / Equipment). */
function SpecLineList({
  heading,
  lines,
  slot,
}: {
  heading: string;
  lines: string[];
  slot: string;
}) {
  if (lines.length === 0) return null;
  return (
    <div data-slot={slot}>
      <h3 className="mb-2 font-semibold text-foreground text-lg">{heading}</h3>
      <ul className="space-y-1.5 text-foreground text-sm">
        {lines.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden className="text-primary">
              •
            </span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Garnish row — a labelled single-line note under the ingredients. */
function GarnishRow({
  garnish,
  isEditing,
}: {
  garnish?: TextSource;
  isEditing?: boolean;
}) {
  if (!hasText(garnish) && !isEditing) return null;
  return (
    <p className="text-foreground text-sm" data-slot="recipe-spec-garnish">
      <span className="font-semibold">Garnish: </span>
      <Text
        value={garnish}
        tag="span"
        placeholder="Garnish"
        isEditing={isEditing}
      />
    </p>
  );
}

/**
 * Small emphasized per-serve callout ("15.8 grams of alcohol per
 * serve") — role text on the page surface per the color-roles
 * contract, never a `*-foreground` token outside a solid role fill.
 */
function AlcoholCallout({ alcoholPerServe }: { alcoholPerServe?: TextSource }) {
  if (!hasText(alcoholPerServe)) return null;
  return (
    <p
      className="border-primary border-s-2 ps-3 font-medium text-primary text-sm"
      data-slot="recipe-spec-alcohol"
    >
      <Text value={alcoholPerServe} tag="span" />
    </p>
  );
}

/** Method rich text under its heading. */
function MethodBlock({
  method,
  isEditing,
}: {
  method?: RichTextSource;
  isEditing?: boolean;
}) {
  if ((method == null || isEmptySource(method)) && !isEditing) return null;
  return (
    <div data-slot="recipe-spec-method">
      <h3 className="mb-2 font-semibold text-foreground text-lg">Method</h3>
      <RichText value={method} placeholder="Method" isEditing={isEditing} />
    </div>
  );
}

const hasAnyContent = (props: RecipeSpecProps): boolean =>
  hasText(props.title) ||
  hasText(props.ingredients) ||
  hasText(props.garnish) ||
  hasText(props.alcoholPerServe) ||
  hasText(props.equipment) ||
  (props.method != null && !isEmptySource(props.method)) ||
  hasText(props.glassType) ||
  hasText(props.difficulty) ||
  readNumber(props.serves) != null ||
  readNumber(props.prepTimeMinutes) != null;

function RecipeSpecBase(props: RecipeSpecProps & { layout: RecipeSpecLayout }) {
  const {
    layout,
    title,
    ingredients,
    garnish,
    alcoholPerServe,
    equipment,
    method,
    surfaceTone = "none",
    paddingY = "auto",
    styles,
    id,
    isEditing,
  } = props;

  if (!hasAnyContent(props)) {
    if (!isEditing) return null;
    return (
      <div className={cn("component recipe-spec", styles?.trimEnd())} id={id}>
        <span className="is-empty-hint">
          Recipe spec — author ingredients/method content or bind resolved
          fields via WildcardBindings
        </span>
      </div>
    );
  }

  const ingredientLines = readLines(ingredients);
  const equipmentLines = readLines(equipment);

  const startColumn = (
    <div className="flex flex-col gap-5">
      <SpecLineList
        heading="Ingredients"
        lines={ingredientLines}
        slot="recipe-spec-ingredients"
      />
      <GarnishRow garnish={garnish} isEditing={isEditing} />
      <AlcoholCallout alcoholPerServe={alcoholPerServe} />
    </div>
  );
  const endColumn = (
    <div className="flex flex-col gap-5">
      <SpecLineList
        heading="Equipment"
        lines={equipmentLines}
        slot="recipe-spec-equipment"
      />
      <MethodBlock method={method} isEditing={isEditing} />
    </div>
  );

  return (
    <section
      className={cn(
        "component recipe-spec w-full",
        // `auto` (recipe default) → the section's natural responsive
        // ramp; a concrete token takes over.
        paddingY === "auto"
          ? "py-10 md:py-14"
          : SECTION_PADDING_Y_CLASSES[paddingY],
        surfaceToneClass(surfaceTone),
        styles?.trimEnd(),
      )}
      id={id}
      data-slot="recipe-spec"
    >
      <div className="container mx-auto flex flex-col gap-6 px-4">
        {hasText(title) || isEditing ? (
          <TypographyH2 className="font-heading text-3xl tracking-tight">
            <Text
              value={title}
              tag="span"
              placeholder="Title"
              isEditing={isEditing}
            />
          </TypographyH2>
        ) : null}
        <SpecChips
          serves={props.serves}
          prepTimeMinutes={props.prepTimeMinutes}
          glassType={props.glassType}
          difficulty={props.difficulty}
        />
        {layout === "two-column" ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
            {startColumn}
            {endColumn}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {startColumn}
            {endColumn}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────── rendering variants ─────────────────── */

/** Two-column spec: ingredients + meta start, equipment + method end. */
export function Default(props: RecipeSpecProps) {
  return <RecipeSpecBase {...props} layout="two-column" />;
}

/** Single-column spec with a tighter vertical rhythm. */
export function Compact(props: RecipeSpecProps) {
  return <RecipeSpecBase {...props} layout="compact" />;
}

export default Default;

// Sitecore-aware multi-export components MUST declare this so the SDK
// lists them in BOTH server and client component maps (Pages chrome
// resolves named-export variants client-side).
export const componentType = "universal";
