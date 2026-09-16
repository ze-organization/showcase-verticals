import {
  ComponentPlacementSchema,
  ComponentSectionRecipeSchema,
  ComponentTemplateRecipeSchema,
  ContentFieldValueSchema,
  ContentItemRecipeSchema,
  ContentTemplateRecipeSchema,
  ContentTranslationSchema,
  DesignParameterSchema,
  DesignParametersTemplateRecipeSchema,
  DictionaryPhraseSchema,
  DictionaryRecipeSchema,
  EnumerationRecipeSchema,
  EnumerationValueSchema,
  FieldDefinitionSchema,
  FieldShapeSchema,
  LayoutSchema,
  PageDesignRecipeSchema,
  PageRecipeSchema,
  PageTemplateRecipeSchema,
  PartialDesignRecipeSchema,
  PlaceholderDefinitionSchema,
  RecipeDatasourceSchema,
  RecipeMetaSchema,
  RecipeMetaTaxSchema,
  RenderingDatasourceLocationSchema,
  RenderingVariantDefinitionSchema,
  SitecoreFieldAugmentSchema,
  SitecoreFieldSourceSchema,
  SitecoreFieldTypeSchema,
  SiteGroupingSchema,
  SiteRecipeSchema,
  SiteTemplateRecipeSchema,
  SiteTemplateTaxonomyEntrySchema,
  VariantRecipeSchema,
  // ^ All schemas come from scai's COMPILER-FREE entry `/recipe/schema`
  // (scai ≥ 0.3.4): one zod-only module re-exporting every kind schema (stable
  // AND unstable) plus the field-type tables. NEVER import from `/recipe` or
  // `/recipe/unstable` — those barrels are CJS and statically pull `./compile`
  // → `sandbox/transpile` → esbuild, which (since this module is imported by 22
  // client components and the jsdom tests) would bundle the compiler + esbuild
  // into client routes and crash jsdom on esbuild's load-time invariant.
} from "@sitecoreai-labs/sitecoreai-cli/recipe/schema";
import {
  BrandArrayEntrySchema,
  BrandFieldValueSchema,
  BrandGlossaryEntrySchema,
  BrandKitSectionPropertiesSchema,
  BrandRichEntrySchema,
  BrandKitRecipeSchema as ScaiBrandKitRecipeSchema,
} from "@sitecoreai-labs/sitecoreai-cli/unstable/brand/schema";
// Brief family: scai owns the schema (its sync is the live wire contract). We
// import its bundle-safe (zod-only) brief schemas and `.extend` them with the
// registry's authoring sugar — recipe identity (kind/handle), display + labels,
// authoring defaults — rather than maintaining a second hand-written copy that
// drifts (the brandkit `documents[].kind` divergence is the cautionary tale).
import {
  BriefCommentSchema as ScaiBriefCommentSchema,
  BriefInstanceRecipeSchema as ScaiBriefInstanceRecipeSchema,
  BriefTodoSchema as ScaiBriefTodoSchema,
  BriefTypeRecipeSchema as ScaiBriefTypeRecipeSchema,
} from "@sitecoreai-labs/sitecoreai-cli/unstable/brief/schema";
import { CampaignRecipeSchema as ScaiCampaignRecipeSchema } from "@sitecoreai-labs/sitecoreai-cli/unstable/campaigns/schema";
import { z } from "zod";
import { ComponentEventDef } from "./recipes/component-events";

/**
 * Sitecore recipe schemas — the registry's single recipe-authoring surface.
 *
 * Three sections, in order:
 *
 *   1. scai-sourced kinds — aliased below. scai
 *      (`@sitecoreai-labs/sitecoreai-cli`) is the source of truth for every
 *      standard recipe kind. We alias each `<Kind>RecipeSchema` to the
 *      registry's historical bare name (`<Kind>Recipe`) and pair it with the
 *      `z.input` authoring type (defaulted fields optional at the literal site).
 *      The ONLY local change is `ComponentTemplateRecipe`, which we `.extend`
 *      with a registry-local `events` block (CDP analytics — scai's compiler has
 *      no analytics surface).
 *
 *   2. registry-local kinds — DEFINED here, no scai equivalent:
 *      `SectionDefinitionRecipe` + `TemplateSection`, and the brand / brief /
 *      campaign / story / agent / optimization families.
 *
 *   3. the `Recipe` umbrella union (bottom of file) — spans both.
 *
 * There is intentionally no separate `recipes/scai-kinds.ts` anymore: the
 * adapter is a flat list of aliases, so it lives inline — no re-export
 * indirection, no binding-shadow dance.
 */

// ── 1. scai-sourced kinds ───────────────────────────────────────────────────
// Each `export const <Kind> = <Kind>Schema` aliases scai's schema VALUE to the
// registry's bare name; the paired `export type` is the `z.input` (authoring)
// shape. Mechanical by design — a name adapter over scai, not a second schema
// definition. `ComponentTemplateRecipe` is the one exception: it `.extend`s
// scai's schema with the registry-local `events` block.

export const FieldShape = FieldShapeSchema;
export type FieldShape = z.input<typeof FieldShape>;

export const SitecoreFieldType = SitecoreFieldTypeSchema;
export type SitecoreFieldType = z.input<typeof SitecoreFieldType>;

export const SitecoreFieldSource = SitecoreFieldSourceSchema;
export type SitecoreFieldSource = z.input<typeof SitecoreFieldSource>;

export const SitecoreFieldAugment = SitecoreFieldAugmentSchema;
export type SitecoreFieldAugment = z.input<typeof SitecoreFieldAugment>;

export const FieldDefinition = FieldDefinitionSchema;
export type FieldDefinition = z.input<typeof FieldDefinition>;

export const RenderingVariantDefinition = RenderingVariantDefinitionSchema;
export type RenderingVariantDefinition = z.input<
  typeof RenderingVariantDefinition
>;

export const ParamDefinition = DesignParameterSchema;
export type ParamDefinition = z.input<typeof ParamDefinition>;

export const PlaceholderDefinition = PlaceholderDefinitionSchema;
export type PlaceholderDefinition = z.input<typeof PlaceholderDefinition>;

export const RecipeDatasource = RecipeDatasourceSchema;
export type RecipeDatasource = z.input<typeof RecipeDatasource>;

export const RenderingDatasourceLocation = RenderingDatasourceLocationSchema;
export type RenderingDatasourceLocation = z.input<
  typeof RenderingDatasourceLocation
>;

/**
 * scai's `ComponentTemplateRecipe` + the registry-local `events` block. zod v4
 * `.extend` preserves scai's attached `parameters`-XOR-`params` `.refine`
 * (verified: the mutex still fires after extend), so we do NOT re-apply it.
 */
export const ComponentTemplateRecipe = ComponentTemplateRecipeSchema.extend({
  events: z
    .array(ComponentEventDef)
    .default([])
    .describe(
      "CDP analytics events this component emits. Each entry registers a `<componentName>.<eventName>` row in the runtime catalog consumed by `useComponentAnalytics`. Recipe is the single source of truth for the CDP event surface. Registry-local — scai's compiler ignores it.",
    ),
});
export type ComponentTemplateRecipe = z.input<typeof ComponentTemplateRecipe>;

export const RecipeMetaTax = RecipeMetaTaxSchema;
export type RecipeMetaTax = z.input<typeof RecipeMetaTax>;

export const RecipeMeta = RecipeMetaSchema;
export type RecipeMeta = z.input<typeof RecipeMeta>;

export const EnumerationValue = EnumerationValueSchema;
export type EnumerationValue = z.input<typeof EnumerationValue>;

export const ContentFieldValue = ContentFieldValueSchema;
export type ContentFieldValue = z.input<typeof ContentFieldValue>;

export const ContentTranslation = ContentTranslationSchema;
export type ContentTranslation = z.input<typeof ContentTranslation>;

export const ComponentPlacement = ComponentPlacementSchema;
export type ComponentPlacement = z.input<typeof ComponentPlacement>;

export const Layout = LayoutSchema;
export type Layout = z.input<typeof Layout>;

export const SiteTemplateTaxonomyEntry = SiteTemplateTaxonomyEntrySchema;
export type SiteTemplateTaxonomyEntry = z.input<
  typeof SiteTemplateTaxonomyEntry
>;

export const SiteGrouping = SiteGroupingSchema;
export type SiteGrouping = z.input<typeof SiteGrouping>;

export const DictionaryPhrase = DictionaryPhraseSchema;
export type DictionaryPhrase = z.input<typeof DictionaryPhrase>;

// Registry-local CDP analytics definitions (`Cdp*`, `ComponentEventDef`),
// folded onto `ComponentTemplateRecipe.events` above.
export * from "./recipes/component-events";

const HANDLE_PATTERN = /^[a-z][a-z0-9-]*@\d+$/;

const HandleString = z.string().regex(HANDLE_PATTERN, {
  message: "handle must match `<kebab-name>@<major>` (e.g. cta-button@1)",
});

/**
 * Available Rendering Section Definition — declares an SXA section
 * definition item that the registry uses as the target for `availableIn`
 * bindings. Each section definition holds an `Available Renderings`
 * multi-list field whose pipe-separated GUID list controls which
 * renderings appear in the section's toolbox group.
 *
 * Registry-local: scai has no `section-definition` kind (its compiler does
 * not emit these items), so this schema stays defined here rather than being
 * re-exported.
 *
 * The section definition typically lives in the content tree under
 * `/sitecore/content/<tenant>/<site>/Presentation/Available Renderings/<Section>`,
 * but the exact path is recipe-supplied via `sitePath` so the same recipe
 * shape works across SXA Headless and classic SXA layouts.
 */
export const SectionDefinitionRecipe = z.object({
  kind: z.literal("section-definition"),
  schemaVersion: z.literal("1"),
  handle: HandleString,
  name: z.string().min(1),
  displayName: z.string().optional(),
  description: z.string().optional(),
  /**
   * Sitecore content-tree path of the section definition item
   * (e.g. `/sitecore/content/<tenant>/<site>/Presentation/Available
   * Renderings/<Section>`). The compiler uses this as the lookup target
   * when emitting `AppendToMultiList` ops for the section's `Available
   * Renderings` field.
   */
  sitePath: z
    .string()
    .min(1)
    .describe(
      "Sitecore content-tree path of the section definition item (e.g. `/sitecore/content/<tenant>/<site>/Presentation/Available Renderings/<Section>`). The compiler uses this as the lookup target when emitting `AppendToMultiList` ops for the section's `Available Renderings` field.",
    ),
});
export type SectionDefinitionRecipe = z.infer<typeof SectionDefinitionRecipe>;

