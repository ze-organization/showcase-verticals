import type { ComponentMap } from "@sitecore-content-sdk/nextjs";
import { AppPlaceholder } from "@/lib/registry/sitecore";
import type { ComponentWithContextProps } from "@/lib/registry/sitecore-types";
import { sitecorePassthrough } from "@/lib/registry/with-sitecore";

/**
 * Renders a partial design's contribution: the layout service puts the
 * partial's components under a child placeholder named by `params.sig`
 * (e.g. `sxa-syncfooter`), and this rendering re-opens that placeholder
 * on the page.
 *
 * `sitecorePassthrough` is load-bearing. Every other component-map entry
 * goes through the `withSitecore` adapter, which maps layout-service
 * input into presentation props and DROPS the SDK-injected `page` and
 * `componentMap`. This component re-enters the SDK (`AppPlaceholder`)
 * and needs both:
 *
 *   - without `page`, the SDK placeholder throws
 *     (`page.mode.isEditing` on undefined). Because the SDK wraps every
 *     placeholder child in a CLIENT ErrorBoundary, that server-side
 *     throw during static prerender makes React serialize the errored
 *     subtree — component map of functions included — across the
 *     client boundary, failing the starter build with the misleading
 *     "Functions cannot be passed directly to Client Components"
 *     instead of the real TypeError.
 *   - without the real `componentMap`, the partial's children can't
 *     resolve and every one renders as "unknown component" (the old
 *     empty-fallback-map behaviour).
 *
 * The empty-map fallback remains only for surfaces that render this
 * component outside the SDK component factory (showcase previews).
 */
const fallbackComponentMap: ComponentMap = new Map();

type PartialDesignDynamicPlaceholderProps = ComponentWithContextProps & {
  componentMap?: ComponentMap;
};

export const PartialDesignDynamicPlaceholder = sitecorePassthrough(
  (props: PartialDesignDynamicPlaceholderProps) => {
    // Never crash a prerender over a missing page context — a partial
    // shell with no content beats a failed build.
    if (!props.page) return null;
    return (
      <AppPlaceholder
        name={props.rendering?.params?.sig || ""}
        rendering={props.rendering}
        page={props.page}
        componentMap={props.componentMap ?? fallbackComponentMap}
      />
    );
  },
);

/**
 * `Default` is load-bearing, not a courtesy alias. The SDK resolves a
 * rendering with no `FieldNames` param via
 * `component.default || component.Default || component` — and the
 * component-map builder (`withSitecoreModule`) drops lowercase
 * `default` as a non-variant export. Without a PascalCase `Default`
 * the fallback lands on the map entry OBJECT itself, which React then
 * treats as an element type: a server-side "invalid element type"
 * throw that static prerender reports as "Functions cannot be passed
 * directly to Client Components … {PartialDesignDynamicPlaceholder:
 * function}".
 */
export const Default = PartialDesignDynamicPlaceholder;

export default PartialDesignDynamicPlaceholder;
