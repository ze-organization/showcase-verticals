import type { HubPlacement } from "./_hub-grammar";
import { picsum } from "./_hub-grammar";

/** Three Person cards reused on About, Leadership, and Contact. */
export function peopleDemoCards(): HubPlacement[] {
  return [
    {
      componentHandle: "person-card@1",
      variant: "Featured",
      datasourceRef: {
        kind: "scoped",
        slot: "CardAmira",
        fields: {
          FullName: "Amira Hassan",
          Role: "Head of Consumer Bank",
          Eyebrow: "Personal",
          Bio: "<p>Owns checking, savings, cards, and home lending — including the HELOC.</p>",
          Image: {
            shape: "image",
            mediaPath: picsum("amira-hassan", 800, 1000),
            alt: "Portrait of Amira Hassan",
          },
          Link: { href: "/People/amira-hassan", text: "View profile" },
        },
      },
    },
    {
      componentHandle: "person-card@1",
      variant: "Standard",
      datasourceRef: {
        kind: "scoped",
        slot: "CardJulian",
        fields: {
          FullName: "Julian Park",
          Role: "Commercial Banker",
          Eyebrow: "Business",
          Bio: "<p>Works with operators on treasury, payroll, and credit — the same proof you see in case studies.</p>",
          Image: {
            shape: "image",
            mediaPath: picsum("julian-park", 800, 1000),
            alt: "Portrait of Julian Park",
          },
          Link: { href: "/People/julian-park", text: "View profile" },
        },
      },
    },
    {
      componentHandle: "person-card@1",
      variant: "Standard",
      datasourceRef: {
        kind: "scoped",
        slot: "CardSofia",
        fields: {
          FullName: "Sofia Lang",
          Role: "Wealth Advisor",
          Eyebrow: "Advice",
          Bio: "<p>Plans that sit next to checking and the operating account.</p>",
          Image: {
            shape: "image",
            mediaPath: picsum("sofia-lang", 800, 1000),
            alt: "Portrait of Sofia Lang",
          },
          Link: { href: "/People/sofia-lang", text: "View profile" },
        },
      },
    },
  ];
}

export function peopleDemoGrid(options: {
  slot?: string;
  title: string;
  lead: string;
}): HubPlacement {
  return {
    componentHandle: "person-list-grid@1",
    variant: "Grid",
    params: { HeadingLayout: "start" },
    datasourceRef: {
      kind: "scoped",
      slot: options.slot ?? "People",
      fields: {
        Title: options.title,
        Lead: `<p>${options.lead}</p>`,
      },
    },
    placeholders: { "cards-persons": peopleDemoCards() },
  };
}