/**
 * One named section on a `PageTemplateRecipe`-style template. Each section
 * becomes a Template Section item under the template, with its fields as
 * children. Sections render in declared order; an explicit `sortOrder`
 * overrides that with a numeric ranking (lower comes first).
 *
 * Registry-local: kept for callers that still group fields into named
 * sections. `FieldDefinition` is re-exported from scai.
 */
export const TemplateSection = z.object({
  name: z.string().min(1),
  sortOrder: z.number().int().optional(),
  fields: z.array(FieldDefinition).default([]),
});
export type TemplateSection = z.input<typeof TemplateSection>;

/**
 * Canonical Sitecore AI brand-kit section names — the exact strings
 * the EnrichSections pipeline emits on the live kit. Mirrors what scai
 * `listBrandKitSections` returns after a fresh enrichment run.
 *
 * Verified empirically 2026-05-28 against a real tenant: the pipeline
 * always produces this 8-section set; section names are case-sensitive
 * (`Dos and Dont's` with no apostrophe between Do and s, `Grammar
 * Guidelines` not `Grammar Checklists`, etc.). Authoring against any
 * other names is wasted effort — scai's `apply()` won't find a target
 * to PATCH, every field write silently skips, and the live kit ends up
 * matching the canonical structure regardless.
 *
 * The recipe stores sections as a plain `Record<string, …>` so authors
 * can still add brand-specific overflow sections, but the UI and the
 * registry-side defaults scaffold the canonical 8 first so new kits
 * sync cleanly to Sitecore on first push.
 */
export const BRAND_KIT_CANONICAL_SECTIONS = [
  "Brand Context",
  "Global Goals",
  "Tone of Voice",
  "Dos and Dont's",
  "Visual Guidelines",
  "Image Style",
  "Grammar Guidelines",
  "Checklist",
  "Glossary and Localization",
] as const;
export type BrandKitCanonicalSection =
  (typeof BRAND_KIT_CANONICAL_SECTIONS)[number];

/**
 * Canonical field names per section, again verified against a live
 * tenant. EnrichSections creates one subsection (field) per name
 * inside each section. PATCHing field values requires an exact name
 * match — `"Brand purpose"` works, `"brandPurpose"` and `"Brand
 * Purpose"` do not. Recipes should author fields under these keys
 * (the brand-kit editor scaffolds them by default; deviations
 * produce silently-skipped writes).
 */
export const BRAND_KIT_CANONICAL_FIELDS: Record<
  BrandKitCanonicalSection,
  readonly string[]
> = {
  "Brand Context": [
    "Brand purpose",
    "Brand history",
    "Brand ambition",
    "Brand consumer",
    "Brand benefits",
    "Brand context",
    "Digital life",
    "Brand content idea",
    "Brand essence",
    "Talent guidance",
    "Brand concept",
    "Brand beliefs and benefits",
  ],
  "Global Goals": [
    "Digital mandatories",
    "SEO best practices",
    "Accessibility",
    "Diversity",
  ],
  "Tone of Voice": ["Tone of voice", "Tone scenarios"],
  "Dos and Dont's": ["Dos and dont's"],
  "Visual Guidelines": [
    "Visual guidance",
    "Logo guidelines",
    "Pack structure",
    "Colour palettes",
  ],
  "Image Style": ["Image style", "Image style scenarios"],
  "Grammar Guidelines": ["Grammar guidelines values"],
  Checklist: ["Checklist values"],
  // Glossary fields are dynamic — one field per glossary term, named
  // after the term. The editor renders the section's existing fields
  // (and an "add term" affordance); there is no canonical field set.
  "Glossary and Localization": [],
};

/**
 * Default `BrandFieldValue` shape per (section, field) pair — a hint
 * used by the brand-kit editor to render the right input control for a
 * field that has no value yet. NOT authoritative: the live Sitecore
 * subsection carries an explicit `type` (`"text" | "array" | "richArray"`)
 * which is the truth for what PATCH calls must send. When the editor
 * has the live kit in hand, prefer `field.type`; fall back to this map
 * only for empty scaffolds and offline authoring.
 *
 * Values verified empirically 2026-06-02 against the `Sync` brand kit
 * (org_Sqg9NOB4DhDdpb1x) via `scai brand kits fields …`. Earlier
 * snapshots of this map had ~11 wrong entries (Global Goals fields
 * typed as `array` were actually `text`, scenarios typed as `text` were
 * actually `richArray`, visual-guidelines `Logo guidelines` /
 * `Colour palettes` typed as `text` were `array`, etc.), which made
 * brand-kit pushes silently 422 on roughly every section.
 *
 * Keys are `"<section>\x00<field>"` matching the registry's internal
 * `fieldKey` separator. Sections/fields outside this map fall through
 * to runtime inference from the existing value, which works fine for
 * authored content but not for empty scaffolded rows.
 *
 * Glossary and Localization is intentionally absent — that section's
 * fields are *dynamic* (one per glossary term, named after the term)
 * and carry `BrandGlossaryEntry[]` values; see the schema doc on
 * `BrandkitRecipe.sections` for the model.
 */
export type BrandKitFieldKind = "text" | "array" | "richArray";

export const BRAND_KIT_DEFAULT_FIELD_KIND_HINTS: Record<
  string,
  BrandKitFieldKind
> = {
  // Brand Context — almost all paragraph text; Brand concept is an
  // object-array on the live tenant.
  "Brand Context\x00Brand purpose": "text",
  "Brand Context\x00Brand history": "text",
  "Brand Context\x00Brand ambition": "text",
  "Brand Context\x00Brand consumer": "text",
  "Brand Context\x00Brand benefits": "text",
  "Brand Context\x00Brand context": "text",
  "Brand Context\x00Digital life": "text",
  "Brand Context\x00Brand content idea": "text",
  "Brand Context\x00Brand essence": "text",
  "Brand Context\x00Talent guidance": "text",
  "Brand Context\x00Brand concept": "array",
  "Brand Context\x00Brand beliefs and benefits": "text",
  // Global Goals — paragraph text on the live tenant (not arrays).
  "Global Goals\x00Digital mandatories": "text",
  "Global Goals\x00SEO best practices": "text",
  "Global Goals\x00Accessibility": "text",
  "Global Goals\x00Diversity": "text",
  // Tone of Voice — paragraph text + scenarios as richArray entries
  // (Sitecore UI labels `name`→"Instructions" and `tags`→"Keys (csv)").
  "Tone of Voice\x00Tone of voice": "text",
  "Tone of Voice\x00Tone scenarios": "richArray",
  // Dos and Dont's — plain object-array on the live tenant; tags +
  // restrictions are not part of the field type here.
  "Dos and Dont's\x00Dos and dont's": "array",
  // Visual Guidelines — guidance + pack structure are prose; logo
  // guidelines + colour palettes are bullet lists (object-array).
  "Visual Guidelines\x00Visual guidance": "text",
  "Visual Guidelines\x00Logo guidelines": "array",
  "Visual Guidelines\x00Pack structure": "text",
  "Visual Guidelines\x00Colour palettes": "array",
  // Image Style — paragraph text + scenarios as richArray (same UI
  // labels as Tone scenarios).
  "Image Style\x00Image style": "text",
  "Image Style\x00Image style scenarios": "richArray",
  // Grammar Guidelines — object-array (one rule per entry).
  "Grammar Guidelines\x00Grammar guidelines values": "array",
  // Checklist — object-array on the live tenant (not richArray).
  "Checklist\x00Checklist values": "array",
};

/**
 * An `array`-field entry: a single string slot, server-assigned `id`
 * echoed back on read so the editor can keep stable DnD/React keys.
 *
 * `array` is Sitecore's flat-list field type — used for `Dos and dont's`,
 * `Checklist values`, `Grammar guidelines values`, `Visual Guidelines >
 * Logo guidelines` / `Colour palettes`, `Brand Context > Brand concept`.
 * The entry shape is an OBJECT (`{ name }`), not a bare string — the
 * earlier `string[]` typing here is what caused brand-kit pushes to
 * 422 on every list field.
 *
 * Mirrors `BrandKitArrayEntry` in scai's API client layer.
 */
export const BrandArrayEntry = BrandArrayEntrySchema;
export type BrandArrayEntry = z.input<typeof BrandArrayEntry>;

/**
 * A `richArray`-field entry: text plus optional tags and a per-scenario
 * constraint. Used for `Tone scenarios` and `Image style scenarios` on
 * the live tenant. (Sitecore's UI labels these `name`→"Instructions"
 * and `tags`→"Keys (csv)" — the storage shape and the wire shape are
 * `{name, tags?, restrictions?, id?}` regardless.)
 *
 * Mirrors `BrandRichEntrySchema` in scai's brand recipe schema.
 */
export const BrandRichEntry = BrandRichEntrySchema;
export type BrandRichEntry = z.input<typeof BrandRichEntry>;

/**
 * A glossary-and-localization translation row. Each row pins one
 * locale's spelling/term variant for a glossary entry.
 *
 * The `Glossary and Localization` section's fields are dynamic — one
 * field per glossary term, named after the term. The field's value is
 * an array of these rows (one per locale). The section's
 * `properties.sourceLanguage` (modelled as `BrandkitSectionProperties`)
 * names the base language; rows for other locales carry the
 * translation.
 */
export const BrandGlossaryEntry = BrandGlossaryEntrySchema;
export type BrandGlossaryEntry = z.input<typeof BrandGlossaryEntry>;

/**
 * A brand-kit field value. The shape that is valid depends on the live
 * field's `type` — `text` → string, `array` → `BrandArrayEntry[]`,
 * `richArray` → `BrandRichEntry[]`. Glossary-and-Localization fields
 * are a special case: dynamic per-term, value is `BrandGlossaryEntry[]`.
 *
 * `text` and the three list shapes are mutually exclusive at the wire
 * layer — Sitecore returns HTTP 422 if you PATCH a string into an
 * `array` field, or an object-array into a `text` field. The editor
 * resolves the right shape per (section, field) from the live kit's
 * `type` (preferred) or from
 * `BRAND_KIT_DEFAULT_FIELD_KIND_HINTS` (fallback for empty scaffolds).
 *
 * Mirrors `BrandFieldValueSchema` in scai's brand recipe schema.
 */
export const BrandFieldValue = BrandFieldValueSchema;
export type BrandFieldValue = z.input<typeof BrandFieldValue>;

/**
 * Section-level metadata that Sitecore stores alongside the field
 * dictionary. Today the only load-bearing property is
 * `sourceLanguage`, the Glossary section's base/default-language slot
 * (BCP-47 tag like `en`). Other sections expose `isSizeLimit` which is
 * a server-side flag we don't surface yet.
 *
 * Modelled as a separate slot on `BrandkitRecipe` because the
 * `sections` slot is a flat field dictionary; nesting properties under
 * each section would have been a breaking shape change.
 */
