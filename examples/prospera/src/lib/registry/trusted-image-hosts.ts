/**
 * Allowlist of image hosts this app routes through Next's image optimizer
 * (`/_next/image`). It is the SINGLE SOURCE OF TRUTH for two places that
 * must agree:
 *
 *   - `next.config.ts` derives `images.remotePatterns` from it, so the
 *     optimizer can only ever be aimed at these hosts — closing the
 *     open-proxy / denial-of-wallet hole the old `hostname: "**"` left open.
 *   - `<NextImage>` calls `isTrustedImageHost(src)` to decide PER IMAGE:
 *     a trusted (or same-origin) src is optimized; anything else renders
 *     UNOPTIMIZED (bare `<img>`, browser-direct, no proxy).
 *
 * That second half is what lets us drop the wildcard while still rendering
 * brands' OWN image URLs during page recreation — those hosts are dynamic
 * and unknowable per brand, so they fall through to unoptimized instead of
 * 404ing the optimizer. Add a host here ONLY when we control/trust it and
 * want its images optimized; arbitrary third-party URLs stay off the list.
 *
 * Keep this a dependency-free leaf — `next.config.ts` imports it at build.
 */
export const TRUSTED_IMAGE_HOSTS = [
  // Vercel Blob. Kept because brand assets can be uploaded here and resolve
  // as *runtime* URLs, which no grep can rule out — so this entry cannot be
  // retired by static inspection alone. It is NOT needed for `ai-persona`:
  // that component fetches `.riv` binaries, which are not images and never
  // passed through `remotePatterns` or the per-image check. (The old comment
  // here claimed "persona avatars", which was misleading on both counts —
  // corrected while resolving #380.)
  "*.public.blob.vercel-storage.com",
  "*.sitecorecloud.io", // Sitecore Edge media + platform
  "picsum.photos", // demo / preview content — the only photo placeholder host
] as const;

/**
 * Match a hostname against one allowlist entry. A leading `*.` matches
 * exactly one subdomain label — mirroring Next's `remotePatterns` `*`
 * semantics so the build-time allowlist and the runtime check agree.
 */
const matchesHostPattern = (host: string, pattern: string): boolean => {
  if (pattern.startsWith("*.")) {
    const suffix = pattern.slice(1); // ".sitecorecloud.io"
    if (!host.endsWith(suffix)) return false;
    const label = host.slice(0, host.length - suffix.length);
    return label.length > 0 && !label.includes(".");
  }
  return host === pattern;
};

/**
 * True when `src` should go through Next's image optimizer:
 *   - relative / same-origin URLs (our own `/api/themes/asset` proxy, etc.)
 *   - https hosts on {@link TRUSTED_IMAGE_HOSTS}
 *
 * Everything else — unknown brand hosts, `data:` / `blob:` sources, or an
 * unparseable value — returns false, so `<NextImage>` renders it unoptimized.
 */
export const isTrustedImageHost = (src: string | undefined | null): boolean => {
  if (!src) return false;
  if (src.startsWith("/")) return true; // relative → same-origin
  if (src.startsWith("data:") || src.startsWith("blob:")) return false;
  let host: string;
  try {
    host = new URL(src).hostname;
  } catch {
    return false;
  }
  return TRUSTED_IMAGE_HOSTS.some((pattern) =>
    matchesHostPattern(host, pattern),
  );
};
