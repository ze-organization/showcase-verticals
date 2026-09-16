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
  detailsSplitColClasses,
  detailsTextAlignClass,
  parseDetailsMediaColumn,
  type DetailsShellParams,
} from "@/lib/registry/details-shell";
import {
  pickImage,
  pickNumber,
  pickText,
} from "@/lib/registry/page-details-fields";
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
  Category: Field<string>;
  Price: Field<number>;
  Sku: Field<string>;
  Image1: ImageField;
  Image2: ImageField;
}

interface ProductDetailsProps extends Omit<ComponentProps, "params"> {
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
    Category: pickText(renderingFields?.Category, route.Category),
    Price: pickNumber(renderingFields?.Price, route.Price),
    Sku: pickText(renderingFields?.Sku, route.Sku),
    Image1: pickImage(renderingFields?.Image1, route.Image1),
    Image2: pickImage(renderingFields?.Image2, route.Image2),
  };
}

function formatPrice(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function ProductDetails({
  params,
  fields,
  rendering,
  page: pageFromSdk,
}: ProductDetailsProps) {
  const { page: pageFromHook } = useSitecore();
  const page = pageFromSdk ?? pageFromHook;
  const routeFields = page?.layout?.sitecore?.route?.fields as
    | Record<string, unknown>
    | undefined;
  const resolved = resolveFields(fields, routeFields);
  const [currentUrl, setCurrentUrl] = useState("");
  const id = params?.RenderingIdentifier;
  const mediaKey = sxaPlaceholderName(
    rendering,
    "product-details-media",
    params?.DynamicPlaceholderId,
  );
  const inColumnKey = sxaPlaceholderName(
    rendering,
    "product-details",
    params?.DynamicPlaceholderId,
  );
  const relatedKey = sxaPlaceholderName(
    rendering,
    "product-details-related",
    params?.DynamicPlaceholderId,
  );
  const fullWidthKey = sxaPlaceholderName(
    rendering,
    "product-details-full-width",
    params?.DynamicPlaceholderId,
  );
  const isPageEditing = page?.mode?.isEditing ?? false;
  const hideShareWidget = detailsHideShare(params);
  const mediaColumn = parseDetailsMediaColumn(params?.MediaColumn);
  const { mediaClass, copyClass } = detailsSplitColClasses(
    mediaColumn,
    "gallery",
  );
  const priceLabel = formatPrice(resolved.Price?.value);
  const category = resolved.Category?.value || resolved.Eyebrow?.value;

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
    <div className={cn(mediaClass, "space-y-4")}>
      <div className={detailsMediaBoxClass(params, "4x5")}>
        <Image
          value={resolved.Image1}
          className={detailsMediaFitClass(params)}
          isEditing={isPageEditing}
          placeholder="Image1"
        />
      </div>
      {resolved.Image2?.value?.src || isPageEditing ? (
        <div className={detailsMediaBoxClass(params, "4x5")}>
          <Image
            value={resolved.Image2}
            className={detailsMediaFitClass(params)}
            isEditing={isPageEditing}
            placeholder="Image2"
          />
        </div>
      ) : null}
      {rendering ? (
        <Placeholder name={mediaKey} rendering={rendering} />
      ) : null}
    </div>
  );

  const copy = (
    <div className={cn(copyClass, detailsTextAlignClass(params))}>
      {category || isPageEditing ? (
        <DetailsEyebrow
          params={params}
          value={resolved.Category ?? resolved.Eyebrow}
          isEditing={isPageEditing}
          placeholder="Category"
        />
      ) : null}
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
      {priceLabel ? (
        <p className="mt-4 font-semibold text-2xl">{priceLabel}</p>
      ) : isPageEditing ? (
        <p className="mt-4 text-muted-foreground text-sm">Price</p>
      ) : null}
      {resolved.Sku?.value ? (
        <p className="mt-1 text-muted-foreground text-sm">
          SKU{" "}
          <Text
            tag="span"
            value={resolved.Sku}
            isEditing={isPageEditing}
            placeholder="Sku"
          />
        </p>
      ) : isPageEditing ? (
        <p className="mt-1 text-muted-foreground text-sm">
          SKU{" "}
          <Text
            tag="span"
            value={resolved.Sku}
            isEditing={isPageEditing}
            placeholder="Sku"
          />
        </p>
      ) : null}
      <Text
        tag="p"
        className="mt-5 font-medium text-lg text-muted-foreground tracking-wide"
        value={resolved.ShortDescription}
        isEditing={isPageEditing}
        placeholder="Short description"
      />
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
        <meta property="og:image" content={resolved.Image1?.value?.src} />
        <meta property="og:type" content="website" />
      </Head>

      <DetailsShell
        params={params}
        className="product-details"
        id={id}
        maxWidthFallback="wide"
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

export const Default = sitecorePassthrough(ProductDetails);

export const componentType = "universal";
