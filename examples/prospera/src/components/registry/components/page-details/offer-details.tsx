"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import {
  DetailsEyebrow,
  DetailsShell,
  DetailsTitle,
} from "@/components/registry/components/page-details/_details-shell";
import { Menu } from "@/components/registry/components/social/social-share";
import { Button } from "@/components/registry/components/ui/cta-button";
import { NextImage as Image } from "@/components/registry/primitives/editables/image";
import { RichText } from "@/components/registry/primitives/editables/richtext";
import { Text } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { DETAILS_SHARE_PLATFORMS } from "@/lib/registry/details-share";
import {
  detailsHideShare,
  detailsMediaBoxClass,
  detailsMediaFitClass,
  detailsProseClass,
  detailsSplitColClasses,
  detailsTextAlignClass,
  parseDetailsMediaColumn,
  type DetailsShellParams,
} from "@/lib/registry/details-shell";
import { pickImage, pickLink, pickText } from "@/lib/registry/page-details-fields";
import {
  type Field,
  type ImageField,
  type LinkField,
  type Page,
  Placeholder,
  type RichTextField,
  useSitecore,
} from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";
import { sxaPlaceholderName } from "@/lib/registry/sxa-placeholder-name";
import { sitecorePassthrough } from "@/lib/registry/with-sitecore";

interface Fields {
  Title: Field<string>;
  Eyebrow: Field<string>;
  ShortDescription: Field<string>;
  Content: RichTextField;
  Image: ImageField;
  OfferText: Field<string>;
  PromoCode: Field<string>;
  StartDate: Field<string>;
  EndDate: Field<string>;
  Terms: RichTextField;
  CtaLink: LinkField;
}

interface OfferDetailsProps extends Omit<ComponentProps, "params"> {
  fields?: Partial<Fields>;
  params?: ComponentProps["params"] & DetailsShellParams;
  page?: Page;
}

function resolveFields(
  renderingFields: Partial<Fields> | undefined,
  routeFields: Record<string, unknown> | undefined,
): Partial<Fields> {
  const route = (routeFields ?? {}) as Partial<Fields>;
  return {
    Title: pickText(renderingFields?.Title, route.Title),
    Eyebrow: pickText(renderingFields?.Eyebrow, route.Eyebrow),
    ShortDescription: pickText(
      renderingFields?.ShortDescription,
      route.ShortDescription,
    ),
    Content: pickText(renderingFields?.Content, route.Content),
    Image: pickImage(renderingFields?.Image, route.Image),
    OfferText: pickText(renderingFields?.OfferText, route.OfferText),
    PromoCode: pickText(renderingFields?.PromoCode, route.PromoCode),
    StartDate: pickText(renderingFields?.StartDate, route.StartDate),
    EndDate: pickText(renderingFields?.EndDate, route.EndDate),
    Terms: pickText(renderingFields?.Terms, route.Terms),
    CtaLink: pickLink(renderingFields?.CtaLink, route.CtaLink),
  };
}

function hasHref(link?: LinkField): boolean {
  const href = link?.value?.href;
  return typeof href === "string" && href.trim().length > 0;
}

