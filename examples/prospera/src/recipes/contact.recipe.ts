import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  container1Layout,
  hubHero,
  type HubPlacement,
} from "./_hub-grammar";
import { peopleDemoGrid } from "./_people-demo-cards";

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

export const contactRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "contact@1",
  name: "Contact",
  displayName: "Contact",
  description:
    "Contact — short hero, decision-intent form (name, email, message), and a people strip. Path /Contact.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Contact",
  fields: {
    Title: "Contact",
    Eyebrow: "Reach us",
    MetaTitle: "Contact — Prospera",
    MetaDescription:
      "Write Prospera about Personal, Business, or a branch. Name, email, and a short note.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.7",
    ChangeFrequency: "monthly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Contact",
      title: "Ask a person, not a ticket queue.",
      subtitle:
        "Name, email, and a short note. We route messages to Personal, Business, or a branch.",
      primary: { href: "#form", text: "Write us" },
      secondary: { href: "/Locations", text: "Find a branch" },
      backgroundColor: "none",
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
          Title: "Send a note",
          Description:
            "<p>Tell us whether this is Personal, Business, or a branch visit. We reply from the team that owns it.</p>",
        },
      },
      placeholders: {
        "form-fields": [
          formTextField("Name", {
            Name: "name",
            Label: "Name",
            Placeholder: "Your name",
            Required: "true",
          }),
          formTextField("Email", {
            Name: "email",
            Label: "Email",
            Placeholder: "you@example.com",
            Type: "email",
            Required: "true",
          }),
          {
            componentHandle: "form-textarea-field@1",
            variant: "Default",
            datasourceRef: {
              kind: "scoped",
              slot: "Message",
              fields: {
                Name: "message",
                Label: "Message",
                Placeholder: "How can we help?",
                Required: "true",
              },
            },
          },
        ],
      },
    },
    peopleDemoGrid({
      title: "People you can ask",
      lead: "Amira Hassan for Personal, Julian Park for Business, Sofia Lang for Advice.",
    }),
  ]),
} satisfies PageRecipe;

export default contactRecipe;