export const BrandkitSectionProperties = BrandKitSectionPropertiesSchema;
export type BrandkitSectionProperties = z.input<
  typeof BrandkitSectionProperties
>;

/**
 * A brand document to ingest into the kit. Two flavours:
 *
 *   - `{ kind: "asset" }` — pointer to an entry in the per-brand
 *     documents library (`/brands/:id/documents`). The canonical shape
 *     for any user-uploaded doc — the recipe carries only the UUID,
 *     and the brand-kit editor hydrates filename / size / type from
 *     `GET /api/brands/:id/documents` at render time.
 *
 *   - `{ kind: "url" }` — externally-hosted document NOT in the asset
 *     store. Kept for the rare case where an author wants the Documents
 *     API to fetch from a public URL the brand already owns.
 *
 *   - `{ kind: "registry-file" }` — repo-relative path under the recipe
 *     file. The orchestrator's `brandkit_deploy` handler resolves the
 *     path to a temporary public URL (or streams it to MMS) before
 *     invoking scai. Lets authors ship brand docs alongside the recipe
 *     in the registry repo instead of relying on external hosting.
 *
 * Optional `tags` and `sections` are hints for the EnrichSections
 * pipeline — they bias ingestion toward specific sections (e.g. a
 * voice-and-tone PDF tagged with `["Tone of Voice"]`).
 */
/**
 * A brand document to ingest. Registry-local authoring superset of scai's
 * `BrandDocumentSchema`: adds the `asset` kind (a pointer into the per-brand
 * documents library), which the orchestrator's `brandkit_deploy` resolves to a
 * URL *before* scai sees it — so scai's wire union only carries `url` +
 * `registry-file`.
 */
export const BrandKitDocument = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("asset"),
    assetUuid: z.string().uuid(),
    addedAt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sections: z.array(z.string()).optional(),
  }),
  z.object({
    kind: z.literal("url"),
    url: z.string().min(1),
    title: z.string().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sections: z.array(z.string()).optional(),
  }),
  z.object({
    kind: z.literal("registry-file"),
    path: z
      .string()
      .min(1)
      .describe("Path relative to the recipe file's directory."),
    title: z.string().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sections: z.array(z.string()).optional(),
  }),
]);
export type BrandKitDocument = z.input<typeof BrandKitDocument>;

/**
 * A single tag option presented to authors when editing a `string[]`
 * field or a `BrandRichEntry.tags` array. The value is what's stored
 * in the underlying field; the optional label is the display text.
 */
export const BrandkitTagOption = z.object({
  value: z.string().min(1),
  label: z.string().optional(),
});
export type BrandkitTagOption = z.input<typeof BrandkitTagOption>;

/**
 * Per-field presentation hints. `label` overrides the field's record
 * key as the display label; `tagOptions` turns a `string[]` (or a rich
 * entry's `tags`) into an enum-driven picker.
 */
export const BrandkitFieldView = z.object({
  label: z.string().optional(),
  tagOptions: z.array(BrandkitTagOption).optional(),
  allowFreeFormTags: z.boolean().optional(),
});
export type BrandkitFieldView = z.input<typeof BrandkitFieldView>;

/**
 * Per-section presentation hints. `fieldOrder` is authoritative for
 * field display order (the underlying `sections[name]` is a record, so
 * key order is not guaranteed across serializers).
 */
export const BrandkitSectionView = z.object({
  label: z.string().optional(),
  intro: z.string().optional(),
  fieldOrder: z.array(z.string()).default([]),
  fields: z.record(z.string(), BrandkitFieldView).default({}),
});
export type BrandkitSectionView = z.input<typeof BrandkitSectionView>;
export type ParsedBrandkitSectionView = z.output<typeof BrandkitSectionView>;

/**
 * Presentation hints for a brand kit. Optional and additive — the
 * scai recipe runtime and the deploy pipelines ignore this slot, so
 * adding it never affects what gets pushed to Sitecore AI. The
 * WYSIWYG and registry-side renderers consume it.
 */
export const BrandkitView = z.object({
  icon: z
    .string()
    .optional()
    .describe("Emoji or short string shown next to the kit's display name."),
  sectionOrder: z
    .array(z.string())
    .default([])
    .describe(
      "Authoritative section display order. Names should match `sections` keys; unknown names are appended on render.",
    ),
  sections: z
    .record(z.string(), BrandkitSectionView)
    .default({})
    .describe("Per-section presentation hints, keyed by section name."),
});
export type BrandkitView = z.input<typeof BrandkitView>;
export type ParsedBrandkitView = z.output<typeof BrandkitView>;

/**
 * A Sitecore AI brand kit, declared as data.
 *
 * Owned by a theme: each `registry:theme` item may carry exactly one
 * `BrandkitRecipe` via its `brandkit` slot. On theme install, the
 * orchestrator dispatches a `brandkit_deploy` job which invokes scai's
 * `brand-kit` recipe kind to:
 *
 *   1. create the kit (if absent) via the Brand Management API,
 *   2. upload `documents[]` and run the `BrandIngestionPipeline`,
 *   3. run the `EnrichSectionsPipeline` to populate sections + fields,
 *   4. PATCH the kit to published,
 *   5. converge `sections[name][field]` values to the declared state.
 *
 * Sections enumerate the canonical 7 names that the EnrichSections
 * pipeline produces (see `BRAND_KIT_CANONICAL_SECTIONS`). Authors may
 * declare values for any subset; unset sections fill from enrichment.
 *
 * Deploys to the **Sitecore AI Brand API**, not Authoring GraphQL —
 * the orchestrator's `brandkit_deploy` handler uses the AI Skills
 * credential (`acquireBrandToken`), not the automation client.
 */
export const BrandkitRecipe = ScaiBrandKitRecipeSchema.extend({
  /**
   * Documents to ingest — the registry authoring shape (`asset` | `url` |
   * `registry-file`). The `asset` kind is registry-local; `brandkit_deploy`
   * resolves it to a URL before scai's `url`/`registry-file` wire union.
   */
  documents: z.array(BrandKitDocument).default([]),
  /**
   * Presentation hints for editors and rendering layers (section/field order,
   * display labels, intros, tag enumerations). Registry-local — scai's recipe
   * runtime and the deploy pipelines ignore it, so it round-trips untouched.
   * Accepts null on input (storage may serialize a missing field as null) and
   * normalizes to undefined.
   */
  view: z
    .preprocess(
      (val) => (val === null ? undefined : val),
      BrandkitView.optional(),
    )
    .describe(
      "Presentation hints for editors and rendering layers. Round-tripped untouched by scai/deploy; only the WYSIWYG + authoring tools consume it.",
    ),
  /**
   * The brand's **content-affinity vocabulary** — the open, brand-authored
   * taxonomy of what this brand's pages are about, generated with the kit
   * (orchestrator-local; see the orchestrator's
   * `scai-shared/llm/brandkit-recipe-schema.ts`). Each key is a camelCase
   * axis name (it becomes a flat CDP `ext.<axis>` attribute), each value the
   * axis's tag list. Pages pick their `affinity` facet from this vocabulary,
   * and the brand affinity panel + per-page affinity editor read it here.
   *
   * Modelled explicitly so it round-trips through the showcase's kit editor
   * — Zod strips unknown keys, so without this an edit-and-save would wipe
   * the generated vocabulary. Optional: a kit drafted before it existed has
   * none.
   */
  affinityVocabulary: z
    .record(z.string().regex(/^[a-z][a-zA-Z0-9]*$/), z.array(z.string().min(1)))
    .optional()
    .describe(
      "Open, brand-authored affinity taxonomy: camelCase axis name → tag list. Round-tripped so kit edits don't strip it; consumed by the affinity tree + per-page affinity editor.",
    ),
});
export type BrandkitRecipe = z.input<typeof BrandkitRecipe>;
/**
 * Parsed brand-kit recipe — what `BrandkitRecipe.parse()` returns,
 * with `.default([])` / `.default({})` clauses already materialised.
 * Use this for *consumers* of recipe data (loaders, renderers); the
 * input alias above stays for *authoring* (where defaults are optional).
 */
export type ParsedBrandkitRecipe = z.output<typeof BrandkitRecipe>;

/**
 * Sitecore Content Operations brief workflow status. Wire values surfaced
 * by the brief API's own validation (2026-05-15): "Status must be one of:
 * Approved, InReview, Draft, Canceled, Archived". `InReview` is the wire
 * value for the "In Review" UI label.
 */
export const BRIEF_STATUSES = [
  "Draft",
  "InReview",
  "Approved",
  "Canceled",
  "Archived",
] as const;
export const BriefStatus = z.enum(BRIEF_STATUSES);
export type BriefStatus = z.infer<typeof BriefStatus>;

/**
 * Localized label — BCP-47-ish locale (e.g. `en-us`) → string. Mirrors
 * scai's `LocalizedStringSchema`.
 */
export const LocalizedString = z.record(z.string(), z.string());
export type LocalizedString = z.infer<typeof LocalizedString>;

/**
 * Shared shape for every brief-type field. Mirrors `briefFieldBaseShape`
 * in scai/src/brief/recipe/schema.ts.
 */
const BriefFieldBase = {
  /**
   * Stable codename — the key a brief instance stores its value under
   * (`BriefRecipe.fields[name]`).
   */
  name: z
    .string()
    .min(1)
    .regex(/^[A-Za-z][A-Za-z0-9_]*$/)
    .describe(
      "Stable codename — the key a brief instance stores its value under (`BriefRecipe.fields[name]`).",
    ),
  /** Localized human label shown in the brief authoring UI. */
  label: LocalizedString.describe(
    "Localized human label shown in the brief authoring UI.",
  ),
  /** Optional localized help text. */
  helpText: LocalizedString.optional().describe(
    "Optional localized help text.",
  ),
  /** Whether the field must be filled before the brief can advance. */
  required: z
    .boolean()
    .default(false)
    .describe("Whether the field must be filled before the brief can advance."),
  /**
   * Whether AI assistants may write this field. `aiIntent` is read
   * either way.
   */
  aiEditable: z
    .boolean()
    .default(true)
    .describe(
      "Whether AI assistants may write this field. `aiIntent` is read either way.",
    ),
  /**
   * Free-form prompt describing to AI clients how to fill the field.
   * Optional but recommended.
   */
  aiIntent: z
    .string()
    .optional()
    .describe(
      "Free-form prompt describing to AI clients how to fill the field. Optional but recommended.",
    ),
} as const;

