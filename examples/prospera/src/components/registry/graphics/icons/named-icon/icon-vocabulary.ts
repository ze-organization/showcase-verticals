import {
  Accessibility,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Bed,
  Bell,
  Briefcase,
  Building2,
  Bus,
  Calculator,
  Calendar,
  Car,
  Check,
  CircleHelp,
  CircleUser,
  ClipboardCheck,
  ClipboardList,
  Clock,
  CreditCard,
  Download,
  Droplet,
  ExternalLink,
  FileSignature,
  FileText,
  Flame,
  Gauge,
  Globe,
  GraduationCap,
  Headset,
  Heart,
  HeartPulse,
  Home,
  Hospital,
  IdCard,
  Info,
  Key,
  Landmark,
  Leaf,
  Link,
  Lock,
  LogIn,
  LogOut,
  type LucideIcon,
  Mail,
  Map as MapIcon,
  MapPin,
  Megaphone,
  Menu,
  MessageCircle,
  Package,
  Pencil,
  Phone,
  PiggyBank,
  Pill,
  Plane,
  Play,
  Plug,
  Power,
  ReceiptText,
  Recycle,
  RefreshCw,
  Scale,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Stethoscope,
  Ticket,
  TriangleAlert,
  Truck,
  Umbrella,
  Upload,
  User,
  Users,
  Utensils,
  Video,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  ZapOff,
} from "lucide-react";

/**
 * Curated named-icon vocabulary — the single source of truth mapping
 * semantic, kebab-case icon names to lucide-react components.
 *
 * Purpose: AI-composed components (quick-links-tiles first) bind crisp
 * vector icons by NAME instead of scraped image URLs. Names are
 * task/utility-oriented and domain-neutral so the same vocabulary works
 * across utility, insurance, banking, government, travel, and retail
 * sites.
 *
 * The authoring surface is the `icon-name@1` EnumerationRecipe
 * ([src/content/registry/enums/icon-name.recipe.ts]) — a Droplink with
 * one value per name here, each carrying a per-value description the
 * composer and Content Editor read. A unit test
 * (tests/registry/unit/graphics/named-icon.test.tsx) keeps the two
 * catalogs in exact sync — add/rename names in BOTH files.
 *
 * Related but distinct: `LibraryIcon`
 * (src/components/registry/primitives/core/library-icon.tsx) is the
 * theme-swappable icon primitive whose catalog must exist in all six
 * icon sets (heroicons/tabler/…), which caps how task-specific its keys
 * can get. This vocabulary is intentionally lucide-only so it can carry
 * task-portal names (bill, outage, claim, quote…) without fanning out
 * to every set. Where names overlap (arrow-right, search, phone,
 * calendar…) they mean the same glyph, keeping a future unification
 * mechanical.
 */
export const ICON_VOCABULARY: Record<string, LucideIcon> = {
  // Accounts, identity & access
  account: CircleUser,
  user: User,
  users: Users,
  "sign-in": LogIn,
  "sign-out": LogOut,
  lock: Lock,
  key: Key,
  shield: ShieldCheck,
  "id-card": IdCard,

  // Money, billing & commerce
  bill: ReceiptText,
  payment: CreditCard,
  wallet: Wallet,
  savings: PiggyBank,
  transfer: ArrowLeftRight,
  quote: Calculator,
  cart: ShoppingCart,
  "shopping-bag": ShoppingBag,
  package: Package,
  delivery: Truck,

  // Tasks, documents & status
  document: FileText,
  claim: ClipboardCheck,
  form: ClipboardList,
  signature: FileSignature,
  check: Check,
  edit: Pencil,
  chart: BarChart3,
  meter: Gauge,
  calendar: Calendar,
  clock: Clock,
  bell: Bell,
  warning: TriangleAlert,
  info: Info,
  help: CircleHelp,
  ticket: Ticket,

  // Contact & media
  phone: Phone,
  chat: MessageCircle,
  email: Mail,
  support: Headset,
  megaphone: Megaphone,
  video: Video,
  mobile: Smartphone,
  globe: Globe,
  wifi: Wifi,

  // Navigation & actions
  search: Search,
  download: Download,
  upload: Upload,
  share: Share2,
  link: Link,
  "external-link": ExternalLink,
  menu: Menu,
  "arrow-right": ArrowRight,
  play: Play,
  refresh: RefreshCw,
  settings: Settings,

  // Places
  location: MapPin,
  map: MapIcon,
  home: Home,
  building: Building2,
  bank: Landmark,
  hospital: Hospital,
  hotel: Bed,
  dining: Utensils,

  // Sectors & everyday services
  energy: Zap,
  outage: ZapOff,
  power: Power,
  plug: Plug,
  flame: Flame,
  water: Droplet,
  leaf: Leaf,
  recycle: Recycle,
  car: Car,
  travel: Plane,
  bus: Bus,
  health: HeartPulse,
  heart: Heart,
  pharmacy: Pill,
  doctor: Stethoscope,
  insurance: Umbrella,
  business: Briefcase,
  education: GraduationCap,
  legal: Scale,
  repair: Wrench,
  accessibility: Accessibility,
};

/** Every valid icon name, sorted — the vocabulary's canonical list. */
export const ICON_NAMES: readonly string[] = Object.freeze(
  Object.keys(ICON_VOCABULARY).sort((a, b) => a.localeCompare(b)),
);

/** A valid name in the named-icon vocabulary. */
export type IconName = keyof typeof ICON_VOCABULARY;

/**
 * Look up an icon component by vocabulary name. Tolerant of surrounding
 * whitespace and casing (Sitecore droplinks and hand-typed content both
 * flow through here); returns `null` for unknown or empty names so
 * callers can fall back gracefully instead of crashing.
 */
export function iconByName(name: string | undefined | null): LucideIcon | null {
  const key = name?.trim().toLowerCase();
  if (!key) return null;
  return ICON_VOCABULARY[key] ?? null;
}
