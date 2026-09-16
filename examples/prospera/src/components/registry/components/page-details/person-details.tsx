"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
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
  FullName: Field<string>;
  Role: Field<string>;
  Bio: RichTextField;
  Eyebrow: Field<string>;
  Image: ImageField;
  Email: Field<string>;
  Phone: Field<string>;
}

interface PersonDetailsProps extends Omit<ComponentProps, "params"> {
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
    FullName: pickText(renderingFields?.FullName, route.FullName),
    Role: pickText(renderingFields?.Role, route.Role),
    Bio: pickText(renderingFields?.Bio, route.Bio),
    Eyebrow: pickText(renderingFields?.Eyebrow, route.Eyebrow),
    Image: pickImage(renderingFields?.Image, route.Image),
    Email: pickText(renderingFields?.Email, route.Email),
    Phone: pickText(renderingFields?.Phone, route.Phone),
  };
}

function PersonDetails({
  params,
  fields,
  rendering,
  page: pageFromSdk,
}: PersonDetailsProps) {
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
    "person-details",
    params?.DynamicPlaceholderId,
  );
  const asideKey = sxaPlaceholderName(
    rendering,
    "person-details-aside",
    params?.DynamicPlaceholderId,
  );
  const relatedKey = sxaPlaceholderName(
    rendering,
    "person-details-related",
    params?.DynamicPlaceholderId,
  );
  const fullWidthKey = sxaPlaceholderName(
    rendering,
    "person-details-full-width",
    params?.DynamicPlaceholderId,
  );
  const isPageEditing = page?.mode?.isEditing ?? false;
  const heading = resolved.FullName ?? resolved.Title;
  const mediaColumn = parseDetailsMediaColumn(params?.MediaColumn);
  const { mediaClass, copyClass } = detailsSplitColClasses(
    mediaColumn,
    "aside",
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
  );

  const copy = (
    <div className={cn(copyClass, detailsTextAlignClass(params))}>
      <DetailsEyebrow
        params={params}
        value={resolved.Eyebrow}
        isEditing={isPageEditing}
      />
      <DetailsTitle
        params={params}
        value={heading}
        isEditing={isPageEditing}
        placeholder="Full name"
      />
      <Text
        tag="p"
        className="mt-3 font-medium text-lg text-muted-foreground"
        value={resolved.Role}
        isEditing={isPageEditing}
        placeholder="Role"
      />
      {(resolved.Email?.value || resolved.Phone?.value || isPageEditing) && (
        <p className="mt-4 text-muted-foreground text-sm">
          <Text
            tag="span"
            value={resolved.Email}
            isEditing={isPageEditing}
            placeholder="Email"
          />
          {resolved.Email?.value && resolved.Phone?.value ? " · " : null}
          <Text
            tag="span"
            value={resolved.Phone}
            isEditing={isPageEditing}
            placeholder="Phone"
          />
        </p>
      )}
      <RichText
        data-slot="rich-text"
        className={cn("@[768px]:mt-10 mt-6", detailsProseClass(params))}
        value={resolved.Bio}
        isEditing={isPageEditing}
        placeholder="Bio"
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
        <meta property="og:title" content={heading?.value} />
        <meta property="og:image" content={resolved.Image?.value?.src} />
        <meta property="og:type" content="profile" />
      </Head>

            <DetailsShell
        params={params}
        className="person-details"
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

export const Default = sitecorePassthrough(PersonDetails);

export const componentType = "universal";