/**
 * Brief-type field discriminator. Mirrors scai's `BriefFieldSchema`:
 *
 *   - `RichText`  free-form HTML.
 *   - `DateTime`  single ISO-8601 datetime.
 *   - `Timeline`  schedule (start/end) with holiday + weekend handling.
 *   - `Budget`    monetary value constrained to a currency set.
 *   - `Boolean`   simple true/false (e.g. `QualifiedBANT`). Observed on
 *                 SitecoreAI's built-in types (SitecoreAIEvaluation).
 *
 * `Timeline` and `Budget` carry configuration on the field DEFINITION
 * (the `Timeline` field's `skipHolidays` etc., the `Budget` field's
 * `currencies` allow-list); the value stored against a brief instance
 * is the schedule object or `{ amount, currency }` respectively.
 */
export const BriefTypeField = z.discriminatedUnion("type", [
  z.object({ type: z.literal("RichText"), ...BriefFieldBase }),
  z.object({ type: z.literal("DateTime"), ...BriefFieldBase }),
  z.object({ type: z.literal("Boolean"), ...BriefFieldBase }),
  z.object({
    type: z.literal("Timeline"),
    ...BriefFieldBase,
    /** Schedule calculation strategy enum — observed value `0`; semantics TBD. */
    calculation: z
      .number()
      .default(0)
      .describe(
        "Schedule calculation strategy enum — observed value `0`; semantics TBD.",
      ),
    skipHolidays: z.boolean().default(false),
    skipWeekend: z.boolean().default(true),
    /** IANA timezone (e.g. `America/New_York`). May be empty. */
    timezone: z
      .string()
      .default("")
      .describe("IANA timezone (e.g. `America/New_York`). May be empty."),
  }),
  z.object({
    type: z.literal("Budget"),
    ...BriefFieldBase,
    /** ISO-4217 currency codes the field accepts. */
    currencies: z
      .array(
        z
          .string()
          .length(3)
          .regex(/^[A-Z]{3}$/, {
            message:
              "ISO-4217 currency code must be 3 uppercase letters (e.g. `USD`).",
          }),
      )
      .default(["USD"])
      .describe(
        "ISO-4217 currency codes the field accepts (3-letter uppercase, e.g. `USD`).",
      ),
  }),
]);
export type BriefTypeField = z.input<typeof BriefTypeField>;

/**
 * The declarative definition of a Sitecore Content Operations brief
 * type — the schema template a `BriefRecipe` instance is built against.
 *
 * Brief types are **tenant-wide** resources: one `Creative` per
 * tenant, referenced by every Story's `BriefRecipe.briefTypeName` codename.
 * They live at `src/content/registry/brief-types/<codename>.brief-type.recipe.ts`,
 * NOT theme-scoped (every brand uses the same `Creative`).
 *
 * Mirrors scai's `BriefTypeRecipeSchema`. The orchestrator's future
 * `brief_type_deploy` seeder will consume this recipe to create types
 * on a tenant before any Story-driven brief instances are pushed.
 */
/**
 * `BriefTypeRecipe` — scai's `BriefTypeRecipeSchema` (the wire/sync contract:
 * `name` codename, localized `label`, `icon`/`iconColor`, `fields`) `.extend`ed
 * with the registry's authoring identity. Two deliberate overrides:
 *   - `description` is OPTIONAL here (scai requires it).
 *   - `fields` keeps the registry's `BriefTypeField` so the per-field authoring
 *     defaults (`required: false`, `aiEditable: true`, timeline/budget defaults)
 *     survive — scai's `BriefFieldSchema` omits them for its wire shape.
 */
export const BriefTypeRecipe = ScaiBriefTypeRecipeSchema.extend({
  kind: z.literal("brief-type"),
  schemaVersion: z.literal("1"),
  handle: HandleString,
  description: z.string().optional(),
  fields: z.array(BriefTypeField).default([]),
});
export type BriefTypeRecipe = z.input<typeof BriefTypeRecipe>;
export type ParsedBriefTypeRecipe = z.output<typeof BriefTypeRecipe>;

/**
 * A concrete Sitecore Content Operations brief — a filled-in instance of
 * a brief type, used to seed demo content for a Story.
 *
 * Distinct from scai's `BriefTypeRecipe` (the schema/template definition):
 * a `BriefRecipe` carries values, references the type by codename, and
 * sits inside a `StoryRecipe.briefs[]`. Field shape per type:
 *
 *   - RichText  → string (HTML).
 *   - DateTime  → ISO-8601 string.
 *   - Timeline  → `{ startDate?, endDate?, events: [{title, dueDate?}] }` —
 *                 the field's native Sitecore shape. The dated `events` ARE
 *                 the timeline's points; there is no separate milestone
 *                 concept on the brief.
 *   - Budget    → `{ amount, currency }`.
 *
 * `fields` is typed as `Record<string, unknown>` because the valid shape
 * depends on the referenced brief-type's `BriefField.type` — validation
 * happens at seed time against the live tenant's brief-type definition.
 */
/**
 * `BriefRecipe` — a concrete brief instance. scai's `BriefInstanceRecipeSchema`
 * (the live Brief-API wire contract — `name`, `briefTypeName`, `sitecoreId`,
 * `fields`, `todos`, `campaignHandle`, plus `evaluationTimeline` / `references` /
 * `storyId` / `isTemplate`) `.extend`ed with the registry's authoring layer:
 *
 *   - recipe identity — `kind`, `schemaVersion`, required `handle`.
 *   - UI / authoring — `displayName`, `description`, `labels`,
 *     `comments[].personaLabel`.
 *   - authoring defaults scai leaves to the caller — `locale` → `"en-us"`,
 *     `status` → `"Draft"` (same enum values as scai's
 *     `BriefInstanceStatusSchema`).
 *
 * The brief-type reference is `briefTypeName` (scai's field name). A brief
 * instance carries values and sits inside a `StoryRecipe.briefs[]`.
 */
export const BriefRecipe = ScaiBriefInstanceRecipeSchema.extend({
  kind: z.literal("brief"),
  schemaVersion: z.literal("1"),
  handle: HandleString,
  displayName: z.string().min(1),
  description: z.string().optional(),
  /** BCP-47-ish locale; defaults to `en-us` for seeded briefs. */
  locale: z.string().min(1).default("en-us"),
  /** Brief workflow status; defaults to `Draft` for seeded briefs. */
  status: BriefStatus.default("Draft"),
  /** Free-form labels surfaced in the brief authoring UI. */
  labels: z.array(z.string()).default([]),
  /** Process checklist; defaults to `[]` so authors can omit it. */
  todos: z.array(ScaiBriefTodoSchema).default([]),
  /**
   * Persona-voiced comments. scai's `BriefCommentSchema` (`text` + `authorId`)
   * `.extend`ed with `personaLabel` — registry UI metadata, never sent on the
   * wire. Defaults to `[]`.
   */
  comments: z
    .array(
      ScaiBriefCommentSchema.extend({
        personaLabel: z
          .string()
          .optional()
          .describe(
            "Display name of the persona the comment voices (e.g. 'CSM', 'Designer', 'Legal'). Metadata only — surfaces in the registry UI so authors see who's speaking.",
          ),
      }),
    )
    .default([]),
});
export type BriefRecipe = z.input<typeof BriefRecipe>;
export type ParsedBriefRecipe = z.output<typeof BriefRecipe>;

/**
 * ISO-8601 date-or-datetime — mirrors scai's `Iso8601`. Accepts
 * `2026-05-26`, `2026-05-26T15:00:00Z`, or
 * `2026-05-26T15:00:00.123+02:00`. Less strict than
 * `z.string().datetime()` because the campaign API returns date-only
 * values for some fields.
 */
const Iso8601 = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2}))?$/,
    {
      message:
        "must be an ISO-8601 date or datetime (e.g. `2026-05-26` or `2026-05-26T15:00:00Z`)",
    },
  );

/**
 * Orchestrate API server-enum values **confirmed by observation** in
 * HAR captures of the Sitecore Content Operations UI driving the
 * Orchestrate API. Other values likely exist server-side; the
 * schema accepts the known set as a strong hint and falls back to
 * `z.string()` so a `recipe pull` round-trips cleanly when the API
 * returns an unobserved value.
 *
 * JSON Schema renders this as `anyOf: [{ enum: [...] }, { type: "string" }]`
 * — Agent Studio reads it as "prefer one of these values; new
 * uppercase enums are acceptable too." Mirrors scai's
 * `KNOWN_CAMPAIGN_STATUSES` / `KNOWN_CAMPAIGN_FUNNEL_STAGES`
 * (`scai/src/campaigns/recipe/schema.ts`); keep the two in sync.
 */
export const KNOWN_CAMPAIGN_STATUSES = ["NOT_STARTED"] as const;
export const KNOWN_CAMPAIGN_FUNNEL_STAGES = ["TOP"] as const;

const CampaignStatus = z.union([z.enum(KNOWN_CAMPAIGN_STATUSES), z.string()]);
const CampaignFunnelStage = z.union([
  z.enum(KNOWN_CAMPAIGN_FUNNEL_STAGES),
  z.string(),
]);

/**
 * A task on a campaign deliverable. Mirrors scai's `CampaignTaskSchema`
 * exactly — kept in sync because scai's recipe pusher consumes this
 * shape at seed time. See scai/src/campaigns/recipe/schema.ts.
 */
