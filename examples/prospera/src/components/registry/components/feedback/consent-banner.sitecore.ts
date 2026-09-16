/**
 * Sitecore adapter for `consent-banner`. Unwraps the Layout-Service
 * `{ fields, params }` payload into the flat props the React rendering
 * consumes. The same adapter fans out to every variant export
 * (BottomBar / Modal / SidePanel) so `withSitecore` applies it
 * uniformly — mirrors the pattern in `versus-list.sitecore.ts`.
 */
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import {
  isSurfaceTone,
  type SurfaceTone,
} from "@/lib/registry/color-scheme-classes";
import type { ConsentBannerProps } from "./consent-banner";

/** Field shape — names in lockstep with `consent-banner.recipe.ts`. */
interface SitecoreConsentBannerFields {
  Title?: TextSource;
  Text?: RichTextSource;
  AcceptLabel?: TextSource;
  DeclineLabel?: TextSource;
  PolicyLink?: LinkSource;
  Image?: ImageSource;
  // GDPR variant fields (GdprBottomBar / GdprModal). All optional —
  // the base variants ignore them and the GDPR variants degrade to
  // generic fallbacks when absent.
  NecessaryLabel?: TextSource;
  NecessaryDescription?: TextSource;
  NecessaryCount?: TextSource;
  PreferencesLabel?: TextSource;
  PreferencesDescription?: TextSource;
  PreferencesCount?: TextSource;
  StatisticsLabel?: TextSource;
  StatisticsDescription?: TextSource;
  StatisticsCount?: TextSource;
  MarketingLabel?: TextSource;
  MarketingDescription?: TextSource;
  MarketingCount?: TextSource;
  UnclassifiedLabel?: TextSource;
  UnclassifiedDescription?: TextSource;
  UnclassifiedCount?: TextSource;
  AllowAllLabel?: TextSource;
  AllowSelectedLabel?: TextSource;
  NecessaryOnlyLabel?: TextSource;
  ConsentLabel?: TextSource;
  DetailsLabel?: TextSource;
  AboutLabel?: TextSource;
  AboutBody?: RichTextSource;
}

interface SitecoreConsentBannerParams {
  ColorScheme?: string;
  /** `max-width@1` — width cap for the BottomBar's content row. */
  MaxWidth?: string;
  Overlay?: string;
  /** Stable personalization handle for the CDP events. */
  InstanceKey?: string;
  /** `instance-scope@1` — `site` (default) or `page`. */
  InstanceScope?: string;
  /** Per-instance opt-out for the accept/decline CDP events. */
  TrackEvents?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const toInstanceScope = (
  value: string | undefined,
): "site" | "page" | undefined => {
  const raw = value?.trim().toLowerCase();
  return raw === "site" || raw === "page" ? raw : undefined;
};

const toSurfaceTone = (value: string | undefined): SurfaceTone => {
  const raw = value?.trim().toLowerCase() ?? "";
  return isSurfaceTone(raw) ? raw : "none";
};

export function adaptConsentBannerProps({
  fields,
  params,
}: {
  fields?: SitecoreConsentBannerFields;
  params?: SitecoreConsentBannerParams;
}): ConsentBannerProps {
  return {
    title: fields?.Title,
    text: fields?.Text,
    acceptLabel: fields?.AcceptLabel,
    declineLabel: fields?.DeclineLabel,
    policyLink: fields?.PolicyLink,
    image: fields?.Image,
    // GDPR variant fields — passed through raw; the component resolves
    // fallbacks and parses the integer count fields itself.
    necessaryLabel: fields?.NecessaryLabel,
    necessaryDescription: fields?.NecessaryDescription,
    necessaryCount: fields?.NecessaryCount,
    preferencesLabel: fields?.PreferencesLabel,
    preferencesDescription: fields?.PreferencesDescription,
    preferencesCount: fields?.PreferencesCount,
    statisticsLabel: fields?.StatisticsLabel,
    statisticsDescription: fields?.StatisticsDescription,
    statisticsCount: fields?.StatisticsCount,
    marketingLabel: fields?.MarketingLabel,
    marketingDescription: fields?.MarketingDescription,
    marketingCount: fields?.MarketingCount,
    unclassifiedLabel: fields?.UnclassifiedLabel,
    unclassifiedDescription: fields?.UnclassifiedDescription,
    unclassifiedCount: fields?.UnclassifiedCount,
    allowAllLabel: fields?.AllowAllLabel,
    allowSelectedLabel: fields?.AllowSelectedLabel,
    necessaryOnlyLabel: fields?.NecessaryOnlyLabel,
    consentLabel: fields?.ConsentLabel,
    detailsLabel: fields?.DetailsLabel,
    aboutLabel: fields?.AboutLabel,
    aboutBody: fields?.AboutBody,
    surfaceTone: toSurfaceTone(params?.ColorScheme),
    // Raw string through — the component parses via the shared
    // `max-width@1` parser (unknown/empty collapses to `default`).
    maxWidth: params?.MaxWidth,
    // No React-side default for the boolean param — undefined means
    // "Sitecore Standard Values drives it"; the component's isEnabled
    // treats undefined as false.
    overlay: params?.Overlay,
    instanceKey: params?.InstanceKey || undefined,
    instanceScope: toInstanceScope(params?.InstanceScope),
    trackEvents: params?.TrackEvents,
    id: params?.RenderingIdentifier,
    styles: params?.styles,
  };
}

export const BottomBar = adaptConsentBannerProps;
export const Modal = adaptConsentBannerProps;
export const SidePanel = adaptConsentBannerProps;
export const GdprBottomBar = adaptConsentBannerProps;
export const GdprModal = adaptConsentBannerProps;
