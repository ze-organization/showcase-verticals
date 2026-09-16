/**
 * Sitecore adapter for `travel-search`. Unwraps the `{ fields, params }`
 * payload into flat props and, crucially, builds the `modes` array from
 * the per-mode toggle params (flight is always on; hotel / train opt in)
 * so the component keeps a clean array API for Storybook/tests.
 *
 * The same adapter fans out to both variant exports (Default /
 * HeroEmbed) so `withSitecore` applies it uniformly.
 */
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import type { TravelMode, TravelSearchProps } from "./travel-search";

interface SitecoreTravelSearchFields {
  Title?: TextSource;
  Subtitle?: TextSource;
  SearchLabel?: TextSource;
  SearchLink?: LinkSource;
}

interface SitecoreTravelSearchParams {
  ShowHotel?: string;
  ShowTrain?: string;
  DefaultMode?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const parseBool = (value: string | undefined, fallback: boolean): boolean => {
  const v = value?.trim().toLowerCase();
  if (v === undefined || v === "") return fallback;
  return v === "1" || v === "true" || v === "yes" || v === "on";
};

const VALID_MODES: readonly TravelMode[] = ["flight", "hotel", "train"];

function toMode(value: string | undefined): TravelMode | undefined {
  const v = value?.trim().toLowerCase() as TravelMode | undefined;
  return v && VALID_MODES.includes(v) ? v : undefined;
}

export function adaptTravelSearchProps({
  fields,
  params,
}: {
  fields?: SitecoreTravelSearchFields;
  params?: SitecoreTravelSearchParams;
}): TravelSearchProps {
  const modes: TravelMode[] = ["flight"];
  if (parseBool(params?.ShowHotel, true)) modes.push("hotel");
  if (parseBool(params?.ShowTrain, true)) modes.push("train");

  return {
    title: fields?.Title,
    subtitle: fields?.Subtitle,
    searchLabel: fields?.SearchLabel,
    searchLink: fields?.SearchLink,
    modes,
    defaultMode: toMode(params?.DefaultMode),
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}

export const Default = adaptTravelSearchProps;
export const HeroEmbed = adaptTravelSearchProps;
