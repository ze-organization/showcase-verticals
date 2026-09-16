"use client";

import Head from "next/head";
import { useI18n } from "next-localization";
import { useEffect, useState } from "react";
import { ParentPathLink } from "@/components/registry/blocks";
import { SocialShare } from "@/components/registry/components/social/social-share";
import { DestinationSidebar } from "@/components/registry/components/unfinished/destination-sidebar";
import { Badge } from "@/components/registry/primitives/core/badge";
import { Button } from "@/components/registry/primitives/core/button";
import { Card, CardContent } from "@/components/registry/primitives/core/card";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  TypographyH4,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import { NextImage as Image } from "@/components/registry/primitives/editables/image";
import { RichText } from "@/components/registry/primitives/editables/richtext";
import { resolveImageAlt } from "@/components/registry/primitives/editables/source-normalizers";
import { Text } from "@/components/registry/primitives/editables/text";
import type { DestinationFields } from "@/content/registry/models/destination.model";
import { asArray } from "@/lib/registry/placeholder-children";
import { useSitecore } from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";
import { DestinationTabs } from "./destination-tabs";

interface DestinationDetailsProps extends Omit<ComponentProps, "params"> {
  fields: DestinationFields;
  // Optional on purpose: metadata editing payloads and hand-mounted
  // previews deliver no params at all. Destructuring a missing params
  // object must not crash the page (language-switcher precedent).
  params?: ComponentProps["params"];
}

// next-localization's I18nContext has no default value, so `useI18n()`
// returns `undefined` when no `<I18nProvider>` ancestor exists
// (Sitecore metadata editing payloads, hand-mounted previews) even
// though the typings promise an instance. Destructuring `{ t }` from
// that undefined crashed the whole editing canvas; fall back to a
// no-op translate so every context renders the English defaults.
function useSafeTranslate(): (key: string) => string {
  const i18n = useI18n() as ReturnType<typeof useI18n> | undefined;
  return i18n ? (key) => i18n.t(key) : () => "";
}

export const Default = ({ params, fields }: DestinationDetailsProps) => {
  // Safe without a SitecoreProvider (showcase previews, tests): the
  // SDK's context default is `{}`, so `page` is simply undefined —
  // never dereference `page.mode` unguarded.
  const { page } = useSitecore();
  const [currentUrl, setCurrentUrl] = useState("");
  const { styles, RenderingIdentifier: id } = params ?? {};
  const isPageEditing = page?.mode?.isEditing ?? false;
  const t = useSafeTranslate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Mirror article-details: don't propagate an editing-host internal
    // render URL to og:url — social-share consumes that meta tag as
    // the canonical share URL and a broken value cascades.
    const here = window.location.href;
    const path = new URL(here).pathname;
    if (/^\/(api|_next)\b/.test(path)) {
      setCurrentUrl("");
      return;
    }
    setCurrentUrl(here);
  }, []);

  if (!fields) {
    return isPageEditing ? (
      <div className={`component article-details ${styles}`} id={id}>
        [DESTINATION DETAILS]
      </div>
    ) : null;
  }

  return (
    <>
      <Head>
        <meta property="og:url" content={currentUrl} />
        <meta property="og:name" content={fields?.Title?.value} />
        <meta property="og:title" content={fields?.Title?.value} />
        <meta
          property="og:description"
          content={fields?.ShortDescription?.value}
        />
        <meta property="og:image" content={fields?.Image?.value?.src} />
        <meta property="og:type" content="article" />
      </Head>

      <article className={`component destination-details ${styles}`} id={id}>
        <div className="container mx-auto px-4">
          <ParentPathLink
            text={t("back_to_destinations") || "Back to Destinations"}
          />
        </div>

        <div className="relative flex min-h-96 flex-col justify-between gap-8 px-4 py-8 sm:px-8 lg:min-h-130">
          <div className="relative z-1 flex justify-end gap-2">
            <Button
              variant="outline"
              className="inline-flex items-center gap-2 rounded-md border border-background/40 bg-background/10 px-3 py-1.5 font-medium text-background text-sm backdrop-blur-sm transition hover:bg-background/20"
            >
              <LibraryIcon name="heart" className="size-4" aria-hidden="true" />
              {t("save_label") || "Save"}
            </Button>
            {/* SocialShare derives URL / title / description / OG image
                from the live page head; no per-instance content
                props. The destination page's <head> already carries
                the og:* tags. */}
            <SocialShare />
          </div>

          <div className="relative z-2">
            <div className="flex items-center gap-1">
              <LibraryIcon
                name="star"
                className="inline size-4 fill-current text-warning"
                aria-hidden="true"
              />
              <span className="font-bold text-background">
                <Text
                  value={{
                    value:
                      typeof fields.Rating?.value === "number"
                        ? String(fields.Rating.value)
                        : "",
                  }}
                />
              </span>
              <span className="ms-2 text-background-muted/80">
                <Text
                  value={{
                    value:
                      typeof fields.NumberOfReviews?.value === "number"
                        ? String(fields.NumberOfReviews.value)
                        : "",
                  }}
                />{" "}
                {t("reviews_label") || "reviews"}
              </span>
            </div>
            <h1 className="text-background">
              <Text value={fields.Title} />
            </h1>
            <p className="text-background-muted/90 text-xl">
              <Text value={fields.Country} />
            </p>
          </div>

          <Image
            value={fields.Image}
            className="absolute inset-0 z-0 h-full w-full object-cover"
            fill
          />
        </div>

        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="grid gap-x-8 gap-y-12 lg:grid-cols-3">
            <div className="space-y-12 lg:col-span-2">
              <div>
                <h4 className="mb-4">
                  {t("about_label") || "About"} {fields?.Title?.value}
                </h4>
                <div data-slot="rich-text">
                  <RichText value={fields.Content} />
                </div>
              </div>
              <div>
                <TypographyH4 className="mb-4">
                  {t("top_highlights_label") || "Top Highlights"}
                </TypographyH4>
                <div className="grid gap-4 lg:grid-cols-2">
                  {asArray(fields.Highlights).map((highlight) => (
                    <Card
                      key={highlight.id}
                      elevation="sm"
                      style="outline"
                      // Radius stays with the Card primitive's `--card-radius` token.
                      className="flex h-full flex-col gap-0 overflow-hidden p-0"
                    >
                      <div className="relative h-48 bg-background-accent">
                        <Image
                          value={highlight.fields.Image}
                          alt={resolveImageAlt(
                            highlight.fields.Title,
                            "Highlight image",
                          )}
                          className="h-full w-full object-cover"
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <Badge
                          size="sm"
                          variant="rounded"
                          colorScheme="primary"
                          className="absolute start-3 top-3 z-2"
                        >
                          <Text value={highlight.fields.Label} />
                        </Badge>
                      </div>
                      <CardContent className="space-y-2 p-6">
                        <TypographyH4 className="text-base">
                          <Text value={highlight.fields.Title} />
                        </TypographyH4>
                        <TypographyMuted>
                          <Text value={highlight.fields.Description} />
                        </TypographyMuted>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <DestinationTabs destination={fields} />
            </div>
            <DestinationSidebar destination={fields} />
          </div>
        </div>
      </article>
    </>
  );
};

export const componentType = "universal";
