import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout, type HubPlacement } from "./_hub-grammar";

export function locationsFinderLayout(options: {
  searchSlot: string;
  gridSlot: string;
  title: string;
  lead: string;
  cardHandles: string[];
  includeRegionStrip?: boolean;
  hero?: HubPlacement;
  supporting?: HubPlacement[];
  closer?: HubPlacement;
}): PageRecipe["layout"] {
  const finder = {
    componentHandle: "search-experience@1",
    variant: "Default",
    datasourceRef: {
      kind: "scoped" as const,
      slot: options.searchSlot,
      fields: {
        Title: options.title,
      },
    },
    placeholders: {
      "search-controls-leading": [
        {
          componentHandle: "location-search-bar@1",
          variant: "Default",
          params: {
            ShowRadius: "1",
            ShowUseMyLocation: "1",
          },
          datasourceRef: {
            kind: "scoped" as const,
            slot: `${options.searchSlot}Bar`,
            fields: {
              InputPlaceholder: "ZIP or city",
            },
          },
        },
      ],
      "search-results": [
        {
          componentHandle: "locations-list-grid@1",
          variant: "MapAndList",
          params: {
            HeadingLayout: "start",
          },
          datasourceRef: {
            kind: "scoped" as const,
            slot: options.gridSlot,
            fields: {
              Title: options.title,
              Lead: options.lead,
              Locations: {
                shape: "reference" as const,
                refs: options.cardHandles,
              },
            },
          },
          placeholders: {
            "locations-map": [
              {
                componentHandle: "locations-map@1",
                variant: "Default",
                datasourceRef: { kind: "none" as const },
              },
            ],
          },
        },
      ],
    },
  };

  const regionStrip = {
    componentHandle: "features-list-grid@1",
    variant: "IconTile",
    params: {
      HeadingLayout: "start",
      ColumnsLg: "3",
      ColumnsMd: "3",
      ColumnsSm: "1",
    },
    datasourceRef: {
      kind: "scoped" as const,
      slot: "Regions",
      fields: {
        Title: "Browse by territory",
        Lead: "<p>Each territory page has its own map of sample locations.</p>",
      },
    },
    placeholders: {
      "cards-features": [
        {
          componentHandle: "feature-card@1",
          variant: "IconTile",
          datasourceRef: {
            kind: "scoped" as const,
            slot: "RegionNA",
            fields: {
              Title: "North America",
              Description:
                "<p>New York, Chicago, Toronto, Mexico City, San Francisco.</p>",
              IconName: "map",
              Link: {
                href: "/Locations/North-America",
                text: "View territory",
              },
            },
          },
        },
        {
          componentHandle: "feature-card@1",
          variant: "IconTile",
          datasourceRef: {
            kind: "scoped" as const,
            slot: "RegionEMEA",
            fields: {
              Title: "EMEA",
              Description:
                "<p>London, Paris, Frankfurt, Dubai, Johannesburg.</p>",
              IconName: "map",
              Link: {
                href: "/Locations/EMEA",
                text: "View territory",
              },
            },
          },
        },
        {
          componentHandle: "feature-card@1",
          variant: "IconTile",
          datasourceRef: {
            kind: "scoped" as const,
            slot: "RegionAPJ",
            fields: {
              Title: "APJ",
              Description:
                "<p>Tokyo, Singapore, Sydney, Mumbai, Seoul.</p>",
              IconName: "map",
              Link: {
                href: "/Locations/APJ",
                text: "View territory",
              },
            },
          },
        },
      ],
    },
  };

  const body: HubPlacement[] = [];
  if (options.hero) body.push(options.hero);
  if (options.includeRegionStrip) body.push(regionStrip);
  body.push(finder);
  if (options.supporting) body.push(...options.supporting);
  if (options.closer) body.push(options.closer);

  return container1Layout(body);
}
