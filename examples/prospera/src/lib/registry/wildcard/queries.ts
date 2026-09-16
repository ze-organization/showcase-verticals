/**
 * Sitecore Edge GraphQL query powering the generic wildcard-page
 * resolver (`useWildcardItem` → `wildcard-detail@1`).
 *
 * A Sitecore *wildcard page* is a page item literally named `*`. One
 * wildcard page carries the design for a whole family of detail URLs;
 * the actual content item is resolved at request time from the URL's
 * last segment (the slug) against a configured data-folder root:
 *
 *   /products/silk-road-750   →   <SourceRoot>/silk-road-750
 *
 * {@link WILDCARD_ITEM_QUERY} fetches that content item by full path.
 * Unlike the breadcrumb/link-list IGQL queries (which read a fixed
 * pair of fields), a wildcard target can be *any* content template,
 * so the query pulls every own field generically via Edge's
 * `fields { name, jsonValue }` selection:
 *
 *   - Scalar fields arrive as layout-service-shaped values
 *     (`{ "value": "…" }` for text/rich-text, `{ "value": { "src",
 *     "alt" } }` for images) — directly consumable by the registry
 *     editables (`TextSource` / `ImageSource` / `RichTextSource`).
 *   - Reference fields (Droplink / Multilist / Treelist) arrive as an
 *     item object or an array of item objects (`{ id, name,
 *     displayName, url, fields: { … } }`), which is enough to render
 *     linked cards without a second roundtrip. `jsonValue` carries
 *     only the referenced items' immediate fields — nested references
 *     inside a referenced item are NOT expanded; anything deeper needs
 *     its own resolution pass.
 *
 * Same Edge schema assumptions as
 * `src/lib/registry/integrated-graphql/queries.ts`: `item(path:,
 * language:)` root field, `url { path }` for the canonical route.
 */

export const WILDCARD_ITEM_QUERY = /* GraphQL */ `
  query WildcardItem($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      id
      name
      displayName
      template {
        name
      }
      url {
        path
      }
      fields(ownFields: true) {
        name
        jsonValue
      }
    }
  }
`;

/** One `{ name, jsonValue }` entry from the Edge `fields` selection. */
export interface WildcardFieldJson {
  name?: string;
  /**
   * Layout-service-shaped value. Text/rich-text: `{ value: string }`.
   * Image: `{ value: { src, alt } }`. Link: `{ value: { href, text } }`.
   * Reference fields: an item object or array of item objects — see
   * `normalizeReferenceField` in ./normalize.ts.
   */
  jsonValue?: unknown;
}

/** Raw item shape Edge returns for {@link WILDCARD_ITEM_QUERY}. */
export interface WildcardItemRaw {
  id?: string;
  name?: string;
  displayName?: string;
  template?: { name?: string };
  url?: { path?: string };
  fields?: WildcardFieldJson[];
}

/** `data` shape of the {@link WILDCARD_ITEM_QUERY} response. */
export interface WildcardItemResponse {
  item?: WildcardItemRaw | null;
}
