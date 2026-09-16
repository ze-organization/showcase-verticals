import { z } from "zod";

/**
 * CDP analytics event definitions — registry-local, never sourced from scai.
 *
 * These describe the CDP/Personalize event surface a registry component fires
 * through `useComponentAnalytics`. scai has no equivalent: the recipe compiler
 * does not consume them. They live here (a leaf module) rather than inline in
 * `sitecore-recipes.ts` so `recipes/scai-kinds.ts` can fold `events` into the
 * re-exported `ComponentTemplateRecipe` without a circular import back through
 * the `sitecore-recipes` shim. The shim re-exports everything here verbatim,
 * so the public import path (`@/lib/registry/sitecore-recipes`) is unchanged.
 */

/**
 * Canonical action verb for a CDP event — what the user did,
 * abstracted across components. Drives the synthetic-event generator's
 * journey shaping, dashboards' funnel rollups, and any future
 * personalization decision-model inputs that need to discriminate
 * "user submitted a form" from "user dismissed a banner."
 *
 * The set is intentionally small (10 verbs). New verbs should be
 * additions to existing categories before they become new enum
 * members — over-specifying erodes the abstraction.
 */
export const CdpEventAction = z.enum([
  "view",
  "identify",
  "add",
  "submit",
  "search",
  "share",
  "engage",
  "navigate",
  "dismiss",
  "abandon",
]);
export type CdpEventAction = z.infer<typeof CdpEventAction>;

/**
 * Journey-stage hint. **Optional** — events like `dismiss` and
 * `navigate` aren't journey-stage-specific and should leave this unset
 * (the generator won't condition on intent for those).
 */
export const CdpEventIntent = z.enum([
  "awareness",
  "research",
  "consideration",
  "decision",
  "loyalty",
  "advocacy",
]);
export type CdpEventIntent = z.infer<typeof CdpEventIntent>;

/**
 * Commitment ladder — how invested the user is in the moment the
 * event fires. Increases monotonically: browse < engage < provide-info
 * < commit < pay.
 */
export const CdpEventCommitment = z.enum([
  "browse",
  "engage",
  "provide-info",
  "commit",
  "pay",
]);
export type CdpEventCommitment = z.infer<typeof CdpEventCommitment>;

/**
 * Wire-level Sitecore CDP event type. Picks the Content SDK function
 * the runtime dispatches through:
 *
 *   VIEW             → `pageView()` from @sitecore-content-sdk/events
 *   IDENTITY         → `identity()` (meta must carry top-level email /
 *                      phone / identifiers fields per the IDENTITY
 *                      payload schema)
 *   FORM_VIEWED      → `form(formId, 'VIEWED', instanceId)` — meta
 *                      must carry `formId` + `instanceId`
 *   FORM_SUBMITTED   → `form(formId, 'SUBMITTED', instanceId)`
 *   ADD / CONFIRM /
 *   ORDER_CHECKOUT /
 *   SEARCH / SHARE   → `event({type: <enum>, extensionData})` —
 *                      canonical OOTB type strings the platform
 *                      recognises
 *   CUSTOM           → `event({type: <namespaced>, extensionData})`
 *                      where the type follows the Edge Proxy regex
 *                      `^[a-zA-Z0-9\-_./]{1,100}$` (NOT `:` — use `.`)
 *
 * The router lives in `src/lib/registry/analytics/cdp-provider.tsx`
 * (function `trackCdpEvent`). Adding a new value here requires a
 * matching case in that router.
 */
export const CdpWireEventType = z.enum([
  "VIEW",
  "IDENTITY",
  "ADD",
  "CONFIRM",
  "ORDER_CHECKOUT",
  "FORM_VIEWED",
  "FORM_SUBMITTED",
  "SEARCH",
  "SHARE",
  "CUSTOM",
]);
export type CdpWireEventType = z.infer<typeof CdpWireEventType>;

/**
 * Where the runtime should pull affinity tags from when the event
 * fires. Required only when `emitsAffinity: true`. The four sources
 * mirror the three places Sitecore-aware components typically encode
 * "what this content is about":
 *
 *   - `datasource-tags` — taxonomy items linked to the rendering's
 *     datasource (e.g. an article's `__Semantics` field). Most
 *     common for content components.
 *   - `datasource-fields` — named fields on the datasource itself
 *     (e.g. a product's `Category` field).
 *   - `params` — author-declared free-form tag list as a rendering
 *     parameter. Escape hatch for content without semantic metadata.
 */
export const CdpAffinitySource = z.enum([
  "datasource-tags",
  "datasource-fields",
  "params",
]);
export type CdpAffinitySource = z.infer<typeof CdpAffinitySource>;

