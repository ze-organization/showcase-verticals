import { wrapSitecoreClient } from "@/lib/registry/with-sitecore";
import {
  getGroomedVariantIds,
  personalizeLayout,
} from "@sitecore-content-sdk/nextjs";
import { SitecoreClient } from "@sitecore-content-sdk/nextjs/client";
import scConfig from "sitecore.config";

type PreviewBag = {
  variantId?: unknown;
  variantIds?: unknown;
};

/**
 * Content SDK 2.1's App Router editing handler writes `sc_variant` onto
 * preview data as `variantIds` (string or comma-separated list).
 * `getPreview` reads `variantId` and sends that as the GraphQL
 * `sc_variant` header. Left unmapped, Pages A/B / personalize switches
 * never reach layout data — the Content tab updates, the canvas stays
 * on the control experience until a full reload that still renders A.
 */
function previewVariantIds(previewData: unknown): string[] {
  if (!previewData || typeof previewData !== "object") return [];
  const bag = previewData as PreviewBag;
  const raw = bag.variantId ?? bag.variantIds;
  if (Array.isArray(raw)) {
    return raw.map(String).map((id) => id.trim()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }
  return [];
}

function withPreviewVariantId<T>(previewData: T): T {
  if (!previewData || typeof previewData !== "object") return previewData;
  const ids = previewVariantIds(previewData);
  if (!ids.length) return previewData;
  return { ...(previewData as object), variantId: ids.join(",") } as T;
}

const inner = new SitecoreClient({
  ...scConfig,
});

const fetchPreview = inner.getPreview.bind(inner);
inner.getPreview = async (previewData, fetchOptions) => {
  const page = await fetchPreview(
    withPreviewVariantId(previewData),
    fetchOptions,
  );
  if (!page?.layout) return page;
  const ids = previewVariantIds(previewData);
  if (!ids.length) return page;
  const { variantId, componentVariantIds } = getGroomedVariantIds(ids);
  personalizeLayout(page.layout, variantId, componentVariantIds);
  return page;
};

const client = wrapSitecoreClient(inner);

export default client;