export const CampaignTask = z.object({
  /**
   * Stable kebab handle (e.g. `subject-line-ab-test@1`) used so other
   * tasks can declare a dependency on this one. Required when this
   * task is referenced as a dependency; otherwise optional.
   */
  handle: HandleString.optional().describe(
    "Stable kebab handle (e.g. `subject-line-ab-test@1`) so other tasks can declare a dependency on this one. Required when this task is referenced as a dependency.",
  ),
  /**
   * Sitecore Orchestrate task UUID, stamped by the orchestrator after
   * a successful campaign push. Lets scai skip the handle-label search
   * for this task on re-push. Absent until the first push; never
   * authored by hand.
   */
  sitecoreId: z
    .string()
    .uuid()
    .optional()
    .describe(
      "Sitecore Orchestrate task UUID, stamped after first campaign push. Never authored by hand.",
    ),
  name: z.string().min(1),
  status: CampaignStatus.optional().describe(
    'Task status — a server enum. Confirmed values: "NOT_STARTED". Other UPPER_SNAKE values may exist on the server; the schema accepts them but agents should prefer the confirmed set.',
  ),
  /** ISO-8601 date or datetime. */
  dueDate: Iso8601.optional().describe("ISO-8601 date or datetime."),
  /** Server enum (e.g. "HIGH", "MEDIUM", "LOW"). */
  priority: z
    .string()
    .optional()
    .describe('Server enum (e.g. "HIGH", "MEDIUM", "LOW").'),
  /**
   * Task description. Two accepted shapes:
   *  - **markdown string** — what the AI generator emits and what
   *    hand-authored recipes carry; converted to a ProseMirror doc
   *    at sync time.
   *  - **ProseMirror doc** (`{type: "doc", content: [...]}`) — what
   *    the registry's TipTap editor stores after the operator edits.
   *
   * Sitecore Orchestrate stores the description as a JSON-stringified
   * ProseMirror doc; the orchestrator does the serialization on push.
   * Supports headings, bold, italic, lists, links.
   */
  description: z
    .union([z.string(), z.record(z.string(), z.unknown())])
    .optional()
    .describe(
      "Task description. Markdown string or ProseMirror doc — serialized to a JSON-stringified ProseMirror doc at sync time. Supports headings, bold, italic, lists, links.",
    ),
  /**
   * Assignee role handle (typically `csm`, `designer`, `strategist`,
   * `producer`, `legal`). The orchestrator maps it to a real member of
   * the target org's directory at sync time.
   */
  assigneeHandle: z
    .string()
    .optional()
    .describe(
      "Short role handle assigned to this task (typically `csm`, `designer`, `strategist`, `producer`, `legal`). The orchestrator maps it to a real member of the target org's directory at sync time.",
    ),
  labels: z.array(z.string()).default([]),
  /**
   * Handles of other tasks this task depends on. References use the
   * sibling task's `handle` field; cross-deliverable references are
   * supported as long as both tasks live in the same campaign.
   * The orchestrator resolves handles to UUIDs in a second push pass
   * after all tasks are created.
   */
  dependencies: z
    .array(z.string().min(1))
    .default([])
    .describe(
      'Handles of tasks this task depends on (e.g. `["draft-creative@1"]`). Powers DAG visualisation. References resolved at sync time; cross-deliverable refs supported.',
    ),
});
export type CampaignTask = z.input<typeof CampaignTask>;

/**
 * A deliverable on a campaign — a funnel-stage grouping of tasks. Mirrors
 * scai's `CampaignDeliverableSchema`.
 */
export const CampaignDeliverable = z.object({
  /**
   * Stable kebab handle (e.g. `top-funnel-creative@1`). Stamped onto
   * the deliverable's wire `labels` as `handle:<handle>` so re-pushes
   * match by label rather than by the volatile display name — which
   * lets operators rename a deliverable without scai treating the
   * rename as a delete+create pair on the tenant. Optional but
   * minted automatically when an operator adds a deliverable in the
   * editor; the LLM emits handles for generator-produced deliverables.
   */
  handle: HandleString.optional().describe(
    "Stable kebab handle. Stamped into the wire `labels` array as `handle:<handle>` so re-pushes match by label rather than by the LLM-volatile display name.",
  ),
  /**
   * Sitecore Orchestrate deliverable UUID, stamped after a successful
   * campaign push. Lets scai skip the in-project search by name/index
   * for this deliverable on re-push. Absent until first push; never
   * authored by hand.
   */
  sitecoreId: z
    .string()
    .uuid()
    .optional()
    .describe(
      "Sitecore Orchestrate deliverable UUID, stamped after first campaign push. Never authored by hand.",
    ),
  name: z.string().min(1),
  status: CampaignStatus.optional().describe(
    'Deliverable status — a server enum. Confirmed values: "NOT_STARTED". Other UPPER_SNAKE values may exist on the server; the schema accepts them but agents should prefer the confirmed set.',
  ),
  dueDate: Iso8601.optional().describe("ISO-8601 date or datetime."),
  /** Funnel stage — server enum. Confirmed values: "TOP". */
  funnelStage: CampaignFunnelStage.optional().describe(
    'Funnel stage — a server enum. Confirmed values: "TOP". Other values likely exist (e.g. middle / bottom of funnel); the schema accepts them but agents should prefer the confirmed set.',
  ),
  funnelTactics: z.array(z.string()).default([]),
  labels: z.array(z.string()).default([]),
  tasks: z.array(CampaignTask).default([]),
});
export type CampaignDeliverable = z.input<typeof CampaignDeliverable>;

/**
 * A Sitecore Orchestrate campaign — a project with nested deliverables
 * and tasks. Mirrors scai's `CampaignRecipeSchema` with the registry's
 * `kind` + `schemaVersion` + `handle` envelope so it can be authored as
 * a recipe alongside the rest of the registry surface.
 *
 * `brandKitId` is intentionally absent on the recipe — the brand kit
 * relationship is implied by the enclosing `StoryRecipe.brandkit`
 * reference; the orchestrator resolves the brand kit's id at seed time.
 */
/**
 * `CampaignRecipe` — scai's `CampaignRecipeSchema` (the Orchestrate project
 * wire contract — `name`, `sitecoreId`, `startDate`/`dueDate`, `brandKitId`,
 * `thumbnailUrl`) `.extend`ed with the registry's authoring layer:
 *   - recipe identity — `kind`, `schemaVersion`, required `handle`.
 *   - UI/authoring — `displayName`, the markdown-or-ProseMirror `description`,
 *     persona-handle `members` (resolved to Auth0 subs at sync, vs scai's raw
 *     `authorId`), the registry's `deliverables` shape, and `utm_campaign`
 *     (registry-local until the platform exposes a campaign-level UTM field).
 *   - `status` is the registry's `CampaignStatus` (same UPPER_SNAKE values).
 */
export const CampaignRecipe = ScaiCampaignRecipeSchema.extend({
  kind: z.literal("campaign"),
  schemaVersion: z.literal("1"),
  handle: HandleString,
  displayName: z.string().min(1),
  description: z
    .union([z.string(), z.record(z.string(), z.unknown())])
    .optional(),
  status: CampaignStatus.optional(),
  labels: z.array(z.string()).default([]),
  /**
   * Project members keyed by PERSONA HANDLE (the registry authoring shape) —
   * the orchestrator resolves each to an Auth0 sub at sync time. scai's
   * `CampaignMemberSchema` carries the resolved `authorId` instead; the first
   * listed persona is promoted to ADMIN on apply.
   */
  members: z
    .array(
      z.object({
        personaHandle: z
          .string()
          .min(1)
          .describe(
            "Short role handle for the member (typically `csm`, `designer`, etc.). The orchestrator maps it to a real member of the target org's directory at sync time.",
          ),
        role: z
          .enum(["ADMIN", "EDITOR", "VIEWER", "MEMBER"])
          .optional()
          .describe(
            "Role on the project. The first listed persona is promoted to ADMIN if no entry carries that role.",
          ),
      }),
    )
    .default([]),
  deliverables: z.array(CampaignDeliverable).default([]),
  utm_campaign: z
    .string()
    .optional()
    .describe(
      "Canonical `utm_campaign` slug — kebab-case. Inherited by every supporting brief; brief-level `fields.utm_campaign` overrides per asset. Registry-local until the platform exposes a campaign-level UTM field.",
    ),
});
export type CampaignRecipe = z.input<typeof CampaignRecipe>;
export type ParsedCampaignRecipe = z.output<typeof CampaignRecipe>;

/**
 * Canonical brand archetype dimensions. Hoisted from Story onto Brand —
 * archetype is a property of the Brand, and Stories inherit it via the
 * brand reference.
 *
 * Values are deliberately small enums (not free strings) so the picker
 * UI can surface a finite, scannable list.
 */
export const BRAND_ARCHETYPES = [
  "challenger",
  "premium",
  "mass-market",
  "boutique",
] as const;
export const BrandArchetype = z.enum(BRAND_ARCHETYPES);
export type BrandArchetype = z.infer<typeof BrandArchetype>;

export const STORY_MOTIONS = [
  "product-launch",
  "seasonal-promo",
  "always-on",
  "event",
  /** Sales-evaluation engagement — one "campaign" representing the
   *  prospect opportunity, with discovery + business-case briefs
   *  attached. The generator skips marketing Status realism (PAST/
   *  CURRENT/FUTURE marketing motion rules) and uses the
   *  SitecoreAI Evaluation knowledge block instead. Authored via
   *  the Evaluation tab on `/brands/[id]/stories/new`. */
  "evaluation",
] as const;
export const StoryMotion = z.enum(STORY_MOTIONS);
export type StoryMotion = z.infer<typeof StoryMotion>;

export const STORY_AUDIENCES = ["b2c", "b2b", "both"] as const;
export const StoryAudience = z.enum(STORY_AUDIENCES);
export type StoryAudience = z.infer<typeof StoryAudience>;

export const STORY_SCALES = ["regional", "national", "global"] as const;
export const StoryScale = z.enum(STORY_SCALES);
export type StoryScale = z.infer<typeof StoryScale>;

/**
 * Canonical marketing channels offered in the Story generator's
 * "Current channels" multiselect. Drives a checkbox-style picker UI;
 * authors can also add a custom string via the form's free-text
 * `Other` input. `StoryConfig.currentChannels` stays a loose
 * `string[]` so unknown channels (e.g. industry-specific media or
 * historical codenames like `paid-social`, `paid-search`, `display`)
 * survive round-tripping — the editor renders unknowns as removable
 * custom chips.
 */
export const MARKETING_CHANNELS = [
  "online-ads",
  "social",
  "email",
  "search",
  "tv",
  "radio",
  "ooh",
  "events",
] as const;
export type MarketingChannel = (typeof MARKETING_CHANNELS)[number];

/**
 * Sitecore Agentic Studio service categories — a registry-side taxonomy
 * grouping agents by the marketing function they support. NOT a concept
 * in scai's `AgentRecipeSchema` (which is flat); we add it to drive the
 * library picker UI and the Story generator's category-checkbox flow.
 *
 *   research              competitive monitoring, audience insight,
 *                          trend scanning. Tool-heavy, long-running.
 *   technical-marketing   SEO audits, schema markup, page-speed checks.
 *                          Bounded scope, structured findings.
 *   content               draft from brief, voice translate, expand.
 *                          Text-in/text-out, brand-voice grounded.
 *   editorial             style-guide check, fact-check, voice match.
 *                          Review-shaped, markup/diff output.
 */
export const AGENT_SERVICE_CATEGORIES = [
  "research",
  "technical-marketing",
  "content",
  "editorial",
] as const;
export const AgentServiceCategory = z.enum(AGENT_SERVICE_CATEGORIES);
export type AgentServiceCategory = z.infer<typeof AgentServiceCategory>;

/**
 * Agentic Studio agent output mode. Mirrors scai's `output` shape:
 * `text` = free-form response; `structured` = a selected schema id.
 * The `dynamic` flag is for runtime schema selection (rarely used).
 */
