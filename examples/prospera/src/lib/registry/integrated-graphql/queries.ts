/**
 * Sitecore Integrated GraphQL queries served by `/api/sitecore/igql`.
 *
 * Both queries hit the Sitecore Edge GraphQL endpoint and return
 * shapes the React components can consume directly:
 *
 *   - {@link ANCESTORS_QUERY} — walks the parent chain of `itemId`,
 *     for callers that need a trail without curated authoring.
 *   - {@link CHILDREN_QUERY} — fetches the direct children of
 *     `itemId`. Used by `link-list@1` when its `ParentRef` field is
 *     set (tree-reference authoring mode).
 *
 * Both queries return only the fields the React components read:
 * id, name, title (page-template Title), navigationTitle (when
 * authored), and url. Edge returns these via the page item's
 * resolved fields plus the `ItemFields` interface.
 *
 * **Sitecore template contract.** The page templates the
 * walker traverses must expose:
 *
 *   - `Title` (single-line-text)        — preferred label.
 *   - `NavigationTitle` (single-line-text, optional) — overrides
 *     `Title` for navigation contexts. Mirrors the OOTB SXA
 *     `Navigation Title` field.
 *
 * Items without either field fall back to the item's `name`.
 */

export const ANCESTORS_QUERY = /* GraphQL */ `
  query Ancestors($itemId: String!, $language: String!) {
    item(path: $itemId, language: $language) {
      id
      name
      title: field(name: "Title") {
        value
      }
      navigationTitle: field(name: "NavigationTitle") {
        value
      }
      url {
        path
      }
      ancestors(
        hasLayout: true
        includeTemplateIDs: []
        excludeTemplateIDs: []
      ) {
        id
        name
        title: field(name: "Title") {
          value
        }
        navigationTitle: field(name: "NavigationTitle") {
          value
        }
        url {
          path
        }
      }
    }
  }
`;

export const CHILDREN_QUERY = /* GraphQL */ `
  query Children($itemId: String!, $language: String!) {
    item(path: $itemId, language: $language) {
      id
      name
      children(hasLayout: true) {
        results {
          id
          name
          title: field(name: "Title") {
            value
          }
          navigationTitle: field(name: "NavigationTitle") {
            value
          }
          url {
            path
          }
        }
      }
    }
  }
`;

/** Raw item shape Edge returns for the fields above. */
export interface IGQLItem {
  id?: string;
  name?: string;
  title?: { value?: string };
  navigationTitle?: { value?: string };
  url?: { path?: string };
}