/**
 * A CDP analytics event the React component fires through the
 * `useComponentAnalytics` hook. Recorded on the recipe so:
 *
 *   1. The catalog (`src/lib/registry/analytics/cdp-events.ts`) is the
 *      union of every installed recipe's `events` block — a customer
 *      installing a component automatically extends the catalog.
 *   2. The recipe is the single audit surface: scanning the recipes
 *      directory tells you every CDP event the registry can emit.
 *   3. Provider-side dispatch is name-driven (`<componentName>.<eventName>`),
 *      and the React component-side meta typing stays local to its file.
 *
 * **Naming convention.** `name` is the local key the React component
 * uses (e.g. `"view"`, `"dismiss"`) — short, verb-shaped, lowercase.
 * `type` is the unique CDP event identifier sent to Sitecore Edge Proxy
 * (e.g. `"alert-banner:viewed"`) — convention is `<component-kebab>:<verb>`.
 */
export const ComponentEventDef = z
  .object({
    /**
     * Local event key the React component dispatches against
     * (`useComponentAnalytics(name).fire(<name>, meta)`). Lowercase,
     * verb-shaped — `"view"`, `"dismiss"`, `"submit"`.
     */
    name: z
      .string()
      .min(1)
      .describe(
        'Local event key the React component fires against (e.g. "view", "dismiss"). Lowercase, verb-shaped.',
      ),
    /**
     * Unique CDP event type written to Sitecore Edge Proxy via the
     * events SDK. Convention: `<component-kebab>.<verb>`. Sitecore Edge
     * regex is `^[a-zA-Z0-9\-_./]{1,100}$` — `:` separators are NOT
     * accepted; use `.` instead. Must not collide with reserved SDK
     * event names — see https://doc.sitecore.com/xmc/en/developers/content-sdk/.
     */
    type: z
      .string()
      .min(1)
      .describe(
        "Unique CDP event type sent to Sitecore Edge Proxy. Convention: `<component-kebab>.<verb>` (Edge Proxy rejects `:` separators).",
      ),
    /** Author-facing description used by docs and the install picker. */
    description: z
      .string()
      .min(1)
      .describe(
        "Author-facing description used by docs and the install picker.",
      ),
    /** Marks the event as deprecated; consumers can warn or skip dispatch. */
    deprecated: z
      .boolean()
      .optional()
      .describe(
        "Marks the event as deprecated. The runtime still dispatches; consumers can choose to warn or skip.",
      ),

    // ─── Semantic classification ────────────────────────────────────
    // Required dimensions for every event. Recipes that omit them
    // fail validation at the satisfies-check site. Optional dimensions
    // stay optional (intent for stage-agnostic events, affinitySource
    // gated on emitsAffinity).

    /**
     * Canonical action verb. Drives the synthetic generator's
     * shaping and any consumer that needs to discriminate "user
     * submitted" from "user dismissed" without parsing the `type`
     * string. See `CdpEventAction` for the full list.
     */
    action: CdpEventAction.describe(
      "Canonical action verb. See CdpEventAction.",
    ),
    /**
     * Journey-stage hint. Leave unset for stage-agnostic events
     * (dismiss, navigate, share). See `CdpEventIntent`.
     */
    intent: CdpEventIntent.optional().describe(
      "Journey stage. Leave unset when the event is stage-agnostic.",
    ),
    /** Commitment level. See `CdpEventCommitment`. */
    commitment: CdpEventCommitment.describe(
      "Commitment ladder rung at the moment the event fires.",
    ),
    /**
     * Whether this event reliably resolves the visitor's identity
     * (typically because it carries a strong identifier — email,
     * phone, account ID). The runtime treats `true` as a hint to
     * fire an IDENTITY event alongside the wire-level event when
     * the relevant identifier is present in the payload.
     */
    emitsIdentity: z
      .boolean()
      .describe(
        "True when the event reliably resolves visitor identity (carries email/phone/account ID).",
      ),
    /**
     * Whether this event should attach affinity tags to the payload
     * for Sitecore Personalize to score against. `true` requires
     * `affinitySource` so the runtime knows where to read the tags
     * from.
     */
    emitsAffinity: z
      .boolean()
      .describe(
        "True when this event should attach affinity tags to its payload for Personalize scoring.",
      ),
    /**
     * Where to read affinity tags from when `emitsAffinity` is true.
     * Required iff `emitsAffinity: true` — the refinement below
     * enforces it.
     */
    affinitySource: CdpAffinitySource.optional().describe(
      "Where the runtime reads affinity tags from. Required when emitsAffinity is true.",
    ),
    /**
     * Wire-level CDP event type. `CUSTOM` means we emit a
     * namespaced `<component-kebab>.<verb>` type; the OOTB values
     * map to platform-side auto-capture types. See `CdpWireEventType`.
     */
    cdpEventType: CdpWireEventType.describe(
      "Wire-level Sitecore CDP event type.",
    ),
  })
  .refine((event) => !event.emitsAffinity || !!event.affinitySource, {
    message:
      "affinitySource is required when emitsAffinity is true — declare where the tags come from (datasource-tags / datasource-fields / params).",
    path: ["affinitySource"],
  });
export type ComponentEventDef = z.infer<typeof ComponentEventDef>;