export const AgentOutput = z.object({
  format: z.enum(["text", "structured"]).default("text"),
  dynamic: z.boolean().optional(),
});
export type AgentOutput = z.input<typeof AgentOutput>;

/**
 * A Sitecore Agentic Studio agent — declarative definition.
 *
 * Mirrors scai's `AgentRecipeSchema` (single source of truth for what
 * scai's `agent` recipe kind validates + pushes); see
 * scai/src/agents/recipe/agent.schema.ts. The registry's wrapper adds
 * `kind` + `schemaVersion` + `handle` + `service` taxonomy on top.
 *
 * `tools` is a sparse record of platform tool toggles: keys like
 * `enableWebSearch`, `enableAgentApiContent`. Only keys present here
 * are sent on push — undefined keys leave whatever's on the tenant
 * untouched. See `scai agents tool list` for the full catalog.
 *
 * `skills` is an array of skill slugs the agent attaches at runtime;
 * scai resolves slugs → skill ids during push.
 *
 * **Deploy status**: Agentic Studio's BFF is cookie-gated — there is
 * no machine-credential token API today. The registry models +
 * generates agent recipes; the orchestrator-side `story_deploy`
 * worker cannot push them until either (a) Sitecore opens a token
 * API, or (b) we add a Playwright session arm to the worker.
 */
export const AgentRecipe = z.object({
  kind: z.literal("agent"),
  schemaVersion: z.literal("1"),
  handle: HandleString,
  /**
   * Display name of the agent. Identifies the agent when pushing —
   * scai matches on `name`, not on a tenant-side id.
   */
  name: z
    .string()
    .min(1)
    .describe(
      "Display name of the agent. Identifies the agent when pushing — scai matches on `name`, not on a tenant-side id.",
    ),
  displayName: z.string().min(1),
  description: z.string().optional(),
  /**
   * Service category — registry-side taxonomy for the library picker
   * and the Story generator's category checkboxes. Not pushed to the
   * tenant (Agentic Studio's schema has no equivalent field). Use
   * `tags` for tenant-visible labels.
   */
  service: AgentServiceCategory.describe(
    "Service category — registry-side taxonomy for the library picker and the Story generator's category checkboxes. Not pushed to the tenant (Agentic Studio's schema has no equivalent field). Use `tags` for tenant-visible labels.",
  ),
  /** System prompt / instructions the model conditions on. */
  prompt: z
    .string()
    .optional()
    .describe("System prompt / instructions the model conditions on."),
  /**
   * Free-form tags surfaced in the Agentic Studio UI. Convention:
   * include the service category as a tag so the live tenant's
   * filter shelf matches the registry taxonomy without a separate
   * `service` field on the wire.
   */
  tags: z
    .array(z.string())
    .default([])
    .describe(
      "Free-form tags surfaced in the Agentic Studio UI. Convention: include the service category as a tag so the live tenant's filter shelf matches the registry taxonomy without a separate `service` field on the wire.",
    ),
  /**
   * Execution mode — `standard` for a prompt + tools agent. Reserve
   * for future flow / workflow-agent modes; default `standard` covers
   * the current Agentic Studio standard-agent path.
   */
  executionMode: z
    .string()
    .default("standard")
    .describe(
      "Execution mode — `standard` for a prompt + tools agent. Reserve for future flow / workflow-agent modes; default `standard` covers the current Agentic Studio standard-agent path.",
    ),
  /**
   * Sparse platform-tool toggle map. Keys are scai-known tool slugs
   * (e.g. `enableWebSearch`, `enableAgentApiContent`); values are
   * booleans. Only keys present here are sent on push.
   */
  tools: z
    .record(z.string(), z.boolean())
    .default({})
    .describe(
      "Sparse platform-tool toggle map. Keys are scai-known tool slugs (e.g. `enableWebSearch`, `enableAgentApiContent`); values are booleans. Only keys present here are sent on push.",
    ),
  /**
   * Skill slugs to attach. scai resolves slugs to skill ids at push.
   */
  skills: z
    .array(z.string())
    .default([])
    .describe(
      "Skill slugs to attach. scai resolves slugs to skill ids at push.",
    ),
  output: AgentOutput.default({ format: "text" }),
});
export type AgentRecipe = z.input<typeof AgentRecipe>;
export type ParsedAgentRecipe = z.output<typeof AgentRecipe>;

// =========================================================================
//                                  BRAND
// =========================================================================
//
// Brand is the top-class entity in the registry's data model — the unit an
// AE/SE picks via the header brand-picker before doing anything else.
// Brands own:
//
//   - one or more Themes (CSS visual tokens; the "theming" subset)
//   - one Brand Kit (voice, glossary, restrictions — see `BrandkitRecipe`)
//   - a Competitor map (structured `Competitor[]`)
//   - a Product catalog (`Product[]` — what the brand sells)
//   - one or more Audiences (main customer/user segments, persona-shaped)
//   - visual assets (logos, favicons, fonts — existing `theme_assets` rows)
//
// Stories (Marketing Ops, Conversion Opt, Agents) reference a Brand and
// inherit its framing (industry + archetype) and facets. Theme tokens are
// just one slot inside a Brand; theming = editing that slot.

/**
 * Reference to a theme owned by a Brand. A Brand can have 1:N themes —
 * the default theme is the one Stories pick up when they don't override.
 * `variantLabel` is operator-facing copy (e.g. "Default", "Spring 2026",
 * "Holiday", "B2B skin") so the theme list inside the Brand workspace
 * stays readable.
 */
export const ThemeReference = z.object({
  themeId: z.string().min(1),
  variantLabel: z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
});
export type ThemeReference = z.input<typeof ThemeReference>;

/**
 * Structured competitor record on a Brand. Replaces the prior free-text
 * `competitiveContext` paragraph on Marketing Ops Stories. The
 * `/api/stories/research-competitors` route already returns this shape
 * internally — Brand keeps it structured end-to-end.
 *
 *   threatLevel    primary  = direct competitor, audience overlap
 *                  adjacent = same customers, different category
 *                  fringe   = peripheral; named only because they exist
 */
export const COMPETITOR_THREAT_LEVELS = [
  "primary",
  "adjacent",
  "fringe",
] as const;
export const CompetitorThreatLevel = z.enum(COMPETITOR_THREAT_LEVELS);
export type CompetitorThreatLevel = z.infer<typeof CompetitorThreatLevel>;

export const Competitor = z.object({
  handle: HandleString,
  name: z.string().min(1),
  displayName: z.string().min(1),
  positioning: z.string().min(1),
  differentiators: z.array(z.string()).default([]),
  channels: z.array(z.string()).default([]),
  threatLevel: CompetitorThreatLevel.default("primary"),
  notes: z.string().optional(),
});
export type Competitor = z.input<typeof Competitor>;

/**
 * Product lifecycle stages. Drives which products show up in different
 * Story motions — e.g. a `product-launch` Story targets `concept` or
 * just-`launched` products; `always-on` targets `mature`; a wind-down
 * motion targets `sunsetting`.
 */
export const PRODUCT_LIFECYCLES = [
  "concept",
  "launched",
  "mature",
  "sunsetting",
  "retired",
] as const;
export const ProductLifecycle = z.enum(PRODUCT_LIFECYCLES);
export type ProductLifecycle = z.infer<typeof ProductLifecycle>;

/**
 * One product in a Brand's catalog. Lets Stories anchor on real
 * inventory rather than inventing product names in-prompt — a
 * Marketing Ops product-launch Story for FormaLux selects the Folwell
 * Dining Table from the catalog; the generated briefs and campaigns
 * reference it by name, not a placeholder.
 */
export const Product = z.object({
  handle: HandleString,
  name: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().optional(),
  /** Product category — "Dining tables", "Smart thermostats", "Checking accounts". */
  category: z
    .string()
    .min(1)
    .describe(
      'Product category — "Dining tables", "Smart thermostats", "Checking accounts".',
    ),
  /** One-line value proposition. */
  positioning: z.string().min(1).describe("One-line value proposition."),
  priceRange: z
    .object({
      min: z.number().nonnegative(),
      max: z.number().nonnegative(),
      currency: z.string().min(1),
    })
    .optional(),
  lifecycle: ProductLifecycle.default("mature"),
  /** Channels where the product is sold (d2c, retail, wholesale, etc.). */
  channels: z
    .array(z.string())
    .default([])
    .describe(
      "Channels where the product is sold (d2c, retail, wholesale, etc.).",
    ),
  /** Audience handle references (or free-text labels if no Audience records yet). */
  audiences: z
    .array(z.string())
    .default([])
    .describe(
      "Audience handle references (or free-text labels if no Audience records yet).",
    ),
  /** Competitor product names this product competes against. */
  competitiveAlternatives: z
    .array(z.string())
    .default([])
    .describe("Competitor product names this product competes against."),
  tags: z.array(z.string()).default([]),
});
export type Product = z.input<typeof Product>;

/**
 * Audience — the main customer/user segments the Brand markets to.
 *
 * Intentionally minimal in v1: `description` + `motivations` are the
 * load-bearing fields; the rest are optional. This is persona-shaped
 * context (qualitative), NOT an analytics segment-builder. Conversion
 * Opt Stories will generate richer per-Story `CustomerPersona[]` that
 * may extend or reference these Brand-level audiences.
 *
 *   archetype   `primary` for the main market; `secondary` for
 *               adjacent; `decision-maker` / `influencer` / `end-user`
 *               for B2B-style multi-stakeholder modelling.
 */
export const AUDIENCE_ARCHETYPES = [
  "primary",
  "secondary",
  "decision-maker",
  "influencer",
  "end-user",
] as const;
export const AudienceArchetype = z.enum(AUDIENCE_ARCHETYPES);
export type AudienceArchetype = z.infer<typeof AudienceArchetype>;

export const Audience = z.object({
  handle: HandleString,
  name: z.string().min(1),
  displayName: z.string().min(1),
  /** 1-2 sentence description of who this audience is. */
  description: z
    .string()
    .min(1)
    .describe("1-2 sentence description of who this audience is."),
  /** What drives them. 3-5 bullets typical. */
  motivations: z
    .array(z.string())
    .default([])
    .describe("What drives them. 3-5 bullets typical."),
  archetype: AudienceArchetype.default("primary"),
  /** Free-text demographics summary; v1 keeps this loose. */
  demographics: z
    .string()
    .optional()
    .describe("Free-text demographics summary; v1 keeps this loose."),
  /** Channels where the audience can be reached. */
  channels: z
    .array(z.string())
    .default([])
    .describe("Channels where the audience can be reached."),
  buyingStage: z
    .enum(["awareness", "consideration", "decision", "retention"])
    .optional(),
});
export type Audience = z.input<typeof Audience>;

