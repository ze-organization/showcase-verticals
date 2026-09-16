import type { AvatarBlockProps } from "@/components/registry/components/ui/avatar-block";
import { hoistLinkedItemFields } from "@/lib/registry/placeholder-children";
import type { Field, ImageField } from "@/lib/registry/sitecore";
import type { SitecoreInput } from "@/lib/registry/with-sitecore";

// `Field` is imported for the `AvatarBlockFields` interface below; the
// adapter passes fields through to the `<Text>` primitive (which
// handles both `Field<string>` and bare strings via `TextSource`), so
// no string-extraction helper is needed here.

/**
 * Layout-service field shapes for `avatar-block@1`. The rendering
 * accepts either of two compatible CONTENT templates, so the layout
 * service can deliver either field shape at any placement. The
 * interface lists every field both templates can supply — all
 * optional — and the adapter probes each pair.
 *
 *   avatar-item@1  → Name, Description, Image (the focused avatar
 *                    trio; a standalone content template at
 *                    `src/content/registry/models/avatar-item.recipe.ts`)
 *   author@1       → AuthorName, About, Avatar (+ richer profile
 *                    fields the avatar surface ignores: JobTitle,
 *                    Bio, Email, socials)
 *
 * The adapter normalises whichever shape arrives into `AvatarBlockProps`
 * by preferring the avatar-item names and falling back to the
 * author-template names. This means a placement bound to an Author
 * item still renders correctly; the un-mapped author fields (bio,
 * socials, etc.) simply aren't surfaced by this rendering.
 *
 * It also tolerates the nested `{id, fields: {…}}` linked-item
 * envelope: when the datasource item arrives via a reference field
 * (or an installed starter whose component map lacks
 * `flattenLinkedItems`), the item's real fields sit one level down
 * under `fields.fields`. `normalizeAvatarFields` hoists them via
 * `hoistLinkedItemFields` before mapping.
 *
 * Pair with `withSitecore` in the consumer's component map:
 *
 *   componentMap.set(
 *     "AvatarBlock",
 *     withSitecore<AvatarBlockFields, AvatarBlockProps>(
 *       AvatarBlock,
 *       mapAvatarBlock,
 *     ),
 *   );
 */
export interface AvatarBlockFields {
  // avatar-item@1 canonical field names — preferred when present.
  Name?: Field<string>;
  Description?: Field<string>;
  Image?: ImageField;
  // author@1 alternate field names — fallback when the datasource is an
  // Author item. The remaining author-only fields (JobTitle, Bio,
  // Email, socials) live on the template but are intentionally not
  // read here; richer renderings (author profile pages, bylines) can
  // declare their own adapter against the same template.
  AuthorName?: Field<string>;
  About?: Field<string>;
  Avatar?: ImageField;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Normalise the incoming `fields` envelope. The layout service usually
 * delivers the datasource's fields flat (`{Name, Description, Image}` /
 * `{AuthorName, About, Avatar}`), but an item that arrives through a
 * reference field — or an installed starter whose regenerated component
 * map lacks `flattenLinkedItems` — comes nested as
 * `{id, fields: {…real fields…}}`. Hoist the nested shape so the
 * mapper only ever probes one level.
 */
function normalizeAvatarFields(
  fields: AvatarBlockFields | undefined,
): AvatarBlockFields | undefined {
  if (fields == null || typeof fields !== "object") return undefined;
  const nested = (fields as { fields?: unknown }).fields;
  if (nested == null || typeof nested !== "object") return fields;
  return hoistLinkedItemFields<AvatarBlockFields & { id?: string }>([
    fields,
  ])[0];
}

/**
 * Coerce a Sitecore `ImageField` to the `ImageSource` shape the
 * `<Image>` primitive expects. Returns the field as-is when present so
 * Pages editing affordances stay intact; returns `undefined` when the
 * image has no `src` so the component falls through to the initials
 * fallback rather than rendering a broken `<img>`.
 */
function imageSource(field: ImageField | undefined): ImageField | undefined {
  if (!field) return undefined;
  const src = field.value?.src;
  if (!isNonEmptyString(src)) return undefined;
  return field;
}

const SHARED_SIZE_VALUES = new Set([
  "default",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
] as const);
type SharedSize = typeof SHARED_SIZE_VALUES extends Set<infer T> ? T : never;

function parseSize(value: string | undefined): AvatarBlockProps["size"] {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return SHARED_SIZE_VALUES.has(normalized as SharedSize)
    ? (normalized as SharedSize)
    : undefined;
}

function parseLayout(value: string | undefined): AvatarBlockProps["layout"] {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "stack") return "stack";
  if (normalized === "row") return "row";
  return "default";
}

/**
 * Translate the Sitecore Layout Service input (`{fields, params}`) into
 * `AvatarBlockProps`. Reads from whichever datasource shape the layout
 * service delivered (`avatar-item@1` field names preferred, `author@1`
 * field names as fallback), hoisting the nested `{id, fields: {…}}`
 * linked-item envelope first when present.
 */
export function mapAvatarBlock({
  fields: rawFields,
  params,
  isEditing,
}: SitecoreInput<AvatarBlockFields>): AvatarBlockProps {
  const fields = normalizeAvatarFields(rawFields);
  return {
    name: fields?.Name ?? fields?.AuthorName,
    description: fields?.Description ?? fields?.About,
    image: imageSource(fields?.Image ?? fields?.Avatar),
    size: parseSize(params?.Size),
    layout: parseLayout(params?.Layout),
    id: params?.RenderingIdentifier,
    styles: params?.styles,
    isEditing,
  };
}

// Pair with the `Default` variant the auto-generated component map
// resolves via `component.Default` (Sitecore's variant lookup falls
// through `component.default || component.Default || component`).
export { mapAvatarBlock as Default };
