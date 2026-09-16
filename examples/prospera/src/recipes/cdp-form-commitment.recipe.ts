import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `CdpFormCommitment` rendering
 * parameter. Stamps a `data-cdp-form-commitment` attribute on the
 * rendered `<form>` so the OOTB FORM_SUBMIT auto-capture sees how
 * deep the user invested in the moment of submission.
 *
 * The full CdpEventCommitment ladder is browse < engage <
 * provide-info < commit < pay; on a *form* element only the top
 * two rungs are meaningful (browsing / engaging happens before
 * a form submission can fire).
 *
 * Reference via `sitecore.enumHandle: "cdp-form-commitment@1"`.
 */
export const cdpFormCommitmentEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "cdp-form-commitment@1",
  name: "CdpFormCommitment",
  displayName: "CDP Form Commitment",
  description:
    "Commitment level stamped on a form for OOTB Sitecore CDP FORM_SUBMIT classification.",
  location: { scope: "site", folder: ["Analytics", "CDP"] },
  default: "provide-info",
  values: [
    {
      name: "provide-info",
      displayName: "Provide info (trading data for content)",
    },
    {
      name: "commit",
      displayName: "Commit (ongoing relationship — subscribe / register)",
    },
    { name: "pay", displayName: "Pay (financial commitment — purchase)" },
  ],
} satisfies EnumerationRecipe;

export default cdpFormCommitmentEnumRecipe;
