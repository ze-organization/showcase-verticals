"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import {
  DetailsEyebrow,
  DetailsShell,
  DetailsTitle,
} from "@/components/registry/components/page-details/_details-shell";
import { Button } from "@/components/registry/components/ui/cta-button";
import { NextImage as Image } from "@/components/registry/primitives/editables/image";
import { RichText } from "@/components/registry/primitives/editables/richtext";
import { Text } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  detailsMediaBoxClass,
  detailsMediaFitClass,
  detailsProseClass,
  detailsTextAlignClass,
  parseDetailsImagePosition,
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
  Logo: ImageField;
  Website: LinkField;
  PartnerType: Field<string>;
}

interface PartnerDetailsProps extends Omit<ComponentProps, "params"> {
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
    Logo: pickImage(renderingFields?.Logo, route.Logo),
    Website: pickLink(renderingFields?.Website, route.Website),
    PartnerType: pickText(renderingFields?.PartnerType, route.PartnerType),
  };
}

function hasHref(link?: LinkField): boolean {
  const href = link?.value?.href;
  return typeof href === "string" && href.trim().length > 0;
}

function PartnerDetails({
  params,
  fields,
  rendering,
  page: pageFromSdk,
}: PartnerDetailsProps) {
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
    "partner-details",
    params?.DynamicPlaceholderId,
  );
  const relatedKey = sxaPlaceholderName(
    rendering,
    "partner-details-related",
    params?.DynamicPlaceholderId,
  );
  const fullWidthKey = sxaPlaceholderName(
    rendering,
    "partner-details-full-width",
    params?.DynamicPlaceholderId,
  );
  const isPageEditing = page?.mode?.isEditing ?? false;
  const imagePosition = parseDetailsImagePosition(params?.ImagePosition);

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

  const imageNode =
    imagePosition === "hidden" ? null : (
      <div
        className={cn(
          "relative z-10 @[768px]:col-span-10 col-span-12 @[768px]:col-start-2",
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
        className="partner-details"
        id={id}
        fullWidth={
          rendering ? (
            <Placeholder name={fullWidthKey} rendering={rendering} />
          ) : null
        }
      >
        <div className="grid grid-cols-12 @[768px]:gap-4 gap-y-6">
          {imagePosition === "above" ? imageNode : null}

          <div
            className={cn(
              "@[768px]:col-span-8 col-span-12 @[768px]:col-start-3 @[768px]:mt-8 mt-2",
              detailsTextAlignClass(params),
            )}
          >
            {(resolved.Logo?.value?.src || isPageEditing) && (
              <div className="mb-6 h-16 w-16 overflow-hidden rounded">
                <Image
                  value={resolved.Logo}
                  className="h-full w-full object-contain"
                  isEditing={isPageEditing}
                  placeholder="Logo"
                />
              </div>
            )}
            <DetailsEyebrow
              params={params}
              value={resolved.PartnerType ?? resolved.Eyebrow}
              isEditing={isPageEditing}
              placeholder="Partner type"
            />
            <DetailsTitle
              params={params}
              value={resolved.Title}
              isEditing={isPageEditing}
            />
            <Text
              tag="p"
              className="mt-5 font-medium text-lg text-muted-foreground tracking-wide"
              value={resolved.ShortDescription}
              isEditing={isPageEditing}
              placeholder="Short description"
            />
            {(isPageEditing || hasHref(resolved.Website)) && (
              <div className="mt-6">
                <Button link={resolved.Website} showArrow />
              </div>
            )}
            {imagePosition === "below" ? (
              <div className={cn("mt-8", detailsMediaBoxClass(params, "16x9"))}>
                <Image
                  value={resolved.Image}
                  className={detailsMediaFitClass(params)}
                  isEditing={isPageEditing}
                  placeholder="Image"
                />
              </div>
            ) : null}
            <RichText
              data-slot="rich-text"
              className={cn("@[768px]:mt-10 mt-6", detailsProseClass(params))}
              value={resolved.Content}
              isEditing={isPageEditing}
              placeholder="Content"
            />
          </div>
          <div className="@[768px]:col-span-10 col-span-12 @[768px]:col-start-2 @[768px]:mt-12 mt-8">
            {rendering ? (
              <Placeholder name={inColumnKey} rendering={rendering} />
            ) : null}
          </div>
          <div className="@[768px]:col-span-10 col-span-12 @[768px]:col-start-2 @[768px]:mt-8 mt-6">
            {rendering ? (
              <Placeholder name={relatedKey} rendering={rendering} />
            ) : null}
          </div>
        </div>
      </DetailsShell>
    </>
  );
}

export const Default = sitecorePassthrough(PartnerDetails);

export const componentType = "universal";
