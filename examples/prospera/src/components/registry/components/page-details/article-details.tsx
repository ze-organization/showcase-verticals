"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import {
  DetailsShell,
  DetailsTitle,
} from "@/components/registry/components/page-details/_details-shell";
import { SocialShare } from "@/components/registry/components/social/social-share";
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
  detailsShowSeparator,
  detailsTextAlignClass,
  parseDetailsImagePosition,
  type DetailsShellParams,
} from "@/lib/registry/details-shell";
import {
  type Field,
  type ImageField,
  type Page,
  Placeholder,
  type RichTextField,
  useSitecore,
} from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";
import { sitecorePassthrough } from "@/lib/registry/with-sitecore";

interface Fields {
  Title: Field<string>;
  ShortDescription: Field<string>;
  Content: RichTextField;
  Image: ImageField;
}

interface ArticleDetailsProps extends Omit<ComponentProps, "params"> {
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
    ShortDescription: pickText(
      renderingFields?.ShortDescription,
      route.ShortDescription,
    ),
    Content: pickText(renderingFields?.Content, route.Content),
    Image: pickImage(renderingFields?.Image, route.Image),
  };
}

function unwrapField<T extends { value?: unknown }>(raw: unknown): T | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as { jsonValue?: unknown; value?: unknown };
  if (obj.jsonValue && typeof obj.jsonValue === "object") {
    return obj.jsonValue as T;
  }
  return raw as T;
}

function pickText<T extends { value?: unknown }>(
  preferred: T | undefined,
  fallback: T | undefined,
): T | undefined {
  const first = unwrapField<T>(preferred);
  const next = unwrapField<T>(fallback);
  const value = first?.value;
  if (typeof value === "string" && value.trim().length > 0) return first;
  return next ?? first;
}

function pickImage(
  preferred: ImageField | undefined,
  fallback: ImageField | undefined,
): ImageField | undefined {
  const first = unwrapField<ImageField>(preferred);
  const next = unwrapField<ImageField>(fallback);
  const src =
    first?.value && typeof first.value === "object" ? first.value.src : undefined;
  if (src) return first;
  return next ?? first;
}

function articlePlaceholderName(
  rendering: ComponentProps["rendering"] | undefined,
  prefix: string,
  dynamicPlaceholderId?: string,
): string {
  const id = dynamicPlaceholderId ?? "1";
  const placeholders = (
    rendering as { placeholders?: Record<string, unknown> } | undefined
  )?.placeholders;
  const keys = placeholders ? Object.keys(placeholders) : [];
  const sxa = keys.find((key) => key.startsWith(`${prefix}-*-`));
  if (sxa) return sxa;
  if (keys.includes(`${prefix}-${id}`)) return `${prefix}-${id}`;
  if (keys.includes(`${prefix}-{*}`)) return `${prefix}-{*}`;
  return `${prefix}-*-0-${id}`;
}

function ArticleDetails({
  params,
  fields,
  rendering,
  page: pageFromSdk,
}: ArticleDetailsProps) {
  const { page: pageFromHook } = useSitecore();
  const page = pageFromSdk ?? pageFromHook;
  const routeFields = page?.layout?.sitecore?.route?.fields as
    | Record<string, unknown>
    | undefined;
  const resolved = resolveFields(fields, routeFields);
  const [currentUrl, setCurrentUrl] = useState("");
  const id = params?.RenderingIdentifier;
  const inColumnKey = articlePlaceholderName(
    rendering,
    "article-details",
    params?.DynamicPlaceholderId,
  );
  const fullWidthKey = articlePlaceholderName(
    rendering,
    "article-details-full-width",
    params?.DynamicPlaceholderId,
  );
  const isPageEditing = page?.mode?.isEditing ?? false;
  const hideShareWidget = detailsHideShare(params);
  const imagePosition = parseDetailsImagePosition(params?.ImagePosition);
  const showSeparator = detailsShowSeparator(params);

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
        <meta property="og:name" content={resolved.Title?.value} />
        <meta property="og:title" content={resolved.Title?.value} />
        <meta
          property="og:description"
          content={resolved.ShortDescription?.value}
        />
        <meta property="og:image" content={resolved.Image?.value?.src} />
        <meta property="og:type" content="article" />
      </Head>

      <DetailsShell
        params={params}
        className="article-details"
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
            <DetailsTitle
              params={params}
              value={resolved.Title}
              isEditing={isPageEditing}
              tag="h2"
            />
            <Text
              tag="p"
              className="mt-5 font-medium text-lg text-muted-foreground tracking-wide"
              value={resolved.ShortDescription}
              isEditing={isPageEditing}
              placeholder="Short description"
            />
            {showSeparator ? (
              <hr className="my-6 border-0 border-current/20 border-t" />
            ) : null}
            {!hideShareWidget && (
              <div className="mt-6">
                <SocialShare platforms={[...DETAILS_SHARE_PLATFORMS]} />
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
          {rendering ? (
            <div className="@[768px]:col-span-10 col-span-12 @[768px]:col-start-2 @[768px]:mt-12 mt-8">
              <Placeholder name={inColumnKey} rendering={rendering} />
            </div>
          ) : null}
        </div>
      </DetailsShell>
    </>
  );
}

export const Default = sitecorePassthrough(ArticleDetails);

export const componentType = "universal";