/**
 * Top-class Brand record. Everything an AE/SE needs to know about a
 * prospect's identity, with each facet optionally generated or
 * hand-authored. The Brand record itself is a thin envelope; most
 * facets reference per-facet storage (theme rows, brand-kit asset
 * rows, etc.) rather than embedding the data inline.
 *
 * 1:N cardinality with themes: a Brand can carry seasonal variants
 * ("Spring 2026"), audience-specific skins ("B2B"), or experimental
 * looks under one identity. `defaultThemeId` is the variant Stories
 * pick up when no override is specified.
 *
 * Sub-brand rule (when modelling a brand with multiple identities):
 * same brand kit → themes within ONE Brand; different brand kit →
 * separate Brands. Voice identity is the dividing line.
 *
 * Positioning is INTENTIONALLY not a separate facet — it lives inside
 * the Brand Kit's "Brand Context" section (Mission / Vision /
 * Positioning fields) where it semantically belongs.
 */
export const BrandRecipe = z.object({
  kind: z.literal("brand"),
  schemaVersion: z.literal("1"),
  handle: HandleString,
  /** Stable codename — also the orchestrator-side record key. */
  name: z
    .string()
    .min(1)
    .describe("Stable codename — also the orchestrator-side record key."),
  displayName: z.string().min(1),
  description: z.string().optional(),
  /**
   * Industry as a free string. Stories inherit this — there's no
   * per-Story override.
   */
  industry: z
    .string()
    .min(1)
    .describe(
      "Industry as a free string. Stories inherit this — there's no per-Story override.",
    ),
  /** Brand archetype. Stories inherit. */
  archetype: BrandArchetype.describe("Brand archetype. Stories inherit."),
  /**
   * Theme references — 1:N. Empty array is invalid (a Brand must own
   * at least one theme); enforced at the orchestrator-side create
   * step, not in the schema (so a Brand record can briefly exist
   * between create and first-theme-attach).
   */
  themes: z
    .array(ThemeReference)
    .default([])
    .describe(
      "Theme references — 1:N. Empty array is invalid (a Brand must own at least one theme); enforced at the orchestrator-side create step, not in the schema (so a Brand record can briefly exist between create and first-theme-attach).",
    ),
  /**
   * The theme that Stories use when they don't specify an override.
   * MUST be a `themeId` present in `themes[]`; the orchestrator
   * validates this on read. Optional only because a freshly-created
   * Brand may not have themes yet.
   */
  defaultThemeId: z
    .string()
    .min(1)
    .optional()
    .describe(
      "The theme that Stories use when they don't specify an override. MUST be a `themeId` present in `themes[]`; the orchestrator validates this on read. Optional only because a freshly-created Brand may not have themes yet.",
    ),
  /**
   * Brand kit — 1:1. Voice + glossary + restrictions. Stored as a
   * theme-asset row on the default theme today (orchestrator-side
   * implementation detail).
   */
  brandKit: BrandkitRecipe.optional().describe(
    "Brand kit — 1:1. Voice + glossary + restrictions. Stored as a theme-asset row on the default theme today (orchestrator-side implementation detail).",
  ),
  /** Structured competitor map — 1:N. */
  competitors: z
    .array(Competitor)
    .default([])
    .describe("Structured competitor map — 1:N."),
  /** Product catalog — 1:N. What the Brand sells. */
  products: z
    .array(Product)
    .default([])
    .describe("Product catalog — 1:N. What the Brand sells."),
  /** Main audiences — 1:N. Minimal persona-shaped records. */
  audiences: z
    .array(Audience)
    .default([])
    .describe("Main audiences — 1:N. Minimal persona-shaped records."),
  /**
   * Reserved for future facets. Kept as opaque records so the schema
   * doesn't churn each time a new facet is added; promote to typed
   * fields when their shape is settled.
   */
  reserved: z
    .record(z.string(), z.unknown())
    .optional()
    .describe(
      "Reserved for future facets. Kept as opaque records so the schema doesn't churn each time a new facet is added; promote to typed fields when their shape is settled.",
    ),
});
export type BrandRecipe = z.input<typeof BrandRecipe>;
export type ParsedBrandRecipe = z.output<typeof BrandRecipe>;

// =========================================================================
//                                  STORY
// =========================================================================

/**
 * Workflow status for a Story as it moves through the generator + seed
 * lifecycle. Distinct from a brief's status — this is the Story envelope.
 */
export const STORY_STATUSES = [
  "draft", // user has set some params, not generated yet
  "generating", // agentic generation in flight
  "generated", // briefs + campaigns generated, not yet seeded to a tenant
  "seeded", // pushed to a Sitecore AI tenant
  "failed", // generation or seed errored
] as const;
export const StoryStatus = z.enum(STORY_STATUSES);
export type StoryStatus = z.infer<typeof StoryStatus>;

/**
 * Parametric configuration for a Story — the AE/SE's inputs. Drives
 * agentic generation of brief + campaign content tuned to a specific
 * prospect. Distinct from the (older) theme-scoped Story model that
 * pre-baked a brand + briefs + campaigns into one file: this shape
 * captures what the AE TYPED IN, and the generated output lives on
 * the StoryRecipe's `generated` slot.
 */
/**
 * Parametric configuration for a Marketing Ops Story.
 *
 * **Phase 5 refit**: Brand-level identity (industry, archetype, theme,
 * competitors, brand voice) has been HOISTED to the Brand record.
 * Stories now reference a Brand via `brandId` (the legacy `brandHandle`
 * alias is still accepted on read) and inherit those fields server-side
 * at generation time. The Story carries only what's
 * specific to this marketing operation: which motion, which channels
 * are being used, which brief mix, how many campaigns, how many
 * employee personas to spin up.
 *
 * Removed fields (compared to schemaVersion 2):
 *   - `industry`, `archetype`     → on Brand
 *   - `themeId`                   → resolved from Brand.defaultThemeId
 *   - `competitiveContext`        → on Brand (Competitor[])
 *   - `agentCategories`           → moved to Agent Usage Story type (future)
 */
export const StoryConfig = z
  .object({
    /**
     * Required reference to the Brand this Story is for — the brand's
     * **surrogate id** (`b_<hex>`, or a legacy handle-shaped `acme@1`),
     * NOT a free-form handle. The generator fetches the Brand server-side
     * and embeds its industry, archetype, brand kit (voice + glossary),
     * and competitor list in the prompt.
     *
     * Accept-both (Phase 3): the canonical field is `brandId`; the legacy
     * `brandHandle` (carrying the same surrogate) is still accepted so
     * stored recipes validate without a data migration. The `.transform`
     * below coalesces them so parsed configs always expose `brandId`. New
     * stories emit `brandId`.
     */
    brandId: z
      .string()
      .min(1)
      .optional()
      .describe(
        "Canonical reference to the Brand — the brand's surrogate id (`b_<hex>`, or a legacy handle-shaped `acme@1`). Server resolves the Brand to inherit industry, archetype, brand kit voice, and competitor list — Stories do not carry these directly. Does not carry the `@<version>` suffix recipe handles use (legacy values may).",
      ),
    /**
     * @deprecated Legacy alias for {@link brandId} — held the brand
     * surrogate under a misleading name. Still accepted on read so stored
     * recipes validate; coalesced into `brandId` by the transform below.
     * Do not emit on new recipes.
     */
    brandHandle: z
      .string()
      .min(1)
      .optional()
      .describe(
        "Deprecated alias for `brandId` (same brand surrogate). Accepted for backward compatibility with stored recipes; new recipes emit `brandId`.",
      ),
    /**
     * Optional theme override. When the Brand has multiple themes (e.g.
     * "Default" + "Spring 2026"), the Story can target a specific
     * variant; defaults to the Brand's `defaultThemeId`.
     */
    themeOverrideId: z
      .string()
      .min(1)
      .optional()
      .describe(
        "Optional theme override — pick a specific theme from the Brand's theme list when not using the default. Useful for seasonal/variant Stories.",
      ),
    /** The marketing motion this Story models (current/latest in the brand's arc). */
    motion: StoryMotion.describe(
      "The marketing motion this Story models (current/latest in the brand's arc).",
    ),
    /** Audience focus for this Story. Brand-level Audiences may serve as guides; this is the Story-specific cut. */
    audience: StoryAudience.describe(
      "Audience focus for this Story. Brand-level Audiences may serve as guides; this is the Story-specific cut.",
    ),
    /** Geographic / market scale of this Story's motion. */
    scale: StoryScale.default("national").describe(
      "Geographic / market scale of this Story's motion.",
    ),
    /**
     * Channels in active use for this Story. UI restricts to the
     * canonical `MARKETING_CHANNELS` list plus custom additions. Drives
     * campaign deliverable mix.
     */
    currentChannels: z
      .array(z.string())
      .default([])
      .describe(
        "Channels the marketing operation is active on for this Story. Drives the campaign deliverables generator.",
      ),
    /**
     * Per-campaign brief-type codenames. For each campaign generated, the
     * generator emits one `BriefRecipe` of each type listed here, each
     * linked back to its parent campaign via `campaignHandle`.
     */
    perCampaignBriefTypes: z
      .array(z.string().min(1))
      .default([])
      .describe(
        "Brief-type codenames generated once per campaign, linked via `campaignHandle`.",
      ),
    /**
     * Standalone brief-type codenames. Generated once each, no campaign
     * linkage. Useful for evergreen content / lifecycle work.
     */
    standaloneBriefTypes: z
      .array(z.string().min(1))
      .default([])
      .describe(
        "Brief-type codenames generated as standalone briefs — one each, no campaign linkage.",
      ),
    /** Number of campaigns to generate. */
    campaignCount: z
      .number()
      .int()
      .min(1)
      .max(10)
      .default(1)
      .describe("Number of campaigns to generate. 1-10."),
  })
  // A Story must reference a Brand. Accept either the canonical `brandId`
  // or the legacy `brandHandle` (both carry the brand surrogate), but at
  // least one is required — a brand-less config can't be generated.
  .refine((v) => Boolean(v.brandId ?? v.brandHandle), {
    message: "A Story must reference a Brand via `brandId`.",
    path: ["brandId"],
  })
  // Coalesce the legacy alias into the canonical field so every parsed
  // config exposes `brandId`, regardless of which the stored recipe used.
  // The refine above runs first and guarantees one of the two is set, so
  // the coalesced value is non-undefined — assert that for the output type.
  .transform((v) => ({
    ...v,
    brandId: (v.brandId ?? v.brandHandle) as string,
  }));
export type StoryConfig = z.input<typeof StoryConfig>;
export type ParsedStoryConfig = z.output<typeof StoryConfig>;

