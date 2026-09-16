import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import { cardChromeParams } from "./_card-chrome-params";

/**
 * Recipe for `OfferCard` — the leaf card rendering for the offers
 * family. Authors drop these into the `cards-offers-{*}` placeholder
 * exposed by `offers-list-grid@1` and `offers-carousel@1` (composed
 * mode).
 *
 * Variants `Simple`, `Complex`, `Deal` map to the three OfferCard
 * React function exports — different DOM topology, the variant
 * boundary captures real composition differences (see [[feedback-variant-vs-parameter]]).
 *
 * In curated mode the offer-card items themselves are the datasource
 * targets the parent offers-list-grid/carousel's Treelist references.
 */
export const offerCardRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "offer-card@1",
  icon: componentIcons["offer-card@1"],
  name: "offer-card",
  displayName: "Offer Card",
  description:
    "Single offer card. Variants: Simple (one-liner), Complex (eyebrow + headline + CTA), Deal (badged with token).",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "OfferText",
      shape: "text",
      default: {
        en: "20% off your next order",
        ar: "خصم 20% على طلبك القادم",
        es: "20 % de descuento en tu próximo pedido",
        fr: "20 % de réduction sur votre prochaine commande",
        de: "20 % Rabatt auf Ihre nächste Bestellung",
        da: "20 % rabat på din næste ordre",
        ja: "次回のご注文が20%オフ",
        "zh-CN": "下单立减 20%",
        "zh-TW": "下次訂單享 20% 折扣",
        it: "20% di sconto sul tuo prossimo ordine",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Offer copy. Used as the card's primary text.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "DiscountToken",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional discount code. When present, the card surfaces a click-to-copy button.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Destination for click-to-navigate offers. Used when no DiscountToken is set.",
        section: "Action",
        sortOrder: 100,
      },
    },
  ],
  params: [
    {
      name: "Action",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "offer-action@1",
        hint: "Override the card's click behavior. `auto` = copy when token present, link when Link populated, none otherwise.",
        section: "Behavior",
        sortOrder: 100,
      },
    },
    // `MediaShape` / `MediaAspect` / `TileAspect` / `CtaPlacement` /
    // `CtaIconTrailing` were removed 2026-08. They were declared only
    // because the shared `_card-chrome-adapter.ts` used to read every
    // axis for every family, so the drift gate demanded a declaration
    // to match. `offer-card` renders an offer sentence with an optional
    // token/link — it has no media box, no CTA row and no title — so
    // none of them ever reached a DOM node. The adapter now exposes one
    // opt-in `adapt*` helper per axis and this card imports only the
    // universal `adaptCardChromeParams`, so the declarations are gone
    // with it. Re-add an axis here only alongside the markup that
    // renders it.
    ...cardChromeParams,
  ],
  variants: [{ name: "Simple" }, { name: "Complex" }, { name: "Deal" }],
  placedIn: ["cards-offers-{*}", "search-results-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Offers" },
      { scope: "site", subfolder: "Offers" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default offerCardRecipe;
