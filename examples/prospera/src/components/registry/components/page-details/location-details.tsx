"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import {
  DetailsEyebrow,
  DetailsShell,
  DetailsTitle,
} from "@/components/registry/components/page-details/_details-shell";
import { NextImage as Image } from "@/components/registry/primitives/editables/image";
import { RichText } from "@/components/registry/primitives/editables/richtext";
import { Text } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  detailsMediaBoxClass,
  detailsMediaFitClass,
  detailsProseClass,
  detailsSplitColClasses,
  detailsTextAlignClass,
  parseDetailsMediaColumn,
  type DetailsShellParams,
} from "@/lib/registry/details-shell";
import { MapCanvas } from "@/lib/registry/maps/map-canvas";
import type { MapMarker } from "@/lib/registry/maps/types";
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
  Region: Field<string>;
  ShortDescription: Field<string>;
  Content: RichTextField;
  Image: ImageField;
  Address1: Field<string>;
  Address2: Field<string>;
  City: Field<string>;
  State: Field<string>;
  PostalCode: Field<string>;
  Country: Field<string>;
  Phone: Field<string>;
  Email: Field<string>;
  Hours: RichTextField;
  Latitude: Field<number>;
  Longitude: Field<number>;
}

interface LocationDetailsProps extends Omit<ComponentProps, "params"> {
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
    Region: pickText(renderingFields?.Region, route.Region),
    ShortDescription: pickText(
      renderingFields?.ShortDescription,
      route.ShortDescription,
    ),
    Content: pickText(renderingFields?.Content, route.Content),
    Image: pickImage(renderingFields?.Image, route.Image),
    Address1: pickText(renderingFields?.Address1, route.Address1),
    Address2: pickText(renderingFields?.Address2, route.Address2),
    City: pickText(renderingFields?.City, route.City),
    State: pickText(renderingFields?.State, route.State),
    PostalCode: pickText(renderingFields?.PostalCode, route.PostalCode),
    Country: pickText(renderingFields?.Country, route.Country),
    Phone: pickText(renderingFields?.Phone, route.Phone),
    Email: pickText(renderingFields?.Email, route.Email),
    Hours: pickText(renderingFields?.Hours, route.Hours),
    Latitude: pickNumber(renderingFields?.Latitude, route.Latitude),
    Longitude: pickNumber(renderingFields?.Longitude, route.Longitude),
  };
}

