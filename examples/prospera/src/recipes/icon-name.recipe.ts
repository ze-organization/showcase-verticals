import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing every `IconName`-shaped Droplink — the
 * authoring/composer surface of the curated named-icon vocabulary in
 * [src/components/registry/graphics/icons/named-icon/icon-vocabulary.ts].
 * Lands at `<enumerationsRoot>/Graphics/IconName` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "icon-name@1"` on any enum-shaped field/param (first consumer:
 * `quick-link-tile@1`'s `IconName` field). Each value's `description`
 * is per-value guidance an AI composer reads to pick the right glyph.
 *
 * SYNC CONTRACT: value names here must exactly match `ICON_NAMES` in
 * the vocabulary module — `NamedIcon` renders nothing for names it
 * doesn't know. tests/registry/unit/graphics/named-icon.test.tsx
 * enforces the match; add/rename names in BOTH files.
 */
export const iconNameEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "icon-name@1",
  name: "IconName",
  displayName: "Icon Name",
  description:
    "Curated named-icon vocabulary — semantic, domain-neutral names for crisp vector icons (task-portal tiles, utility links). Pick by MEANING, not by glyph shape.",
  location: { scope: "site", folder: ["Graphics"] },
  values: [
    // Clearing sentinel — NOT a glyph. Droplink params in Pages have no
    // native "unset" affordance, so once an author picks an icon they
    // could never get back to the image-led treatment. `none` is the
    // explicit way back: NamedIcon renders nothing for it and consumers
    // (e.g. card-block's icon badge) fall through to their Media image.
    {
      name: "none",
      displayName: "None (clear icon)",
      description:
        "No icon — clears a previously picked icon so the component falls back to its image/default treatment.",
    },
    // Accounts, identity & access
    {
      name: "account",
      displayName: "Account",
      description: "My account / profile overview entry point.",
    },
    {
      name: "user",
      displayName: "User",
      description: "A single person; generic profile or contact.",
    },
    {
      name: "users",
      displayName: "Users",
      description: "Groups, households, teams, or member lists.",
    },
    {
      name: "sign-in",
      displayName: "Sign In",
      description: "Log in / register entry point.",
    },
    {
      name: "sign-out",
      displayName: "Sign Out",
      description: "Log out / end session.",
    },
    {
      name: "lock",
      displayName: "Lock",
      description: "Security, privacy, or password settings.",
    },
    {
      name: "key",
      displayName: "Key",
      description: "Access keys, credentials, or password reset.",
    },
    {
      name: "shield",
      displayName: "Shield",
      description: "Protection, coverage, fraud prevention, or trust badges.",
    },
    {
      name: "id-card",
      displayName: "ID Card",
      description: "Identification, membership card, or license.",
    },

    // Money, billing & commerce
    {
      name: "bill",
      displayName: "Bill",
      description:
        "View or pay a bill / invoice — the canonical 'pay my bill' task.",
    },
    {
      name: "payment",
      displayName: "Payment",
      description: "Payment methods, checkout, or card management.",
    },
    {
      name: "wallet",
      displayName: "Wallet",
      description: "Balances, stored funds, or spending overview.",
    },
    {
      name: "savings",
      displayName: "Savings",
      description: "Savings goals, deposits, or ways to save money.",
    },
    {
      name: "transfer",
      displayName: "Transfer",
      description: "Move money or switch between accounts/plans.",
    },
    {
      name: "quote",
      displayName: "Quote",
      description: "Get a quote / estimate / rate calculator.",
    },
    {
      name: "cart",
      displayName: "Cart",
      description: "Shopping cart or order-in-progress.",
    },
    {
      name: "shopping-bag",
      displayName: "Shopping Bag",
      description: "Shop / browse products or completed purchases.",
    },
    {
      name: "package",
      displayName: "Package",
      description: "An order, parcel, or bundled product/plan.",
    },
    {
      name: "delivery",
      displayName: "Delivery",
      description: "Shipping, delivery status, or logistics.",
    },

    // Tasks, documents & status
    {
      name: "document",
      displayName: "Document",
      description: "Documents, statements, policies, or forms library.",
    },
    {
      name: "claim",
      displayName: "Claim",
      description: "File or track a claim — the insurance/warranty task.",
    },
    {
      name: "form",
      displayName: "Form",
      description: "Fill in an application or request form.",
    },
    {
      name: "signature",
      displayName: "Signature",
      description: "Sign a document or e-signature flow.",
    },
    {
      name: "check",
      displayName: "Check",
      description: "Confirmation, completed status, or eligibility check.",
    },
    {
      name: "edit",
      displayName: "Edit",
      description: "Update or change details.",
    },
    {
      name: "chart",
      displayName: "Chart",
      description: "Reports, statistics, or account activity graphs.",
    },
    {
      name: "meter",
      displayName: "Meter",
      description: "Usage tracking, meter readings, or consumption dashboards.",
    },
    {
      name: "calendar",
      displayName: "Calendar",
      description: "Schedule, book, or view dates and appointments.",
    },
    {
      name: "clock",
      displayName: "Clock",
      description: "Opening hours, wait times, or history.",
    },
    {
      name: "bell",
      displayName: "Bell",
      description: "Notifications, alerts subscriptions, or reminders.",
    },
    {
      name: "warning",
      displayName: "Warning",
      description: "Warnings, advisories, or service disruptions (non-power).",
    },
    {
      name: "info",
      displayName: "Info",
      description: "General information or about pages.",
    },
    {
      name: "help",
      displayName: "Help",
      description: "Help center, FAQs, or how-to guides.",
    },
    {
      name: "ticket",
      displayName: "Ticket",
      description: "Event/transport tickets or support tickets.",
    },

    // Contact & media
    {
      name: "phone",
      displayName: "Phone",
      description: "Call us / phone contact.",
    },
    {
      name: "chat",
      displayName: "Chat",
      description: "Live chat or messaging support.",
    },
    {
      name: "email",
      displayName: "Email",
      description: "Email contact or inbox.",
    },
    {
      name: "support",
      displayName: "Support",
      description: "Customer support / contact center (agent with headset).",
    },
    {
      name: "megaphone",
      displayName: "Megaphone",
      description: "Announcements, news alerts, or campaigns.",
    },
    {
      name: "video",
      displayName: "Video",
      description: "Video content or video-call appointments.",
    },
    {
      name: "mobile",
      displayName: "Mobile",
      description: "Mobile app download or phone/device services.",
    },
    {
      name: "globe",
      displayName: "Globe",
      description: "Language/region selection or international services.",
    },
    {
      name: "wifi",
      displayName: "Wi-Fi",
      description: "Internet / broadband service or connectivity status.",
    },

    // Navigation & actions
    {
      name: "search",
      displayName: "Search",
      description: "Search or find-anything entry point.",
    },
    {
      name: "download",
      displayName: "Download",
      description: "Download files, statements, or apps.",
    },
    {
      name: "upload",
      displayName: "Upload",
      description: "Upload or submit documents.",
    },
    {
      name: "share",
      displayName: "Share",
      description: "Share content or refer a friend.",
    },
    {
      name: "link",
      displayName: "Link",
      description: "A generic link or connection between things.",
    },
    {
      name: "external-link",
      displayName: "External Link",
      description: "Opens an external site or portal.",
    },
    {
      name: "menu",
      displayName: "Menu",
      description:
        "Menu / hamburger — opens a navigation menu, drawer, or list of options.",
    },
    {
      name: "arrow-right",
      displayName: "Arrow Right",
      description:
        "Generic 'go' / continue affordance when no better metaphor fits.",
    },
    {
      name: "play",
      displayName: "Play",
      description: "Play media or start/launch something.",
    },
    {
      name: "refresh",
      displayName: "Refresh",
      description: "Renew, restart, or resubmit.",
    },
    {
      name: "settings",
      displayName: "Settings",
      description: "Preferences and configuration.",
    },

    // Places
    {
      name: "location",
      displayName: "Location",
      description: "Find a location / branch / store near you (map pin).",
    },
    {
      name: "map",
      displayName: "Map",
      description: "Maps, coverage areas, or outage maps.",
    },
    {
      name: "home",
      displayName: "Home",
      description: "Home page, household, or residential services.",
    },
    {
      name: "building",
      displayName: "Building",
      description: "Offices, facilities, or commercial/business premises.",
    },
    {
      name: "bank",
      displayName: "Bank",
      description: "Bank branch, government office, or civic institution.",
    },
    {
      name: "hospital",
      displayName: "Hospital",
      description: "Hospitals, clinics, or urgent care locations.",
    },
    {
      name: "hotel",
      displayName: "Hotel",
      description: "Hotels, stays, or accommodation booking.",
    },
    {
      name: "dining",
      displayName: "Dining",
      description: "Restaurants, dining, or food services.",
    },

    // Sectors & everyday services
    {
      name: "energy",
      displayName: "Energy",
      description: "Electricity / power services and plans.",
    },
    {
      name: "outage",
      displayName: "Outage",
      description: "Report or check a power outage — power-off bolt.",
    },
    {
      name: "power",
      displayName: "Power",
      description:
        "Start, stop, or move service; turn something on/off — power button.",
    },
    {
      name: "plug",
      displayName: "Plug",
      description: "Connections, hookups, or EV charging.",
    },
    {
      name: "flame",
      displayName: "Flame",
      description: "Gas service or heating.",
    },
    {
      name: "water",
      displayName: "Water",
      description: "Water service or usage.",
    },
    {
      name: "leaf",
      displayName: "Leaf",
      description: "Sustainability, green energy, or eco programs.",
    },
    {
      name: "recycle",
      displayName: "Recycle",
      description: "Recycling, waste collection, or reuse programs.",
    },
    {
      name: "car",
      displayName: "Car",
      description: "Auto insurance, vehicle services, or parking.",
    },
    {
      name: "travel",
      displayName: "Travel",
      description: "Flights, trips, or travel insurance.",
    },
    {
      name: "bus",
      displayName: "Bus",
      description: "Public transport or transit services.",
    },
    {
      name: "health",
      displayName: "Health",
      description: "Health services or wellness programs (heart pulse).",
    },
    {
      name: "heart",
      displayName: "Heart",
      description:
        "Care, giving, favorites, or assistance programs (financial help, donations) — plain heart.",
    },
    {
      name: "pharmacy",
      displayName: "Pharmacy",
      description: "Prescriptions, medication, or pharmacy services.",
    },
    {
      name: "doctor",
      displayName: "Doctor",
      description: "Find a doctor / provider, or medical appointments.",
    },
    {
      name: "insurance",
      displayName: "Insurance",
      description: "Coverage and protection plans (umbrella).",
    },
    {
      name: "business",
      displayName: "Business",
      description: "Business/commercial customers or careers.",
    },
    {
      name: "education",
      displayName: "Education",
      description: "Courses, training, or student services.",
    },
    {
      name: "legal",
      displayName: "Legal",
      description: "Legal, regulatory, or terms information (scales).",
    },
    {
      name: "repair",
      displayName: "Repair",
      description: "Repairs, maintenance, or installation services.",
    },
    {
      name: "accessibility",
      displayName: "Accessibility",
      description: "Accessibility services and accommodations.",
    },
  ],
} satisfies EnumerationRecipe;

export default iconNameEnumRecipe;
