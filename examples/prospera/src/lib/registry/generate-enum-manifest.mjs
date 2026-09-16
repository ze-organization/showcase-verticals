/**
 * Build-time generator for `.sitecore/enum-manifest.json` — the
 * GUID → readable-name table the runtime droplist resolver consults.
 *
 * What it does:
 *   1. Reads `SITECORE_ENUMERATIONS_ROOTS` (comma-separated absolute
 *      Sitecore paths) and `SITECORE_EDGE_CONTEXT_ID` from the env.
 *      Multi-site installs declare every site's enumerations root in
 *      that one var; the orchestrator's install pipeline writes it.
 *   2. For each declared root, issues a single Edge GraphQL query
 *      walking up to 6 levels deep — enough for the recipe convention
 *      `<enumerationsRoot>/[<folder>/]<EnumName>/<ValueName>` even with
 *      nested grouping folders.
 *   3. Collects every descendant whose template name is
 *      `Enumeration Value` and whose `Value` shared field has a
 *      non-empty string. Maps `item.id` → `Value` field content.
 *   4. Always writes the manifest, even when empty. The runtime
 *      loader's static import depends on the file existing.
 *
 * Failure modes (graceful — never aborts `next build`):
 *   - Missing env var → warn, write empty manifest, exit 0.
 *   - Edge unreachable / 4xx / 5xx → warn, skip that root, continue.
 *     Other roots' results survive.
 *   - GraphQL errors on a path → warn, skip that path, continue.
 *
 * Why ALWAYS write (instead of skipping the file when nothing
 * resolved): the runtime loader does `import manifest from
 * ".sitecore/enum-manifest.json"`, which the bundler resolves at
 * compile time. A missing file would be a hard webpack error rather
 * than the intended "no resolution available, GUIDs flow through"
 * graceful degrade.
 *
 * Run via: `node ./src/lib/registry/generate-enum-manifest.mjs`
 * Designed as a `prebuild` script — `next build` triggers it, then
 * webpack picks up the freshly-emitted JSON.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Load `.env` then `.env.local` into `process.env`, matching Next.js:
 * already-set process env wins, and `.env.local` overrides `.env`.
 *
 * Standalone `node` (what `pnpm predev` / `prebuild` become) does NOT
 * auto-load either file the way `next dev` / `next build` do. Loading
 * only `.env` left `SITECORE_ENUMERATIONS_ROOTS` unset when it lived in
 * `.env.local`, so the generator wrote `{}` even with a valid Edge id.
 *
 * `process.loadEnvFile` (Node ≥ 21) never overwrites existing keys, so
 * `.env.local` is applied first and `.env` fills remaining gaps. Shell /
 * CI injection still wins because it is already on `process.env`.
 */
const loadEnvFile = (relativePath) => {
  if (typeof process.loadEnvFile !== "function") return;
  try {
    process.loadEnvFile(path.join(process.cwd(), relativePath));
  } catch {
    // Missing or unreadable — fine. Direct env-var injection still wins.
  }
};
loadEnvFile(".env.local");
loadEnvFile(".env");

const OUT_PATH = path.join(process.cwd(), ".sitecore", "enum-manifest.json");

/**
 * Always emit the manifest before any non-zero exit can fire.
 * Without this, a transient Edge outage during prebuild leaves
 * `.sitecore/enum-manifest.json` stale (or absent on first run),
 * which surfaces as a confusing webpack error rather than the
 * intended "no manifest, raw GUIDs in DOM" diagnostic.
 */
const writeManifest = async (manifest) => {
  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
};

const exitWithEmpty = async (reason) => {
  process.stderr.write(`[enum-manifest] ${reason} — writing empty manifest.\n`);
  await writeManifest({});
  process.exit(0);
};

const contextId = (
  process.env.SITECORE_EDGE_CONTEXT_ID ||
  process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID ||
  ""
).trim();
if (!contextId) {
  await exitWithEmpty("SITECORE_EDGE_CONTEXT_ID is not set");
}

const rootsRaw = (process.env.SITECORE_ENUMERATIONS_ROOTS || "").trim();
if (!rootsRaw) {
  await exitWithEmpty(
    "SITECORE_ENUMERATIONS_ROOTS is not set (comma-separated Sitecore paths)",
  );
}

const roots = rootsRaw
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const edgeUrl = (
  process.env.SITECORE_EDGE_URL ||
  process.env.NEXT_PUBLIC_SITECORE_EDGE_URL ||
  "https://edge-platform.sitecorecloud.io"
).replace(/\/+$/, "");
const endpoint = `${edgeUrl}/v1/content/api/graphql/v1?sitecoreContextId=${encodeURIComponent(contextId)}`;

/**
 * Edge GraphQL `item` requires a `language`. The Value-field content
 * we read is language-invariant (it's stored on the SHARED field, not
 * versioned per-language) — but the resolver still demands a language
 * param for the field projection to compile, so we default to `en` and
 * let the orchestrator override via `SITECORE_DEFAULT_LANGUAGE` when
 * the install targets a non-English-default tenant.
 */
