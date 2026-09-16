"use client";
import {
  IconActivity as TablerActivity,
  IconAlertCircle as TablerAlert,
  IconArchive as TablerArchive,
  IconArrowDown as TablerArrowDown,
  IconArrowLeft as TablerArrowLeft,
  IconArrowRight as TablerArrowRight,
  IconArrowUp as TablerArrowUp,
  IconBell as TablerBell,
  IconBookmark as TablerBookmark,
  IconCalendar as TablerCalendar,
  IconCamera as TablerCamera,
  IconChartBar as TablerChartBar,
  IconChartPie as TablerChartPie,
  IconCheck as TablerCheck,
  IconChevronDown as TablerChevronDown,
  IconChevronLeft as TablerChevronLeft,
  IconChevronRight as TablerChevronRight,
  IconCaretUpDown as TablerChevronsUpDown,
  IconChevronUp as TablerChevronUp,
  IconClipboard as TablerClipboard,
  IconClock as TablerClock,
  IconCloud as TablerCloud,
  IconCreditCard as TablerCreditCard,
  IconDownload as TablerDownload,
  IconEdit as TablerEdit,
  IconEye as TablerEye,
  IconEyeOff as TablerEyeOff,
  IconFile as TablerFile,
  IconFilter as TablerFilter,
  IconFlag as TablerFlag,
  IconFolder as TablerFolder,
  IconGift as TablerGift,
  IconGlobe as TablerGlobe,
  IconLayoutGrid as TablerGrid,
  IconHeart as TablerHeart,
  IconHelpCircle as TablerHelp,
  IconHome as TablerHome,
  IconPhoto as TablerImage,
  IconInfoCircle as TablerInfo,
  IconKey as TablerKey,
  IconLink as TablerLink,
  IconList as TablerList,
  IconLock as TablerLock,
  IconMail as TablerMail,
  IconMap as TablerMap,
  IconMapPin as TablerMapPin,
  IconMenu2 as TablerMenu,
  IconMinus as TablerMinus,
  IconMoon as TablerMoon,
  IconPackage as TablerPackage,
  IconPlayerPause as TablerPause,
  IconPhone as TablerPhone,
  IconPlayerPlay as TablerPlay,
  IconPlus as TablerPlus,
  IconRefresh as TablerRefresh,
  IconRocket as TablerRocket,
  IconDeviceFloppy as TablerSave,
  IconSearch as TablerSearch,
  IconSettings as TablerSettings,
  IconShare as TablerShare,
  IconShieldCheck as TablerShield,
  IconShoppingBag as TablerShoppingBag,
  IconShoppingCart as TablerShoppingCart,
  IconStar as TablerStar,
  IconPlayerStop as TablerStop,
  IconSun as TablerSun,
  IconTag as TablerTag,
  IconThumbDown as TablerThumbsDown,
  IconThumbUp as TablerThumbsUp,
  IconTrash as TablerTrash,
  IconLockOpen as TablerUnlock,
  IconUpload as TablerUpload,
  IconUser as TablerUser,
  IconUserMinus as TablerUserMinus,
  IconUserPlus as TablerUserPlus,
  IconUsers as TablerUsers,
  IconVideo as TablerVideo,
  IconAlertTriangle as TablerWarning,
  IconX as TablerX,
} from "@tabler/icons-react";
import * as React from "react";

type IconSetId =
  | "lucide"
  | "heroicons"
  | "tabler"
  | "phosphor"
  | "mui"
  | "fontawesome";
type IconStyle = "outline" | "solid";
type LibraryIconComponent = React.ComponentType<{
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  "aria-label"?: string;
  "aria-hidden"?: React.AriaAttributes["aria-hidden"];
  "aria-busy"?: boolean;
}>;
// Constant the slicer rewrites per variant. Determines which set the
// component falls back to when the active set has no entry for an icon.
const FALLBACK_SET: IconSetId = "tabler";
const iconSets: Partial<
  Record<IconSetId, Record<string, LibraryIconComponent>>
