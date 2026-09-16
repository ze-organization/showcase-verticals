/**
 * Sitecore adapter for `offer-card@1` (composed mode — the card placed
 * directly in a `cards-offers-{*}` placeholder).
 *
 * Needed because the recipe's field names don't lowerFirst onto the
 * component's props: `OfferText` → the component's `text`,
 * `DiscountToken` → `token` (a plain string), and `Link` → `href`.
 * Under the convention map those fields arrived as `offerText` /
 * `discountToken` / `link` and the card rendered empty. Curated mode
 * (offers-list-grid / offers-carousel Treelist) was unaffected — the
 * family adapter in `offers.sitecore.ts` does its own unwrap.
 *
 * Keys mirror the variant export names so `withSitecore` applies the
 * same map to each.
 */
import type { TextSource } from "@/components/registry/primitives/editables/text";
import type { Field, LinkField } from "@/lib/registry/sitecore";
import {
  adaptCardChromeParams,
  type CuratedCardChromeParams,
  leafChromeProps,
} from "./_card-chrome-adapter";
import type { OfferCardAction } from "./offer-card";

export interface SitecoreOfferCardFields {
  OfferText?: TextSource;
  DiscountToken?: Field<string>;
  Link?: LinkField;
}

export interface SitecoreOfferCardParams extends CuratedCardChromeParams {
  Action?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const ALLOWED_ACTIONS: readonly OfferCardAction[] = [
  "auto",
  "link",
  "copy",
  "none",
];

const parseAction = (value: string | undefined): OfferCardAction => {
  const normalized = value?.trim().toLowerCase() as OfferCardAction | undefined;
  return normalized && ALLOWED_ACTIONS.includes(normalized)
    ? normalized
    : "auto";
};

export function adaptOfferCardProps({
  fields,
  params,
  isEditing,
}: {
  fields?: SitecoreOfferCardFields;
  params?: SitecoreOfferCardParams;
  isEditing?: boolean;
}) {
  return {
    text: fields?.OfferText,
    token: fields?.DiscountToken?.value?.trim() || undefined,
    href: fields?.Link?.value?.href,
    action: parseAction(params?.Action),
    // Own-chrome params (cardChromeParams on the recipe) — same axes
    // the grids forward in curated mode; `leafChromeProps` renames
    // `cardStyle` back to the leaf's `style` prop.
    ...leafChromeProps(adaptCardChromeParams(params)),
    isEditing,
    id: params?.RenderingIdentifier,
    styles: params?.styles,
  };
}

export const Simple = adaptOfferCardProps;
export const Complex = adaptOfferCardProps;
export const Deal = adaptOfferCardProps;
export const Default = adaptOfferCardProps;
