/**
 * Side-effect import that wires the build-time-emitted enum manifest
 * into the runtime droplist registry. Import this file once at the
 * earliest module-graph node that loads in every render path —
 * conventionally `src/Providers.tsx`:
 *
 *   import "@/lib/registry/enum-manifest-loader";
 *
 * The starter's `prebuild` script runs `generate-enum-manifest.mjs`,
 * which always writes `.sitecore/enum-manifest.json` (empty `{}` if
 * Edge wasn't reachable or env vars weren't set). The static import
 * below resolves at compile time, so the bundler inlines the manifest
 * — zero runtime fetch, zero async setup, zero client-bundle cost
 * beyond the manifest payload itself (a few KB at most).
 *
 * Why a relative path instead of the `.sitecore/*` tsconfig alias:
 *   - Turbopack (the default bundler in Next 16) does not resolve
 *     tsconfig path aliases whose key begins with a leading dot — it
 *     treats `.sitecore/...` as a bare specifier and fails. The
 *     relative traversal works in every bundler.
 *
 * Why import-time side effect (instead of `useEffect` or a Provider):
 *   - The droplist registry is a pure synchronous value lookup. A
 *     Provider would force every withSitecore-wrapped component into a
 *     React subtree, but Sitecore's component-map factory renders
 *     those components without a containing Provider boundary.
 *   - Module-graph load is the lifetime that matches "register once,
 *     read forever" — exactly the registry's contract.
 */

import { registerDroplistValues } from "@/lib/registry/with-sitecore";
import manifest from "../../../.sitecore/enum-manifest.json";

registerDroplistValues(manifest as Record<string, string>);
