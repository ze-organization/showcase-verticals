/**
 * Shared demo locations. Not a recipe — scai only globs `*.recipe.ts`.
 * Used by page recipes, location-card content items, and listing Treelists.
 */

export type LocationRegion = "North America" | "EMEA" | "APJ";
export type LocationRegionSlug = "north-america" | "emea" | "apj";

export const TERRITORY_PATH: Record<LocationRegionSlug, string> = {
  "north-america": "North-America",
  emea: "EMEA",
  apj: "APJ",
};

export interface LocationDemo {
  slug: string;
  regionSlug: LocationRegionSlug;
  region: LocationRegion;
  /** Title-Case metro segment when this location nests under a Metro hub. */
  metroSlug?: string;
  name: string;
  eyebrow: string;
  shortDescription: string;
  content: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  hours: string;
  latitude: number;
  longitude: number;
  imageSeed: string;
  imageAlt: string;
}

const HOURS =
  "<p>Monday–Friday 9:00–17:00<br/>Saturday 10:00–14:00<br/>Sunday closed</p>";

export const LOCATION_DEMOS: LocationDemo[] = [
  {
    slug: "new-york-midtown",
    regionSlug: "north-america",
    metroSlug: "New-York",
    region: "North America",
    name: "New York Midtown",
    eyebrow: "Flagship",
    shortDescription:
      "A midtown floor overlooking the plaza — walk-in hours and a booked desk for longer work.",
    content:
      "<p>The Midtown location sits on Rockefeller Plaza. Drop in for a same-day consult, or book a room looking west over the skating rink in winter.</p><p>Street-level lobby; photo ID at reception. Nearest subway is 47–50 Streets Rockefeller Center.</p>",
    address1: "30 Rockefeller Plaza",
    city: "New York",
    state: "NY",
    postalCode: "10112",
    country: "United States",
    phone: "+1 212 555 0148",
    email: "newyork@example.com",
    hours: HOURS,
    latitude: 40.7587,
    longitude: -73.9787,
    imageSeed: "nyc-midtown-location",
    imageAlt: "Midtown plaza towers",
  },
  {
    slug: "chicago-loop",
    regionSlug: "north-america",
    region: "North America",
    name: "Chicago Loop",
    eyebrow: "Branch",
    shortDescription:
      "A Loop address on Wacker — river views, a long conference table, and late hours on Thursday.",
    content:
      "<p>The Loop location is on the south tower of 233 South Wacker. Enter on Wacker; elevators to 12.</p><p>Parking is validated for two hours in the building garage when you check in at reception.</p>",
    address1: "233 S Wacker Dr",
    city: "Chicago",
    state: "IL",
    postalCode: "60606",
    country: "United States",
    phone: "+1 312 555 0194",
    email: "chicago@example.com",
    hours: HOURS,
    latitude: 41.8789,
    longitude: -87.6359,
    imageSeed: "chicago-loop-location",
    imageAlt: "Chicago river and towers",
  },
  {
    slug: "toronto-financial-district",
    regionSlug: "north-america",
    region: "North America",
    name: "Toronto Financial District",
    eyebrow: "Branch",
    shortDescription:
      "Across from Nathan Phillips Square — a compact floor for hybrid teams in the core.",
    content:
      "<p>The Toronto location faces City Hall. PATH connected in winter; Queen streetcar at the door.</p><p>Bilingual reception. Book a booth if you need a closed door for a call.</p>",
    address1: "100 Queen St W",
    city: "Toronto",
    state: "ON",
    postalCode: "M5H 2N2",
    country: "Canada",
    phone: "+1 416 555 0136",
    email: "toronto@example.com",
    hours: HOURS,
    latitude: 43.6534,
    longitude: -79.3841,
    imageSeed: "toronto-fd-location",
    imageAlt: "Toronto city hall square",
  },
  {
    slug: "mexico-city-reforma",
    regionSlug: "north-america",
    region: "North America",
    name: "Mexico City Reforma",
    eyebrow: "Branch",
    shortDescription:
      "On Paseo de la Reforma — a light-filled floor for meetings that start after the morning traffic.",
    content:
      "<p>Reforma 222, Juárez. The Angel is a short walk east. Reception on 8.</p><p>Spanish and English at the desk. Coffee is on until 16:00.</p>",
    address1: "Paseo de la Reforma 222",
    address2: "Juárez, Cuauhtémoc",
    city: "Mexico City",
    state: "CDMX",
    postalCode: "06600",
    country: "Mexico",
    phone: "+52 55 5555 0188",
    email: "mexicocity@example.com",
    hours: HOURS,
    latitude: 19.4285,
    longitude: -99.1677,
    imageSeed: "cdmx-reforma-location",
    imageAlt: "Paseo de la Reforma",
  },
  {
    slug: "san-francisco-embarcadero",
    regionSlug: "north-america",
    region: "North America",
    name: "San Francisco Embarcadero",
    eyebrow: "Branch",
    shortDescription:
      "One Market — a waterfront floor for west-coast hours and a quiet room facing the bay.",
    content:
      "<p>The Embarcadero location is in One Market Street. Ferry Building is a five-minute walk.</p><p>Bike parking in the garage. Book the bay room if you are hosting more than four.</p>",
    address1: "1 Market St",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
    country: "United States",
    phone: "+1 415 555 0172",
    email: "sanfrancisco@example.com",
    hours: HOURS,
    latitude: 37.7936,
    longitude: -122.3942,
    imageSeed: "sf-embarcadero-location",
    imageAlt: "San Francisco embarcadero",
  },
  {
    slug: "london-canary-wharf",
    regionSlug: "emea",
    region: "EMEA",
    name: "London Canary Wharf",
    eyebrow: "Flagship",
    shortDescription:
      "One Canada Square — a docklands floor with early starts for continental calls.",
    content:
      "<p>Enter One Canada Square from Cabot Square. Jubilee and DLR at Canary Wharf.</p><p>Photo ID at the lobby. The 22nd-floor room looks east over the river.</p>",
    address1: "1 Canada Square",
    city: "London",
    state: "England",
    postalCode: "E14 5AB",
    country: "United Kingdom",
    phone: "+44 20 7946 0958",
    email: "london@example.com",
    hours: HOURS,
    latitude: 51.5049,
    longitude: -0.0195,
    imageSeed: "london-canary-location",
    imageAlt: "Canary Wharf towers",
  },
  {
    slug: "paris-madeleine",
    regionSlug: "emea",
    region: "EMEA",
    name: "Paris Madeleine",
    eyebrow: "Branch",
    shortDescription:
      "Faubourg Saint-Honoré — a compact salon for meetings that should feel like a house, not a tower.",
    content:
      "<p>29 Rue du Faubourg Saint-Honoré, 8th. Madeleine Métro is the closest stop.</p><p>Ring at the courtyard. French and English at reception.</p>",
    address1: "29 Rue du Faubourg Saint-Honoré",
    city: "Paris",
    state: "Île-de-France",
    postalCode: "75008",
    country: "France",
    phone: "+33 1 42 68 53 00",
    email: "paris@example.com",
    hours: HOURS,
    latitude: 48.8698,
    longitude: 2.3185,
    imageSeed: "paris-madeleine-location",
    imageAlt: "Paris street near Madeleine",
  },
  {
    slug: "frankfurt-westend",
    regionSlug: "emea",
    region: "EMEA",
    name: "Frankfurt Westend",
    eyebrow: "Branch",
    shortDescription:
      "Taunusanlage — a Westend floor for banking hours and a late Thursday clinic.",
    content:
      "<p>Taunusanlage 12, 60325. S-Bahn Taunusanlage is a short walk.</p><p>German and English at the desk. Visitor badges print in the lobby.</p>",
    address1: "Taunusanlage 12",
    city: "Frankfurt",
    state: "Hesse",
    postalCode: "60325",
    country: "Germany",
    phone: "+49 69 2562 140",
    email: "frankfurt@example.com",
    hours: HOURS,
    latitude: 50.1109,
    longitude: 8.6682,
    imageSeed: "frankfurt-westend-location",
    imageAlt: "Frankfurt skyline",
  },
  {
    slug: "dubai-difc",
    regionSlug: "emea",
    region: "EMEA",
    name: "Dubai DIFC",
    eyebrow: "Branch",
    shortDescription:
      "Gate Village in DIFC — a floor that stays open through the afternoon heat.",
    content:
      "<p>Gate Village, Dubai International Financial Centre. Metro Financial Centre is the closest stop.</p><p>Sunday–Thursday hours. Visitor parking in the Gate Village garage.</p>",
    address1: "Gate Village",
    address2: "Dubai International Financial Centre",
    city: "Dubai",
    state: "Dubai",
    postalCode: "00000",
    country: "United Arab Emirates",
    phone: "+971 4 363 8900",
    email: "dubai@example.com",
    hours:
      "<p>Sunday–Thursday 9:00–17:00<br/>Friday–Saturday closed</p>",
    latitude: 25.2108,
    longitude: 55.2794,
    imageSeed: "dubai-difc-location",
    imageAlt: "DIFC Gate Village",
  },
  {
    slug: "johannesburg-sandton",
    regionSlug: "emea",
    region: "EMEA",
    name: "Johannesburg Sandton",
    eyebrow: "Branch",
    shortDescription:
      "Grayston Drive, Sandton — a Gauteng floor for in-person days and a backed-up generator.",
    content:
      "<p>90 Grayston Drive, Sandhurst. Gautrain Sandton is a short shuttle.</p><p>Secure parking under the building. Sign in at the podium before 17:00.</p>",
    address1: "90 Grayston Dr",
    city: "Sandton",
    state: "Gauteng",
    postalCode: "2196",
    country: "South Africa",
    phone: "+27 11 784 3200",
    email: "johannesburg@example.com",
    hours: HOURS,
    latitude: -26.107,
    longitude: 28.0567,
    imageSeed: "jhb-sandton-location",
    imageAlt: "Sandton streetscape",
  },
  {
    slug: "tokyo-marunouchi",
    regionSlug: "apj",
    region: "APJ",
    name: "Tokyo Marunouchi",
    eyebrow: "Flagship",
    shortDescription:
      "Marunouchi, one block from Tokyo Station — early hours for the first Shinkansen.",
    content:
      "<p>1-1 Marunouchi, Chiyoda. Tokyo Station Marunouchi North is the closest exit.</p><p>Japanese and English at reception. Remove outdoor shoes only in the tatami room — everything else is shoes-on.</p>",
    address1: "1-1 Marunouchi",
    city: "Chiyoda City",
    state: "Tokyo",
    postalCode: "100-0005",
    country: "Japan",
    phone: "+81 3 3212 5800",
    email: "tokyo@example.com",
    hours: HOURS,
    latitude: 35.6812,
    longitude: 139.7671,
    imageSeed: "tokyo-marunouchi-location",
    imageAlt: "Tokyo Station Marunouchi",
  },
  {
    slug: "singapore-raffles-place",
    regionSlug: "apj",
    region: "APJ",
    name: "Singapore Raffles Place",
    eyebrow: "Branch",
    shortDescription:
      "One Raffles Place — a CBD floor for island-wide hours and a room without windows for focused work.",
    content:
      "<p>1 Raffles Place. MRT Raffles Place is in the basement.</p><p>Air-con is aggressive. Bring a layer. Guest Wi-Fi prints on the badge.</p>",
    address1: "1 Raffles Place",
    city: "Singapore",
    state: "Singapore",
    postalCode: "048616",
    country: "Singapore",
    phone: "+65 6538 0000",
    email: "singapore@example.com",
    hours: HOURS,
    latitude: 1.2842,
    longitude: 103.851,
    imageSeed: "sg-raffles-location",
    imageAlt: "Raffles Place towers",
  },
  {
    slug: "sydney-circular-quay",
    regionSlug: "apj",
    region: "APJ",
    name: "Sydney Circular Quay",
    eyebrow: "Branch",
    shortDescription:
      "Macquarie Place — a quay-side floor for east-coast hours and a balcony that actually gets used.",
    content:
      "<p>1 Macquarie Place, Sydney. Circular Quay ferry and trains are a four-minute walk.</p><p>The balcony faces the water. Book it if you are hosting more than six.</p>",
    address1: "1 Macquarie Place",
    city: "Sydney",
    state: "NSW",
    postalCode: "2000",
    country: "Australia",
    phone: "+61 2 9256 4000",
    email: "sydney@example.com",
    hours: HOURS,
    latitude: -33.8612,
    longitude: 151.2102,
    imageSeed: "sydney-quay-location",
    imageAlt: "Sydney Circular Quay",
  },
  {
    slug: "mumbai-bkc",
    regionSlug: "apj",
    region: "APJ",
    name: "Mumbai BKC",
    eyebrow: "Branch",
    shortDescription:
      "One BKC — a Bandra Kurla floor for morning meetings before the western suburbs clog.",
    content:
      "<p>One BKC, G Block, Bandra Kurla Complex. The metro is a short auto from the podium.</p><p>Visitor parking is pre-booked. Call before 10:00 if you are driving in.</p>",
    address1: "One BKC",
    address2: "G Block, Bandra Kurla Complex",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400051",
    country: "India",
    phone: "+91 22 2659 2100",
    email: "mumbai@example.com",
    hours: HOURS,
    latitude: 19.0611,
    longitude: 72.8633,
    imageSeed: "mumbai-bkc-location",
    imageAlt: "Bandra Kurla Complex",
  },
  {
    slug: "seoul-gangnam",
    regionSlug: "apj",
    region: "APJ",
    name: "Seoul Gangnam",
    eyebrow: "Branch",
    shortDescription:
      "Yeongdong-daero, Gangnam — a floor for late evenings and a room that stays booked on Thursdays.",
    content:
      "<p>511 Yeongdong-daero, Gangnam-gu. Line 2 Samseong is the closest station.</p><p>Korean and English at the desk. Remove outdoor shoes in the quiet room only.</p>",
    address1: "511 Yeongdong-daero",
    city: "Gangnam-gu",
    state: "Seoul",
    postalCode: "06164",
    country: "South Korea",
    phone: "+82 2 6000 7114",
    email: "seoul@example.com",
    hours: HOURS,
    latitude: 37.5102,
    longitude: 127.0595,
    imageSeed: "seoul-gangnam-location",
    imageAlt: "Gangnam street at dusk",
  },
];

