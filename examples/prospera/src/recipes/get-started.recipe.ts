import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout, hubContentBlock, hubHero, type HubPlacement } from "./_hub-grammar";

function formTextField(
  slot: string,
  fields: Record<string, string>,
): HubPlacement {
  return {
    componentHandle: "form-text-field@1",
    variant: "Default",
    datasourceRef: { kind: "scoped", slot, fields },
  };
}

export const getStartedRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "get-started@1",
  name: "Get-Started",
  displayName: "Apply Now",
  description:
    "Apply Now — abstract primary hero, application steps as copy, and a short form. Path /Get-Started.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Get-Started",
  fields: {
    Title: "Apply Now",
    Eyebrow: "Application",
    MetaTitle: "Apply Now — Prospera",
    MetaDescription:
      "Start a Prospera application. Tell us who you are and what you need. A banker follows up. This form does not open a live account.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "monthly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Apply Now",
      title: "Start here. We will ask for the rest in order.",
      subtitle:
        "Personal checking, a card, a mortgage, a HELOC, or a business conversation. This page is a demonstration form — it does not open a live account or lock a rate.",
      primary: { href: "#form", text: "Start application" },
      secondary: { href: "/Products", text: "Browse Personal" },
      backgroundColor: "primary",
    }),
    hubContentBlock({
      slot: "Steps",
      eyebrow: "What happens next",
      title: "Three steps, stated as facts",
      body: "<ol><li><strong>Choose Personal or Business.</strong> Tell us whether this is a household account, a card or loan, or a commercial relationship.</li><li><strong>Share identity and contact.</strong> Legal name and email start the file. A banker may ask for address, Social Security number, or beneficial-owner details later — we do not collect those on this page.</li><li><strong>We follow up.</strong> Eligibility, illustrative fees, and required documents live on the product you selected. Approval is not guaranteed from this form.</li></ol><p><small>Prospera Bank, N.A., Member FDIC. Equal Housing Lender. This is not a live account opening.</small></p>",
    }),
    {
      componentHandle: "form-builder@1",
      variant: "Default",
      params: {
        FormColorScheme: "neutral",
        SubmitButtonColorScheme: "primary",
        SubmitButtonVariant: "default",
        CdpFormIntent: "decision",
      },
      datasourceRef: {
        kind: "scoped",
        slot: "Form",
        fields: {
          Title: "Start an application",
          Description:
            "<p>Legal name, email, and what you are applying for. We will not process a live account from this demonstration form.</p>",
        },
      },
      placeholders: {
        "form-fields": [
          formTextField("Name", {
            Name: "name",
            Label: "Legal name",
            Placeholder: "Your legal name",
            Required: "true",
          }),
          formTextField("Email", {
            Name: "email",
            Label: "Email",
            Placeholder: "you@example.com",
            Type: "email",
            Required: "true",
          }),
          formTextField("Product", {
            Name: "product",
            Label: "What are you applying for?",
            Placeholder: "Everyday checking, Rewards Visa, mortgage, HELOC, or Business",
            Required: "true",
          }),
        ],
      },
    },
  ]),
} satisfies PageRecipe;

export default getStartedRecipe;