function fieldNumber(field: Field<number> | undefined): number | undefined {
  const raw = field?.value;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function osmPinHref(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

function LocationDetails({
  params,
  fields,
  rendering,
  page: pageFromSdk,
}: LocationDetailsProps) {
  const { page: pageFromHook } = useSitecore();
  const page = pageFromSdk ?? pageFromHook;
  const routeFields = page?.layout?.sitecore?.route?.fields as
    | Record<string, unknown>
    | undefined;
  const resolved = resolveFields(fields, routeFields);
  const [currentUrl, setCurrentUrl] = useState("");
  const id = params?.RenderingIdentifier;
  const mediaColumn = parseDetailsMediaColumn(params?.MediaColumn);
  const { mediaClass, copyClass } = detailsSplitColClasses(
    mediaColumn,
    "aside",
  );
  const inColumnKey = sxaPlaceholderName(
    rendering,
    "location-details",
    params?.DynamicPlaceholderId,
  );
  const asideKey = sxaPlaceholderName(
    rendering,
    "location-details-aside",
    params?.DynamicPlaceholderId,
  );
  const relatedKey = sxaPlaceholderName(
    rendering,
    "location-details-related",
    params?.DynamicPlaceholderId,
  );
  const fullWidthKey = sxaPlaceholderName(
    rendering,
    "location-details-full-width",
    params?.DynamicPlaceholderId,
  );
  const isPageEditing = page?.mode?.isEditing ?? false;
  const kicker = resolved.Eyebrow ?? resolved.Region;
  const lat = fieldNumber(resolved.Latitude);
  const lng = fieldNumber(resolved.Longitude);

  const markers = useMemo<MapMarker[]>(() => {
    if (lat == null || lng == null) return [];
    return [
      {
        id: "page",
        lat,
        lng,
        title: resolved.Title?.value,
        address: [resolved.Address1?.value, resolved.City?.value]
          .filter(Boolean)
          .join(" · "),
      },
    ];
  }, [lat, lng, resolved.Title?.value, resolved.Address1?.value, resolved.City?.value]);

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

  const phoneText =
    typeof resolved.Phone?.value === "string" ? resolved.Phone.value : "";
  const emailText =
    typeof resolved.Email?.value === "string" ? resolved.Email.value : "";

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
        className="location-details"
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
                mediaClass,
                mediaColumn === "end" ? "order-3" : "order-1",
                "space-y-4",
              )}
            >
              <div className={detailsMediaBoxClass(params, "4x5")}>
                <Image
                  value={resolved.Image}
                  className={detailsMediaFitClass(params)}
                  isEditing={isPageEditing}
                  placeholder="Image"
                />
              </div>
              {markers.length > 0 ? (
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg">
                  <MapCanvas markers={markers} />
                </div>
              ) : isPageEditing ? (
                <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/40 text-muted-foreground text-sm">
                  Map (set Latitude / Longitude)
                </div>
              ) : null}
              {rendering ? (
                <Placeholder name={asideKey} rendering={rendering} />
              ) : null}
            </div>
            ) : null}

            <div
              className={cn(
                copyClass,
                mediaColumn === "end" ? "order-1" : "order-3",
                detailsTextAlignClass(params),
              )}
            >
              <DetailsEyebrow
                params={params}
                value={kicker}
                isEditing={isPageEditing}
                placeholder="Region"
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

              <address className="mt-6 text-muted-foreground text-sm not-italic leading-relaxed">
                <p>
                  <Text
                    tag="span"
                    value={resolved.Address1}
                    isEditing={isPageEditing}
                    placeholder="Address1"
                  />
                </p>
                <p>
                  <Text
                    tag="span"
                    value={resolved.Address2}
                    isEditing={isPageEditing}
                    placeholder="Address2"
                  />
                </p>
                <p>
                  <Text
                    tag="span"
                    value={resolved.City}
                    isEditing={isPageEditing}
                    placeholder="City"
                  />
                  {resolved.City?.value && resolved.State?.value ? ", " : null}
                  <Text
                    tag="span"
                    value={resolved.State}
                    isEditing={isPageEditing}
                    placeholder="State"
                  />{" "}
                  <Text
                    tag="span"
                    value={resolved.PostalCode}
                    isEditing={isPageEditing}
                    placeholder="Postal code"
                  />
                </p>
                <p>
                  <Text
                    tag="span"
                    value={resolved.Country}
                    isEditing={isPageEditing}
                    placeholder="Country"
                  />
                </p>
              </address>

              {(phoneText || emailText || isPageEditing) && (
                <p className="mt-4 text-muted-foreground text-sm">
                  {phoneText ? (
                    <a
                      href={`tel:${phoneText.replace(/[^+\d]/g, "")}`}
                      className="text-primary hover:underline"
                    >
                      {phoneText}
                    </a>
                  ) : (
                    <Text
                      tag="span"
                      value={resolved.Phone}
                      isEditing={isPageEditing}
                      placeholder="Phone"
                    />
                  )}
                  {phoneText && emailText ? " · " : null}
                  {emailText ? (
                    <a
                      href={`mailto:${emailText}`}
                      className="text-primary hover:underline"
                    >
                      {emailText}
                    </a>
                  ) : (
                    <Text
                      tag="span"
                      value={resolved.Email}
                      isEditing={isPageEditing}
                      placeholder="Email"
                    />
                  )}
                </p>
              )}

              {lat != null && lng != null ? (
                <p className="mt-3">
                  <a
                    href={osmPinHref(lat, lng)}
                    className="font-medium text-primary text-sm hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get directions
                  </a>
                </p>
              ) : null}

              {(resolved.Hours?.value || isPageEditing) && (
                <div className="mt-6">
                  <p className="mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Hours
                  </p>
                  <RichText
                    className="text-muted-foreground text-sm"
                    value={resolved.Hours}
                    isEditing={isPageEditing}
                    placeholder="Hours"
                  />
                </div>
              )}

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

            <div className="order-4 @[768px]:col-span-10 col-span-12 @[768px]:col-start-2 @[768px]:mt-12 mt-8">
              {rendering ? (
                <Placeholder name={relatedKey} rendering={rendering} />
              ) : null}
            </div>
          </div>
      </DetailsShell>
    </>
  );
}

export const Default = sitecorePassthrough(LocationDetails);

export const componentType = "universal";
