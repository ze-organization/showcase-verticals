"use client";

import { useI18n } from "next-localization";
import { ItemTabs } from "@/components/registry/blocks";
import { Card, CardContent } from "@/components/registry/primitives/core/card";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  TypographyH4,
  TypographyMuted,
  TypographySmall,
} from "@/components/registry/primitives/core/typography";
import {
  NextImage as Image,
  type ImageSource,
} from "@/components/registry/primitives/editables/image";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import { resolveImageAlt } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import type { DestinationFields } from "@/content/registry/models/destination.model";

const cardTitleClass = "flex items-center gap-2 text-lg font-semibold";

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

export const DestinationTabs = ({
  destination,
}: {
  destination: DestinationFields;
}) => {
  const t = useSafeTranslate();
  const activities = destination.Activities ?? [];
  const weather = destination.Weather ?? [];
  const travelTips = destination.TravelTips ?? [];
  const hotels = destination.Hotels ?? [];

  return (
    <ItemTabs
      defaultTabId="activities"
      tabsAriaLabel="Destination information tabs"
      tabs={[
        {
          id: "activities",
          label: t("activities_label") || "Activities",
          items: activities,
          getItemKey: (item) => item.id,
          renderItem: (a) => (
            <Card
              elevation="sm"
              style="outline"
              padding="md"
              className="w-full"
            >
              <CardContent className="gap-4">
                <TypographyH4 className={cardTitleClass}>
                  <LibraryIcon
                    name="camera"
                    className="size-5"
                    aria-hidden={true}
                  />
                  <Text value={a.fields.Title} />
                </TypographyH4>
                <div data-slot="rich-text" className="marker:text-accent">
                  <RichText value={a.fields.Description} />
                </div>
              </CardContent>
            </Card>
          ),
        },
        {
          id: "weather",
          label: t("weather_label") || "Weather",
          items: weather,
          getItemKey: (item) => item.id,
          renderItem: (w) =>
            // Weather items can vary by datasource shape; use permissive field access.
            (() => {
              const weatherFields = w.fields as unknown as Record<
                string,
                unknown
              >;
              return (
                <Card
                  elevation="sm"
                  style="outline"
                  padding="md"
                  className="w-full"
                >
                  <CardContent className="gap-4">
                    <div className="flex items-center gap-4">
                      <Image
                        value={weatherFields.Image as ImageSource}
                        alt={resolveImageAlt(w.fields.Title, "Weather icon")}
                        width={24}
                        height={24}
                      />
                      <div>
                        <TypographyH4 className={`${cardTitleClass} mb-0`}>
                          <Text value={w.fields.Title} />
                        </TypographyH4>
                        <TypographyMuted>
                          <Text value={weatherFields.Duration as TextSource} />
                        </TypographyMuted>
                      </div>
                    </div>

                    <TypographyMuted className="grid grid-cols-2">
                      <span>{t("temperature_label") || "Temperature:"}</span>
                      <TypographySmall className="justify-self-end text-foreground">
                        <Text value={weatherFields.Temperature as TextSource} />
                      </TypographySmall>
                    </TypographyMuted>
                    <TypographyMuted>
                      <Text value={w.fields.Description} />
                    </TypographyMuted>
                  </CardContent>
                </Card>
              );
            })(),
        },
        {
          id: "travel-tips",
          label: t("travel_tips_label") || "Travel Tips",
          items: travelTips,
          getItemKey: (item) => item.id,
          renderItem: (tip) => (
            <Card
              elevation="sm"
              style="outline"
              padding="md"
              className="w-full"
            >
              <CardContent className="gap-4">
                <TypographyH4 className={cardTitleClass}>
                  <LibraryIcon
                    name="navigation"
                    className="size-5"
                    aria-hidden={true}
                  />
                  <Text value={tip.fields.Title} />
                </TypographyH4>
                <div data-slot="rich-text" className="marker:text-accent">
                  <RichText value={tip.fields.Description} />
                </div>
              </CardContent>
            </Card>
          ),
        },
        {
          id: "hotels",
          label: t("hotels_label") || "Hotels",
          items: hotels,
          getItemKey: (item) => item.id,
          renderItem: (h) =>
            (() => {
              const hotelFields = h.fields as unknown as Record<
                string,
                unknown
              >;
              return (
                <Card
                  elevation="sm"
                  style="outline"
                  padding="md"
                  className="w-full"
                >
                  <CardContent className="gap-4">
                    <div className="flex flex-wrap justify-between">
                      <TypographyH4 className={`${cardTitleClass} mb-0`}>
                        <LibraryIcon
                          name="bed"
                          className="size-5"
                          aria-hidden={true}
                        />
                        <Text value={h.fields.Title} />
                      </TypographyH4>
                      <TypographySmall className="self-start rounded-md border px-2 py-1 font-bold">
                        <Text value={hotelFields.PriceRange as TextSource} />
                      </TypographySmall>
                    </div>
                    <div
                      data-slot="rich-text"
                      className="text-muted-foreground marker:text-accent [&_.ck-content]:text-sm"
                    >
                      <RichText value={h.fields.Description} />
                    </div>
                    <div>
                      <TypographyH4 className="mb-2 text-sm">
                        {t("popular_options_label") || "Popular options:"}
                      </TypographyH4>
                      <div data-slot="rich-text">
                        <RichText
                          value={hotelFields.PopularOptions as RichTextSource}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })(),
        },
      ]}
    />
  );
};
