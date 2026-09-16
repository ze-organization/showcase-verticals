"use client";

import { useI18n } from "next-localization";
import { Button } from "@/components/registry/primitives/core/button";
import { Card, CardContent } from "@/components/registry/primitives/core/card";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { Separator } from "@/components/registry/primitives/core/separator";
import {
  TypographyH3,
  TypographyH4,
  TypographyMuted,
  TypographySmall,
} from "@/components/registry/primitives/core/typography";
import { Text } from "@/components/registry/primitives/editables/text";
import type { DestinationFields } from "@/content/registry/models/destination.model";

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

export const DestinationSidebar = ({
  destination,
}: {
  destination: DestinationFields;
}) => {
  const t = useSafeTranslate();
  const infoCardTitleClass = "flex items-center gap-2 text-lg font-semibold";

  return (
    <div className="relative space-y-8">
      <Card
        elevation="sm"
        padding="sm"
        style="outline"
        className="bg-background-muted p-4 shadow-sm lg:sticky lg:top-6"
      >
        <CardContent className="space-y-4">
          <TypographyH4 className={infoCardTitleClass}>
            <LibraryIcon name="plane" className="size-5" aria-hidden="true" />
            {t("book_your_flight_label") || "Book Your Flight"}
          </TypographyH4>
          <div className="flex flex-col items-center gap-2">
            <TypographyH3 className="text-3xl text-accent">
              <Text value={destination.Price} />
            </TypographyH3>
            <TypographyMuted>
              {t("round_trip_per_person_label") || "round trip per person"}
            </TypographyMuted>
          </div>
          <Separator />
          <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            <TypographyMuted>
              {t("flight_time_label") || "Flight time:"}
            </TypographyMuted>
            <TypographySmall className="w-full justify-self-end text-foreground">
              <Text value={destination.FlightTime} />
            </TypographySmall>
            <TypographyMuted>
              {t("airports_label") || "Airports:"}
            </TypographyMuted>
            <TypographySmall className="w-full justify-self-end text-foreground">
              <Text value={destination.Airports} />
            </TypographySmall>
          </div>
          <Button className="mt-4 w-full" size="sm">
            {t("search_flights_label") || "Search Flights"}
          </Button>
          <TypographyMuted className="text-center text-xs">
            <Text value={destination.DirectFlights} />
          </TypographyMuted>
        </CardContent>
      </Card>

      <Card
        elevation="sm"
        padding="sm"
        style="outline"
        className="bg-background p-4 shadow-sm"
      >
        <CardContent className="space-y-4">
          <TypographyH4 className={infoCardTitleClass}>
            {t("quick_facts_label") || "Quick Facts"}
          </TypographyH4>
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <TypographyMuted>
              {t("language_label") || "Language:"}
            </TypographyMuted>
            <TypographySmall className="justify-self-end text-end text-foreground">
              <Text value={destination.Language} />
            </TypographySmall>
            <TypographyMuted>
              {t("currency_label") || "Currency:"}
            </TypographyMuted>
            <TypographySmall className="justify-self-end text-end text-foreground">
              <Text value={destination.Currency} />
            </TypographySmall>
            <TypographyMuted>
              {t("time_zone_label") || "Time Zone:"}
            </TypographyMuted>
            <TypographySmall className="justify-self-end text-end text-foreground">
              <Text value={destination.TimeZone} />
            </TypographySmall>
            <TypographyMuted>{t("visa_label") || "Visa:"}</TypographyMuted>
            <TypographySmall className="justify-self-end text-end text-foreground">
              <Text value={destination.Visa} />
            </TypographySmall>
          </div>
        </CardContent>
      </Card>

      <Card
        elevation="sm"
        padding="sm"
        style="outline"
        className="bg-background p-4 shadow-sm"
      >
        <CardContent className="space-y-4">
          <TypographyH4 className={infoCardTitleClass}>
            <LibraryIcon name="phone" className="size-5" aria-hidden="true" />
            {t("need_help_label") || "Need Help?"}
          </TypographyH4>
          <TypographyMuted>
            {t("need_help_description") ||
              "Our travel experts are here to help you plan the perfect trip."}
          </TypographyMuted>
          <Button variant="outline" className="mt-4 w-full" size="sm">
            {t("contact_support_label") || "Contact Support"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
