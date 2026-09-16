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
  Department: Field<string>;
  EmploymentType: Field<string>;
  LocationName: Field<string>;
  LocationLink: LinkField;
}

interface JobDetailsProps extends Omit<ComponentProps, "params"> {
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
    Department: pickText(renderingFields?.Department, route.Department),
    EmploymentType: pickText(
      renderingFields?.EmploymentType,
      route.EmploymentType,
    ),
    LocationName: pickText(renderingFields?.LocationName, route.LocationName),
    LocationLink: pickLink(renderingFields?.LocationLink, route.LocationLink),
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

function hasHref(link?: LinkField): boolean {
  const href = link?.value?.href;
  return typeof href === "string" && href.trim().length > 0;
}

function JobDetails({
  params,
  fields,
  rendering,
  page: pageFromSdk,
}: JobDetailsProps) {
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
    "job-details",
    params?.DynamicPlaceholderId,
  );
  const asideKey = sxaPlaceholderName(
    rendering,
    "job-details-aside",
    params?.DynamicPlaceholderId,
  );
  const relatedKey = sxaPlaceholderName(
    rendering,
    "job-details-related",
    params?.DynamicPlaceholderId,
  );
  const fullWidthKey = sxaPlaceholderName(
    rendering,
    "job-details-full-width",
    params?.DynamicPlaceholderId,
  );
  const isPageEditing = page?.mode?.isEditing ?? false;

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
        className="job-details"
        id={id}
        fullWidth={
          rendering ? (
            <Placeholder name={fullWidthKey} rendering={rendering} />
          ) : null
        }
      >
        <div className="grid grid-cols-12 @[768px]:gap-4 gap-y-6">
            {mediaColumn !== "hidden" &&
            (resolved.Image?.value?.src || isPageEditing) ? (
              <div
                className={cn(
                  mediaClass,
                  mediaColumn === "end" ? "order-3" : "order-1",
                )}
              >
                <div className={detailsMediaBoxClass(params, "3x4")}>
                  <Image
                    value={resolved.Image}
                    className={detailsMediaFitClass(params)}
                    isEditing={isPageEditing}
                    placeholder="Image"
                  />
                </div>
                <div className="@[768px]:mt-8 mt-6">
                  {rendering ? (
                    <Placeholder name={asideKey} rendering={rendering} />
                  ) : null}
                </div>
              </div>
            ) : null}

            <div
              className={cn(
                mediaColumn !== "hidden" &&
                  (resolved.Image?.value?.src || isPageEditing)
                  ? copyClass
                  : "col-span-12 @[768px]:col-span-8 @[768px]:col-start-3",
                mediaColumn === "end" ? "order-1" : "order-2",
                detailsTextAlignClass(params),
              )}
            >
              <DetailsEyebrow
                params={params}
                value={resolved.Eyebrow}
                isEditing={isPageEditing}
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
              <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Fact
                  label="Department"
                  value={resolved.Department}
                  isPageEditing={isPageEditing}
                  placeholder="Department"
                />
                <Fact
                  label="Type"
                  value={resolved.EmploymentType}
                  isPageEditing={isPageEditing}
                  placeholder="Employment type"
                />
                <Fact
                  label="Location"
                  value={resolved.LocationName}
                  isPageEditing={isPageEditing}
                  placeholder="Location"
                />
              </dl>
              {(isPageEditing || hasHref(resolved.LocationLink)) && (
                <div className="mt-6">
                  <Button link={resolved.LocationLink} showArrow />
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

            <div className="order-3 @[768px]:col-span-10 col-span-12 @[768px]:col-start-2 @[768px]:mt-12 mt-8">
              {rendering ? (
                <Placeholder name={relatedKey} rendering={rendering} />
              ) : null}
            </div>
          </div>
      </DetailsShell>
    </>
  );
}

export const Default = sitecorePassthrough(JobDetails);

export const componentType = "universal";
