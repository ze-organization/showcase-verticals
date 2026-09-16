"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import {
  DetailsEyebrow,
  DetailsShell,
  DetailsTitle,
} from "@/components/registry/components/page-details/_details-shell";
import { Menu } from "@/components/registry/components/social/social-share";
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
  detailsTextAlignClass,
  parseDetailsMediaColumn,
  type DetailsShellParams,
} from "@/lib/registry/details-shell";
import { pickImage, pickText } from "@/lib/registry/page-details-fields";
import {
  type Field,
  type ImageField,
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
  Country: Field<string>;
  Continent: Field<string>;
  TripDuration: Field<string>;
  StartingPrice: Field<string>;
}

interface DestinationDetailsProps extends Omit<ComponentProps, "params"> {
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
    Country: pickText(renderingFields?.Country, route.Country),
    Continent: pickText(renderingFields?.Continent, route.Continent),
    TripDuration: pickText(renderingFields?.TripDuration, route.TripDuration),
    StartingPrice: pickText(
      renderingFields?.StartingPrice,
      route.StartingPrice,
    ),
  };
}

function Fact({
  label,
  value,
  isPageEditing,
  placeholder,
}: {
  label: string;
  value: Field<string> | undefined;
  isPageEditing: boolean;
  placeholder: string;
}) {
  if (!value?.value && !isPageEditing) return null;
  return (
    <div>
      <dt className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </dt>
      <dd className="mt-1 font-medium">
        <Text
          tag="span"
          value={value}
          isEditing={isPageEditing}
          placeholder={placeholder}
        />
      </dd>
    </div>
  );
}

function DestinationDetails({
  params,
  fields,
  rendering,
  page: pageFromSdk,
}: DestinationDetailsProps) {
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
    "destination-details",
    params?.DynamicPlaceholderId,
  );
  const asideKey = sxaPlaceholderName(
    rendering,
    "destination-details-aside",
    params?.DynamicPlaceholderId,
  );
  const relatedKey = sxaPlaceholderName(
    rendering,
    "destination-details-related",
    params?.DynamicPlaceholderId,
  );
  const fullWidthKey = sxaPlaceholderName(
    rendering,
    "destination-details-full-width",
    params?.DynamicPlaceholderId,
  );
  const isPageEditing = page?.mode?.isEditing ?? false;
  const hideShareWidget = detailsHideShare(params);
  const mediaColumn = parseDetailsMediaColumn(params?.MediaColumn);

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
        className="destination-details"
        id={id}
        fullWidth={
          rendering ? (
            <Placeholder name={fullWidthKey} rendering={rendering} />
          ) : null
        }
      >
        <div className="grid grid-cols-12 @[768px]:gap-4 gap-y-6">
            {mediaColumn !== "hidden" ? (
            <div
              className={cn(
                "relative z-10 @[768px]:col-span-10 col-span-12 @[768px]:col-start-2",
                mediaColumn === "end" ? "order-3" : "order-1",
                detailsMediaBoxClass(params, "16x9"),
              )}
            >
              <Image
                value={resolved.Image}
                className={detailsMediaFitClass(params)}
                isEditing={isPageEditing}
                placeholder="Image"
              />
            </div>
            ) : null}

            <div
              className={cn(
                "@[768px]:col-span-7 col-span-12 @[768px]:col-start-3",
                mediaColumn === "end" ? "order-1" : "order-2",
                detailsTextAlignClass(params),
              )}
            >
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
                className="mt-5 font-medium text-lg text-muted-foreground tracking-wide"
                value={resolved.ShortDescription}
                isEditing={isPageEditing}
                placeholder="Short description"
              />
              <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Fact
                  label="Country"
                  value={resolved.Country}
                  isPageEditing={isPageEditing}
                  placeholder="Country"
                />
                <Fact
                  label="Continent"
                  value={resolved.Continent}
                  isPageEditing={isPageEditing}
                  placeholder="Continent"
                />
                <Fact
                  label="Duration"
                  value={resolved.TripDuration}
                  isPageEditing={isPageEditing}
                  placeholder="Trip duration"
                />
                <Fact
                  label="From"
                  value={resolved.StartingPrice}
                  isPageEditing={isPageEditing}
                  placeholder="Starting price"
                />
              </dl>
              <RichText
                data-slot="rich-text"
                className={cn("@[768px]:mt-10 mt-6", detailsProseClass(params))}
                value={resolved.Content}
                isEditing={isPageEditing}
                placeholder="Content"
              />
              <div className="@[768px]:mt-12 mt-8">
                {rendering ? (
                  <Placeholder name={inColumnKey} rendering={rendering} />
                ) : null}
              </div>
            </div>

            <div className="order-4 @[768px]:col-span-3 col-span-12 @[768px]:col-start-10">
              {rendering ? (
                <Placeholder name={asideKey} rendering={rendering} />
              ) : null}
            </div>

            <div className="order-5 @[768px]:col-span-10 col-span-12 @[768px]:col-start-2 @[768px]:mt-12 mt-8">
              {rendering ? (
                <Placeholder name={relatedKey} rendering={rendering} />
              ) : null}
            </div>
          </div>
      </DetailsShell>
    </>
  );
}

export const Default = sitecorePassthrough(DestinationDetails);

export const componentType = "universal";
