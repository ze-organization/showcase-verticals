import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `Breadcrumb` component (./breadcrumb.tsx).
 *
 * **Programmatic + datasourceless.** The breadcrumb derives the page
 * trail from the current route at render time — the layout-service
 * context's `itemPath` (canonical route path, present on every SDK
 * page) with a `usePathname()` fallback — and upgrades the leaf
 * crumb's label from the route's authored title (NavigationTitle /
 * pageTitle / Title / displayName). No datasource block, no Items
 * Treelist, no `breadcrumb-item@1` content template, no per-placement
 * authoring: drop it on a page (or a shared partial design) and it
 * renders the tree. No GraphQL and no extra fetch either — installed
 * starters need zero additional wiring.
 *
 * Authors control presentation only, via rendering parameters that
 * mirror the `BreadcrumbNav` primitive's styling axes: trail length
 * (responsive / full "long" / shortened-with-ellipsis), separator
 * glyph, home crumb, and the current-page crumb.
 *
 * Typically placed near the top of content templates, directly under
 * the Header.
 */
export const breadcrumbRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "breadcrumb@1",
  icon: componentIcons["breadcrumb@1"],
  name: "breadcrumb",
  displayName: "Breadcrumb",
  description:
    "Programmatic breadcrumb navigation. Derives the page trail from the current route — no datasource, nothing to author. Styling options: trail length (responsive / full / shortened), separator glyph, home crumb, current-page crumb.",

  section: { handle: "navigation-section@1" },

  params: [
    {
      name: "TrailStyle",
      shape: "enum",
      default: "responsive",
      sitecore: {
        enumHandle: "breadcrumb-trail-style@1",
        hint: "Trail length: Responsive (default) collapses middle ancestors into an ellipsis dropdown on narrow screens and expands on wide ones; Full always shows the long trail; Shortened always collapses to first item + ellipsis + current page.",
        sortOrder: 100,
      },
    },
    {
      name: "Separator",
      shape: "enum",
      default: "chevron",
      sitecore: {
        enumHandle: "breadcrumb-separator@1",
        hint: "Glyph rendered between crumbs: chevron icon (default), slash (/), dot (·), or pipe (|).",
        sortOrder: 200,
      },
    },
    {
      name: "ShowHome",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Prepend a home crumb (with home icon) linking to the site root. On the home page itself the breadcrumb renders a single current-page crumb instead.",
        sortOrder: 300,
      },
    },
    {
      name: "HomeLabel",
      shape: "text",
      default: "Home",
      sitecore: {
        type: "single-line-text",
        hint: "Visible label for the home crumb. Defaults to 'Home' when blank.",
        sortOrder: 400,
      },
    },
    {
      name: "ShowCurrentPage",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Render the current page as the unlinked final crumb (aria-current=page). Uncheck to end the trail at the last ancestor link.",
        sortOrder: 500,
      },
    },
    {
      // Off by default — omitted `default` IS the unchecked Standard
      // Value (project convention for OFF checkboxes). Off also keeps
      // the rendering zero-network, which is what every existing
      // placement expects.
      name: "UseAuthoredTitles",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Label ancestor crumbs with each page's authored NavigationTitle/Title instead of a label guessed from its URL slug (`about-us` → `About Us`, even when the authored title is `Who We Are`). Requires Sitecore Edge: the lookup goes through the server-side GraphQL proxy, and falls back to the slug labels whenever Edge is unconfigured or the lookup fails. This is the rendering's only network request — leave unchecked when slug labels are already correct.",
        sortOrder: 600,
      },
    },
  ],

  variants: [{ name: "Default" }],
} satisfies ComponentTemplateRecipe;

export default breadcrumbRecipe;