> = {
  tabler: {
    activity: TablerActivity,
    x: TablerX,
    "arrow-left": TablerArrowLeft,
    "arrow-right": TablerArrowRight,
    "arrow-up": TablerArrowUp,
    "arrow-down": TablerArrowDown,
    bookmark: TablerBookmark,
    "calendar-days": TablerCalendar,
    camera: TablerCamera,
    "chart-bar": TablerChartBar,
    "chart-pie": TablerChartPie,
    "chevron-left": TablerChevronLeft,
    "chevron-right": TablerChevronRight,
    "chevron-up": TablerChevronUp,
    "chevron-down": TablerChevronDown,
    "chevrons-up-down": TablerChevronsUpDown,
    clipboard: TablerClipboard,
    cloud: TablerCloud,
    home: TablerHome,
    "credit-card": TablerCreditCard,
    search: TablerSearch,
    user: TablerUser,
    users: TablerUsers,
    "user-plus": TablerUserPlus,
    "user-minus": TablerUserMinus,
    settings: TablerSettings,
    bell: TablerBell,
    mail: TablerMail,
    calendar: TablerCalendar,
    clock: TablerClock,
    check: TablerCheck,
    plus: TablerPlus,
    minus: TablerMinus,
    menu: TablerMenu,
    map: TablerMap,
    info: TablerInfo,
    help: TablerHelp,
    alert: TablerAlert,
    warning: TablerWarning,
    star: TablerStar,
    heart: TablerHeart,
    lock: TablerLock,
    unlock: TablerUnlock,
    eye: TablerEye,
    "eye-off": TablerEyeOff,
    trash: TablerTrash,
    edit: TablerEdit,
    download: TablerDownload,
    upload: TablerUpload,
    share: TablerShare,
    link: TablerLink,
    filter: TablerFilter,
    folder: TablerFolder,
    file: TablerFile,
    flag: TablerFlag,
    gift: TablerGift,
    globe: TablerGlobe,
    grid: TablerGrid,
    image: TablerImage,
    archive: TablerArchive,
    key: TablerKey,
    list: TablerList,
    moon: TablerMoon,
    "map-pin": TablerMapPin,
    package: TablerPackage,
    pause: TablerPause,
    phone: TablerPhone,
    play: TablerPlay,
    refresh: TablerRefresh,
    rocket: TablerRocket,
    save: TablerSave,
    shield: TablerShield,
    "shopping-cart": TablerShoppingCart,
    "shopping-bag": TablerShoppingBag,
    stop: TablerStop,
    sun: TablerSun,
    tag: TablerTag,
    "thumbs-down": TablerThumbsDown,
    "thumbs-up": TablerThumbsUp,
    video: TablerVideo,
  },
};
const iconSetsSolid: Partial<
  Record<IconSetId, Record<string, LibraryIconComponent>>
> = {};
const IconSetContext = React.createContext<IconSetId>(FALLBACK_SET);
const IconStyleContext = React.createContext<IconStyle>("outline");
type IconSetProviderProps = {
  value: IconSetId;
  children: React.ReactNode;
};
type IconStyleProviderProps = {
  value: IconStyle;
  children: React.ReactNode;
};
type LibraryIconProps = {
  name: string;
  set?: IconSetId;
  variant?: IconStyle;
  size?: number;
  className?: string;
  title?: string;
  "aria-label"?: string;
  "aria-hidden"?: React.AriaAttributes["aria-hidden"];
  "aria-busy"?: boolean;
};
function IconSetProvider({ value, children }: IconSetProviderProps) {
  return (
    <IconSetContext.Provider value={value}>{children}</IconSetContext.Provider>
  );
}
function IconStyleProvider({ value, children }: IconStyleProviderProps) {
  return (
    <IconStyleContext.Provider value={value}>
      {children}
    </IconStyleContext.Provider>
  );
}
function LibraryIcon({
  name,
  set,
  variant,
  size,
  className,
  title,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
  "aria-busy": ariaBusy,
}: LibraryIconProps) {
  const contextSet = React.useContext(IconSetContext);
  const contextVariant = React.useContext(IconStyleContext);
  const fallbackSet = iconSets[FALLBACK_SET];
  const activeSet = set ?? contextSet;
  const activeVariant = variant ?? contextVariant;
  const baseIcons = iconSets[activeSet] ?? fallbackSet;
  const solidIcons = iconSetsSolid[activeSet];
  const activeIcons =
    activeVariant === "solid" ? (solidIcons ?? baseIcons) : baseIcons;
  const IconComponent =
    activeIcons?.[name] ?? baseIcons?.[name] ?? fallbackSet?.[name];
  if (!IconComponent) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `LibraryIcon: missing icon "${name}" in set "${activeSet}".`,
      );
    }
    return null;
  }
  const label = ariaLabel ?? title;
  const style = size ? { width: size, height: size } : undefined;
  const resolvedAriaHidden = ariaHidden ?? (label ? undefined : true);
  return (
    <IconComponent
      className={className}
      style={style}
      title={title}
      aria-label={label}
      aria-hidden={resolvedAriaHidden}
      aria-busy={ariaBusy}
    />
  );
}

export { IconSetProvider, IconStyleProvider, LibraryIcon };
