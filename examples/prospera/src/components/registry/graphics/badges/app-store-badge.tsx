import { cn } from "@/lib/registry/cn";

/**
 * App-store download badges — self-contained App Store / Google Play
 * badge shapes (inline SVG glyph + stacked text, no external assets),
 * plus the URL-host resolver consumers use to decide when a plain
 * link should upgrade to a badge.
 *
 * Consumers pair the two: resolve a link's host with
 * `getAppBadgeKind`, and when it names a store, render
 * `AppBadgeShape` inside the consumer's own anchor instead of a text
 * row — the treatment app-download links (a trailing "Get the app"
 * column in a generated footer, say) expect. Unknown hosts resolve to
 * `undefined` so callers keep their text-link fallback — never a
 * broken badge.
 *
 * Colors intentionally use the page-level `theme-black`/`theme-white`
 * literals (same policy as the transparent-overlay header): store
 * badges are black-on-white marks in the wild, in light and dark
 * themes alike.
 */

export type AppBadgeKind = "app-store" | "google-play";

const APP_STORE_HOSTS = new Set([
  "apps.apple.com",
  "itunes.apple.com",
  "appstore.com",
  "apps.applestore.com",
]);

const GOOGLE_PLAY_HOSTS = new Set(["play.google.com", "market.android.com"]);

/**
 * Resolve which store badge a link URL represents. Strips a leading
 * `www.`; relative and unparseable URLs resolve to `undefined` (text
 * link fallback). Same host-matching policy as `resolveSocialIcon`.
 */
export function getAppBadgeKind(
  href: string | undefined,
): AppBadgeKind | undefined {
  if (!href) return undefined;
  let host: string;
  try {
    host = new URL(href, "https://placeholder.invalid").hostname.toLowerCase();
  } catch {
    return undefined;
  }
  if (host.startsWith("www.")) host = host.slice(4);
  if (APP_STORE_HOSTS.has(host)) return "app-store";
  if (GOOGLE_PLAY_HOSTS.has(host)) return "google-play";
  return undefined;
}

/** Apple mark (Simple Icons path, CC0), rendered with currentColor. */
function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.03 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

/** Google Play mark (Simple Icons path, CC0), rendered with currentColor. */
function GooglePlayGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
    </svg>
  );
}

const BADGE_COPY: Record<AppBadgeKind, { eyebrow: string; store: string }> = {
  "app-store": { eyebrow: "Download on the", store: "App Store" },
  "google-play": { eyebrow: "Get it on", store: "Google Play" },
};

/**
 * The badge shape itself — a dark rounded plate with the store glyph
 * and the two-line "Download on the / App Store" text stack. Purely
 * visual: wrap it in the consumer's own anchor/Link (which should
 * carry the accessible name, e.g. via `aria-label`).
 */
export function AppBadgeShape({
  kind,
  className,
}: {
  kind: AppBadgeKind;
  className?: string;
}) {
  const copy = BADGE_COPY[kind];
  const Glyph = kind === "app-store" ? AppleGlyph : GooglePlayGlyph;
  return (
    <span
      data-slot="app-badge"
      data-badge={kind}
      className={cn(
        "inline-flex h-10 items-center gap-2.5 rounded-md border border-theme-white/25 bg-theme-black px-3 text-theme-white transition-opacity hover:opacity-85",
        className,
      )}
    >
      <Glyph className="size-5 shrink-0" />
      <span className="flex min-w-0 flex-col justify-center">
        <span className="text-[0.55rem] uppercase leading-tight tracking-wide opacity-80">
          {copy.eyebrow}
        </span>
        <span className="whitespace-nowrap font-semibold text-sm leading-tight">
          {copy.store}
        </span>
      </span>
    </span>
  );
}
