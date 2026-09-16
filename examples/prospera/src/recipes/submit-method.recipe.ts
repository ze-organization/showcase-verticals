import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * HTTP submit-method enum backing the `SubmitMethod` rendering
 * parameter on forms-group components. POST is the default and
 * recommended choice — GET is exposed for endpoints that only accept
 * querystring submissions.
 *
 * Reference via `sitecore.enumHandle: "submit-method@1"`. Lands at
 * `<enumerationsRoot>/Submit Method` per-site.
 */
export const submitMethodEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "submit-method@1",
  name: "Submit Method",
  displayName: "Submit Method",
  description:
    "HTTP method for form submission. POST recommended; GET for endpoints that only accept querystring submissions.",
  location: { scope: "site", folder: ["Forms"] },
  default: "POST",
  values: [
    { name: "POST", displayName: "POST" },
    { name: "GET", displayName: "GET" },
  ],
} satisfies EnumerationRecipe;

export default submitMethodEnumRecipe;