/**
 * Generated content slot on a Story — populated by the agentic
 * generator from the `config` parameters. Empty until generation runs.
 */
/**
 * Generated content slot on a Marketing Ops Story. Populated by the
 * agentic generator from the `config` parameters + the linked Brand.
 *
 * `agents` and `brandkit` live elsewhere — agents move to a future
 * Agent Usage Story type; the Brand owns its kit independently.
 */
export const StoryGenerated = z.object({
  briefs: z.array(BriefRecipe).default([]),
  campaigns: z.array(CampaignRecipe).default([]),
  /** ISO-8601 timestamp. */
  generatedAt: Iso8601.optional().describe("ISO-8601 timestamp."),
  /** Model id that produced the content (e.g. `claude-opus-4-7`). */
  modelId: z
    .string()
    .optional()
    .describe("Model id that produced the content (e.g. `claude-opus-4-7`)."),
});
export type StoryGenerated = z.input<typeof StoryGenerated>;

/**
 * A demo Story configured for a specific prospect — the unit an AE or
 * SE creates in `/stories/marketing`, tunes parameters on, generates
 * agentic content for, and seeds into a Sitecore AI tenant.
 *
 * NOT theme-scoped (themes are long-lasting visual identity; Stories
 * are situational). Persisted in the orchestrator's DB, NOT in a
 * sibling recipe file under `themes/`. The `config` block captures
 * the AE's inputs; the `generated` block holds the LLM-produced
 * briefs + campaigns; `status` tracks the lifecycle.
 *
 * The orchestrator's `story_deploy` worker consumes this recipe to
 * push generated brief-instances + campaigns to a tenant via scai's
 * brief and campaign APIs.
 */
export const StoryRecipe = z.object({
  kind: z.literal("story"),
  schemaVersion: z.literal("3"),
  handle: HandleString,
  /** Stable codename — also the orchestrator-side record id. */
  name: z
    .string()
    .min(1)
    .describe("Stable codename — also the orchestrator-side record id."),
  displayName: z.string().min(1),
  description: z.string().optional(),
  status: StoryStatus.default("draft"),
  config: StoryConfig,
  generated: StoryGenerated.optional(),
});
export type StoryRecipe = z.input<typeof StoryRecipe>;
export type ParsedStoryRecipe = z.output<typeof StoryRecipe>;

// ===========================================================================
// OptimizationScenarioRecipe — declarative wizard preset for synthetic CDP
// analytics seed runs. A scenario = template (recipe-shaped, syncable). A
// seed run = execution (operational job, orchestrator_jobs row). The wizard
// loads a scenario's `defaults` into the 5-step form; the user overrides any
// field before dispatching a run.
// ===========================================================================

const OPTIMIZATION_TRAFFIC_TIER = z.enum(["small", "medium", "large"]);
const OPTIMIZATION_GEO_REGION = z.enum([
  "north-america",
  "europe",
  "asia-pacific",
  "latin-america",
  "middle-east-africa",
]);
const OPTIMIZATION_BUSINESS_MODEL = z.enum([
  "b2c-ecom",
  "b2b-leadgen",
  "hybrid",
]);
const OPTIMIZATION_INDUSTRY_PRESET = z.enum([
  "retail-cpg",
  "travel-leisure",
  "commercial-banking",
  "healthcare",
]);
const OPTIMIZATION_SCENARIO_TYPE = z.enum([
  "high-intent-low-conversion",
  "segment-growing",
  "lead-gen",
]);

const NumberTuple = z
  .tuple([z.number(), z.number()])
  .describe("Min/max range, inclusive.");

const ScenarioTrafficBaselineDefaults = z
  .object({
    tier: OPTIMIZATION_TRAFFIC_TIER.describe(
      "Volume tier — small (SMB/pilot), medium (mid-market), large (enterprise).",
    ),
    sessionsPerDay: z
      .number()
      .min(0)
      .describe("Planned daily session count at the chosen tier."),
    geoRegions: z
      .array(OPTIMIZATION_GEO_REGION)
      .describe("Geographic regions to seed traffic across."),
    relativeHours: z
      .number()
      .min(0)
      .describe(
        "Window length in hours, measured from the per-dispatch start time. The wizard's `absoluteStart` is set at dispatch time, not stored on the scenario.",
      ),
    tickIntervalMinutes: z
      .number()
      .positive()
      .describe("Dispatch cadence — emit a batch every N minutes."),
  })
  .describe(
    "Traffic-baseline defaults loaded into wizard step 1. `absoluteStart` and `customerPercentage` are wizard-only — not persisted on the scenario.",
  );

const ScenarioBusinessModelDefaults = z
  .object({
    model: OPTIMIZATION_BUSINESS_MODEL.describe(
      "Audience type — drives the wizard's conversion-rate + pageview defaults.",
    ),
    mobileTraffic: z
      .number()
      .min(0)
      .max(1)
      .describe("Mobile-traffic fraction (0..1)."),
    peakHoursBoost: z
      .number()
      .min(0)
      .describe(
        "Multiplier applied to peak-hours traffic. 1.0 = no boost; 1.5–2.0 is typical for e-commerce dayparts.",
      ),
    sessionsToPageviews: NumberTuple.describe(
      "Min/max sessions-to-pageviews ratio. e.g., [2, 4] = 2–4 pageviews per session.",
    ),
    conversionRate: NumberTuple.describe(
      "Min/max conversion-rate range. Fractions (0..1) or percents (0..100); the wizard normalises.",
    ),
  })
  .describe("Business-model defaults loaded into wizard step 2.");

const ScenarioIndustryPresetDefaults = z
  .object({
    preset: OPTIMIZATION_INDUSTRY_PRESET.describe(
      "Industry preset — selects the wizard's default deviceMix, peak-hours range, primary/secondary conversion events.",
    ),
  })
  .describe(
    "Industry-preset defaults loaded into wizard step 3. The preset choice cascades into deviceMix, peakHoursRange, etc. — those derived fields aren't carried on the scenario.",
  );

const ScenarioBehaviorDefaults = z
  .object({
    type: OPTIMIZATION_SCENARIO_TYPE.describe(
      "Behavioural narrative — drives which CDP event types emit and at what rate.",
    ),
    modifiers: z
      .record(z.string(), z.number())
      .default({})
      .describe(
        "Per-event multipliers (keyed by event name) layered on top of the scenario's defaults. Use sparingly — most overrides belong in custom scenarios.",
      ),
  })
  .describe("Scenario defaults loaded into wizard step 4.");

const ScenarioReviewDefaults = z
  .object({
    syntheticIdPrefix: z
      .string()
      .min(1)
      .describe(
        "Prefix used when minting synthetic guest IDs. Lets a downstream CDP query distinguish seeded traffic from real.",
      ),
    dryRun: z
      .boolean()
      .default(true)
      .describe(
        "When true, the dispatcher skips real CDP writes and only computes volumes. Scenarios default dryRun ON; the wizard's reviewer must opt-in to a live dispatch.",
      ),
  })
  .describe(
    "Review-step defaults. `runId` is minted per dispatch; `clientSecretCDP` is resolved server-side from the org credential store, never on the scenario.",
  );

export const OptimizationScenarioRecipe = z.object({
  kind: z.literal("optimization-scenario"),
  schemaVersion: z.literal("1"),
  handle: HandleString,
  /** Stable codename — also the orchestrator-side record key on brand_scenarios. */
  name: z
    .string()
    .min(1)
    .describe(
      "Stable codename — also the orchestrator-side record key on brand_scenarios.",
    ),
  displayName: z.string().min(1),
  description: z.string().optional(),
  /**
   * Industry tag, free string. Filters the wizard's preset picker.
   * Independent from `defaults.industryPreset.preset` (e.g., a generic
   * "B2B Lead-Gen Baseline" scenario can carry `industry: "saas"` and
   * `preset: "commercial-banking"`).
   */
  industry: z
    .string()
    .optional()
    .describe(
      "Industry tag, free string. Filters the wizard's preset picker. Independent from `defaults.industryPreset.preset`.",
    ),
  /**
   * Optional volume-tier suggestion surfaced in the picker alongside
   * `defaults.trafficBaseline.tier`. Lets a scenario advertise "this
   * fits a Tier-4 mid-market brand" without forcing the tier value.
   */
  tier: OPTIMIZATION_TRAFFIC_TIER.optional().describe(
    "Optional volume-tier suggestion surfaced in the picker alongside `defaults.trafficBaseline.tier`.",
  ),
  tags: z
    .array(z.string())
    .default([])
    .describe("Free-form tags for filtering and categorisation."),
  sourceLink: z
    .string()
    .url()
    .optional()
    .describe(
      "URL pointing at the research / playbook this scenario codifies.",
    ),
  defaults: z
    .object({
      trafficBaseline: ScenarioTrafficBaselineDefaults,
      businessModel: ScenarioBusinessModelDefaults,
      industryPreset: ScenarioIndustryPresetDefaults,
      scenario: ScenarioBehaviorDefaults,
      review: ScenarioReviewDefaults,
    })
    .describe(
      "Wizard defaults this scenario loads. The wizard merges them into form state when the scenario is selected; the user can override any field before dispatching a run.",
    ),
});
export type OptimizationScenarioRecipe = z.input<
  typeof OptimizationScenarioRecipe
>;
export type ParsedOptimizationScenarioRecipe = z.output<
  typeof OptimizationScenarioRecipe
>;

/**
 * Plain `z.union` (not `z.discriminatedUnion`) because
 * `ComponentTemplateRecipe` carries a top-level `.refine` for the
 * `parameters`/`params` mutex, which produces a `ZodEffects` wrapper
 * that `discriminatedUnion` doesn't accept. The linear-scan cost is
 * negligible — the union has a handful of members and `kind` is the
 * first key.
 */
export const Recipe = z.union([
  ComponentSectionRecipeSchema,
  ComponentTemplateRecipe,
  ContentTemplateRecipeSchema,
  DesignParametersTemplateRecipeSchema,
  SectionDefinitionRecipe,
  EnumerationRecipeSchema,
  PageTemplateRecipeSchema,
  PageRecipeSchema,
  SiteTemplateRecipeSchema,
  SiteRecipeSchema,
  DictionaryRecipeSchema,
  ContentItemRecipeSchema,
  PartialDesignRecipeSchema,
  PageDesignRecipeSchema,
  VariantRecipeSchema,
  BrandkitRecipe,
  BrandRecipe,
  BriefTypeRecipe,
  BriefRecipe,
  CampaignRecipe,
  AgentRecipe,
  StoryRecipe,
  OptimizationScenarioRecipe,
]);
export type Recipe = z.infer<typeof Recipe>;