const language = (
  process.env.SITECORE_DEFAULT_LANGUAGE ||
  process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ||
  "en"
).trim();

/**
 * Edge GraphQL recursive walk. Three levels of children covers the
 * recipe's tree shape:
 *
 *   <root>                           ← `item(path:)`, the enumerations
 *                                       root for the site
 *     <folder>?                      ← child level 1 (optional
 *                                       `location.folder` grouping —
 *                                       e.g. `Theme`)
 *       <EnumName>                   ← child level 2 (enum container —
 *                                       e.g. `ColorScheme`)
 *         <ValueName>                ← child level 3 (the value items —
 *                                       `primary`, `secondary`, etc.)
 *
 * Going deeper than 3 levels trips Edge's query-complexity budget
 * ("Query is too complex to execute"), so we hard-cap here. Recipes
 * with multi-segment `location.folder` paths (`"Theme/Color"`) push
 * values to level 4; those won't be picked up by this walk and need
 * either a flat folder structure or a recipe-side change.
 *
 * Inline recursion (vs. per-level pagination) keeps the round-trip
 * count to 1 per root, which matters because Edge bills per query
 * and the prebuild step blocks `next:build` until it finishes.
 *
 * Children are projected without a language arg (Edge defaults
 * descendant projection to the parent's language); only the root
 * `item(path:)` call is required to declare it.
 *
 * Why no `template { name }` projection: Edge's complexity scoring
 * charges heavily for nested lookups across recursion levels, and
 * adding `template { name }` per node trips the budget. We don't
 * need it — `Value`-field presence is a sufficient leaf-identification
 * signal because the recipe convention only writes that shared field
 * on `Enumeration Value` items. Folders and `Enumeration` containers
 * have no `Value` field, so the projection returns null and they're
 * naturally filtered out at collection time.
 */
const ENUM_WALK_QUERY = /* GraphQL */ `
  query EnumWalk($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      ...ItemSummary
      children { results {
        ...ItemSummary
        children { results {
          ...ItemSummary
          children { results {
            ...ItemSummary
          }}
        }}
      }}
    }
  }
  fragment ItemSummary on Item {
    id
    name
    field(name: "Value") { value }
  }
`;

const fetchTree = async (rootPath) => {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: ENUM_WALK_QUERY,
      variables: { path: rootPath, language },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `HTTP ${res.status} ${res.statusText}: ${body.slice(0, 400)}`,
    );
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(
      `GraphQL errors: ${JSON.stringify(json.errors).slice(0, 400)}`,
    );
  }
  return json.data?.item ?? null;
};

/**
 * Recipe convention (per registry's `EnumerationRecipe` doc): each
 * value item conforms to the `Enumeration Value` template and stores
 * its readable token on the `Value` shared field. Empty / missing
 * `Value` field → not a value item (it's a folder, an `Enumeration`
 * container, or some other ambient template), so skip.
 *
 * We rely on Value-field presence alone to identify leaves rather
 * than checking `template.name === "Enumeration Value"` — the
 * template projection blows past Edge's query-complexity budget when
 * applied to a 4-deep recursive walk. The convention guarantees the
 * shared `Value` field only exists on the `Enumeration Value`
 * template, so this filter is functionally equivalent.
 */
const isEnumValue = (item) =>
  typeof item?.field?.value === "string" && item.field.value.length > 0;

/**
 * Walk the recursive item tree, accumulating GUID → Value-field
 * mappings into `manifest`. Mutates `manifest` in place; returns the
 * count of new entries added (for log output). Re-encountered IDs
 * across multiple roots are idempotent — stable uuidv5 derivations
 * mean the same site's GUID always resolves to the same value.
 */
const collect = (item, manifest) => {
  if (!item) return 0;
  let added = 0;
  if (isEnumValue(item) && !manifest[item.id]) {
    manifest[item.id] = item.field.value;
    added += 1;
  }
  for (const child of item.children?.results ?? []) {
    added += collect(child, manifest);
  }
  return added;
};

const manifest = {};
let anySucceeded = false;
for (const root of roots) {
  try {
    const item = await fetchTree(root);
    if (!item) {
      process.stderr.write(`[enum-manifest] ${root}: not found, skipping\n`);
      continue;
    }
    const added = collect(item, manifest);
    process.stderr.write(`[enum-manifest] ${root}: +${added} entries\n`);
    anySucceeded = true;
  } catch (err) {
    process.stderr.write(
      `[enum-manifest] ${root}: ${err instanceof Error ? err.message : String(err)}\n`,
    );
  }
}

await writeManifest(manifest);
const total = Object.keys(manifest).length;
process.stderr.write(
  `[enum-manifest] wrote ${total} entries to ${path.relative(process.cwd(), OUT_PATH)}` +
    `${anySucceeded ? "" : " (all roots failed — see warnings above)"}\n`,
);