export function locationHref(demo: LocationDemo): string {
  const territory = TERRITORY_PATH[demo.regionSlug];
  if (demo.metroSlug) {
    return `/Locations/${territory}/${demo.metroSlug}/${demo.slug}`;
  }
  return `/Locations/${territory}/${demo.slug}`;
}

export function locationItemPath(demo: LocationDemo): string {
  const territory = TERRITORY_PATH[demo.regionSlug];
  if (demo.metroSlug) {
    return `/sitecore/content/{site}/Home/Locations/${territory}/${demo.metroSlug}/${demo.slug}`;
  }
  return `/sitecore/content/{site}/Home/Locations/${territory}/${demo.slug}`;
}

export function locationCardHandle(demo: LocationDemo): string {
  return `location-card-${demo.slug}@1`;
}

export function locationPageHandle(demo: LocationDemo): string {
  return `location-${demo.slug}@1`;
}

export function locationsInRegion(
  regionSlug: LocationDemo["regionSlug"],
): LocationDemo[] {
  return LOCATION_DEMOS.filter((demo) => demo.regionSlug === regionSlug);
}

export function locationsInMetro(
  regionSlug: LocationDemo["regionSlug"],
  metroSlug: string,
): LocationDemo[] {
  return LOCATION_DEMOS.filter(
    (demo) => demo.regionSlug === regionSlug && demo.metroSlug === metroSlug,
  );
}

export const NA_LOCATION_CARD_HANDLES = locationsInRegion("north-america").map(
  locationCardHandle,
);
export const EMEA_LOCATION_CARD_HANDLES = locationsInRegion("emea").map(
  locationCardHandle,
);
export const APJ_LOCATION_CARD_HANDLES = locationsInRegion("apj").map(
  locationCardHandle,
);
export const NY_METRO_LOCATION_CARD_HANDLES = locationsInMetro(
  "north-america",
  "New-York",
).map(locationCardHandle);
export const ALL_LOCATION_CARD_HANDLES = LOCATION_DEMOS.map(locationCardHandle);