function OfferDetails({
  params,
  fields,
  rendering,
  page: pageFromSdk,
}: OfferDetailsProps) {
  const { page: pageFromHook } = useSitecore();
  const page = pageFromSdk ?? pageFromHook;
  const routeFields = page?.layout?.sitecore?.route?.fields as
    | Record<string, unknown>
    | undefined;
  const resolved = resolveFields(fields, routeFields);
  const [currentUrl, setCurrentUrl] = useState("");
  const id = params?.RenderingIdentifier;
  const inColumnKey = sxaPlaceholderName(
    rendering,
    "offer-details",
    params?.DynamicPlaceholderId,
  );
  const relatedKey = sxaPlaceholderName(
    rendering,
    "offer-details-related",
    params?.DynamicPlaceholderId,
  );
  const fullWidthKey = sxaPlaceholderName(
    rendering,
    "offer-details-full-width",
    params?.DynamicPlaceholderId,
  );
  const isPageEditing = page?.mode?.isEditing ?? false;
  const hideShareWidget = detailsHideShare(params);
  const mediaColumn = parseDetailsMediaColumn(params?.MediaColumn);
  const { mediaClass, copyClass } = detailsSplitColClasses(
    mediaColumn,
    "gallery",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const here = window.location.href;
    const path = new URL(here).pathname;
    if (/^\/(api|_next)\b/.test(path)) {
      setCurrentUrl("");
      return;
    }
    setCurrentUrl(here);
  }, []);

  const media = (
    <div className={mediaClass}>
      <div className={detailsMediaBoxClass(params, "4x5")}>
        <Image
          value={resolved.Image}
          className={detailsMediaFitClass(params)}
          isEditing={isPageEditing}
          placeholder="Image"
        />
      </div>
    </div>
  );

  const copy = (
    <div className={cn(copyClass, detailsTextAlignClass(params))}>
      <DetailsEyebrow
        params={params}
        value={resolved.Eyebrow}
        isEditing={isPageEditing}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <DetailsTitle
          params={params}
          value={resolved.Title}
          isEditing={isPageEditing}
        />
        {!hideShareWidget && (
          <Menu platforms={[...DETAILS_SHARE_PLATFORMS]} />
        )}
      </div>
      <Text
        tag="p"
        className="mt-4 font-semibold text-2xl"
        value={resolved.OfferText}
        isEditing={isPageEditing}
        placeholder="Offer text"
      />
      {resolved.PromoCode?.value || isPageEditing ? (
        <p className="mt-2 text-muted-foreground text-sm">
          Code{" "}
          <Text
            tag="span"
            className="font-mono font-medium text-foreground"
            value={resolved.PromoCode}
            isEditing={isPageEditing}
            placeholder="Promo code"
          />
        </p>
      ) : null}
      <p className="mt-2 text-muted-foreground text-sm">
        <Text
          tag="span"
          value={resolved.StartDate}
          isEditing={isPageEditing}
          placeholder="Start"
        />
        {resolved.StartDate?.value && resolved.EndDate?.value ? " – " : null}
        <Text
          tag="span"
          value={resolved.EndDate}
          isEditing={isPageEditing}
          placeholder="End"
        />
      </p>
      <Text
        tag="p"
        className="mt-5 font-medium text-lg text-muted-foreground tracking-wide"
        value={resolved.ShortDescription}
        isEditing={isPageEditing}
        placeholder="Short description"
      />
      {(isPageEditing || hasHref(resolved.CtaLink)) && (
        <div className="mt-6">
          <Button link={resolved.CtaLink} showArrow />
        </div>
      )}
      <RichText
        data-slot="rich-text"
        className={cn("@[768px]:mt-10 mt-6", detailsProseClass(params))}
        value={resolved.Content}
        isEditing={isPageEditing}
        placeholder="Content"
      />
      <RichText
        data-slot="rich-text"
        className="mt-8 text-muted-foreground text-sm"
        value={resolved.Terms}
        isEditing={isPageEditing}
        placeholder="Terms"
      />
      <div className="@[768px]:mt-12 mt-8">
        {rendering ? (
          <Placeholder name={inColumnKey} rendering={rendering} />
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={resolved.Title?.value} />
        <meta
          property="og:description"
          content={resolved.ShortDescription?.value}
        />
        <meta property="og:image" content={resolved.Image?.value?.src} />
        <meta property="og:type" content="website" />
      </Head>

            <DetailsShell
        params={params}
        className="offer-details"
        id={id}
        fullWidth={
          rendering ? (
            <Placeholder name={fullWidthKey} rendering={rendering} />
          ) : null
        }
      >
        <div className="grid grid-cols-12 @[768px]:gap-4 gap-y-6">
          {mediaColumn === "end" ? copy : null}
          {mediaColumn !== "hidden" ? media : null}
          {mediaColumn !== "end" ? copy : null}

          <div className="@[768px]:col-span-10 col-span-12 @[768px]:col-start-2 @[768px]:mt-12 mt-8">
            {rendering ? (
              <Placeholder name={relatedKey} rendering={rendering} />
            ) : null}
          </div>
        </div>
      </DetailsShell>
    </>
  );
}

export const Default = sitecorePassthrough(OfferDetails);

export const componentType = "universal";
