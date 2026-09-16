"use client";

import { useCallback, useMemo, useState } from "react";

import { CardNavigate } from "@/components/registry/blocks/card-navigate";
import type {
  ItemCardColorBand,
  ItemCardMediaBleed,
  ItemCardProps,
} from "@/components/registry/blocks/item-card";
import { ItemCard as Card } from "@/components/registry/blocks/item-card";
import { Button } from "@/components/registry/components/ui/cta-button";
import { CopyableToken } from "@/components/registry/primitives/core/copyable-token";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

export type OfferCardAction = "auto" | "link" | "copy" | "none";

export type OfferCardVariant = "simple" | "complex" | "deal";

export interface OfferCardProps extends CmsProps {
  text: TextSource;
  /** Optional className applied to the offer sentence wrapper. */
  textClassName?: string;
  href?: string;
  token?: string;
  /** Controls whether the whole card links, copies, or is static. Defaults to "auto". */
  action?: OfferCardAction;
  // Chrome axes — pass-through to the shared ItemCard shell. Defaults to
  // the "filled" look (elevation none / style filled / padding md).
  elevation?: ItemCardProps["elevation"];
  padding?: ItemCardProps["padding"];
  style?: ItemCardProps["style"];
  cardColorScheme?: ItemCardProps["colorScheme"];
  colorBand?: ItemCardColorBand;
  mediaBleed?: ItemCardMediaBleed;
  /**
   * Direct-caller className override; composes with CmsProps `styles`.
   */
  className?: string;
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fall through to the document.execCommand path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function normalizeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  const trimmed = href.trim();
  if (!trimmed || trimmed === "#") return undefined;
  return trimmed;
}

function resolveAction({
  action,
  href,
  token,
}: Pick<OfferCardProps, "action" | "href" | "token">): Exclude<
  OfferCardAction,
  "auto"
> {
  if (action && action !== "auto") return action;
  if (token?.trim()) return "copy";
  if (href) return "link";
  return "none";
}

function CardShell({
  className,
  children,
  id,
  chrome,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
  chrome?: {
    elevation?: ItemCardProps["elevation"];
    padding?: ItemCardProps["padding"];
    style?: ItemCardProps["style"];
    cardColorScheme?: ItemCardProps["colorScheme"];
    colorBand?: ItemCardColorBand;
    mediaBleed?: ItemCardMediaBleed;
  };
}) {
  return (
    <Card
      id={id}
      elevation={chrome?.elevation ?? "none"}
      padding={chrome?.padding ?? "md"}
      style={chrome?.style ?? "filled"}
      colorScheme={chrome?.cardColorScheme}
      colorBand={chrome?.colorBand}
      mediaBleed={chrome?.mediaBleed}
      // No radius class: the Card primitive's `--card-radius` token
      // must drive corner rounding so scanned themes apply.
      className={cn("w-full min-w-0 text-foreground", className)}
    >
      {children}
    </Card>
  );
}

function pickChrome(
  props: OfferCardProps,
): NonNullable<Parameters<typeof CardShell>[0]["chrome"]> {
  return {
    elevation: props.elevation,
    padding: props.padding,
    style: props.style,
    cardColorScheme: props.cardColorScheme,
    colorBand: props.colorBand,
    mediaBleed: props.mediaBleed,
  };
}

function OfferCardInner({
  text,
  textClassName,
  token,
  variant,
}: {
  text: TextSource;
  textClassName?: string;
  token?: string;
  variant: OfferCardVariant;
}) {
  if (variant === "deal") {
    return (
      <div className="flex min-h-44 min-w-0 flex-col justify-between gap-3 text-start">
        <div className="min-w-0">
          <span className="inline-flex rounded bg-destructive px-2 py-1 font-semibold text-background text-xs uppercase tracking-wide">
            Deal
          </span>
          <div
            className={cn(
              "wrap-break-word mt-2 min-w-0 text-pretty font-heading font-semibold text-base leading-snug",
              textClassName,
            )}
          >
            <Text value={text} />
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-3">
          {token ? <CopyableToken token={token} /> : <span />}
          <span className="inline-flex items-center rounded-md bg-foreground px-3 py-2 font-medium text-background text-sm">
            Learn more
          </span>
        </div>
      </div>
    );
  }

  if (variant === "simple") {
    return (
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div
          className={cn(
            "wrap-break-word min-w-0 text-balance text-start text-foreground text-sm",
            textClassName,
          )}
        >
          <Text value={text} />
        </div>
        {token ? <CopyableToken token={token} /> : null}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center justify-between gap-4 text-start">
      <div className="min-w-0">
        <div className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Limited time offer
        </div>
        <div
          className={cn(
            "wrap-break-word min-w-0 text-pretty font-heading font-semibold text-base leading-snug md:text-lg",
            textClassName,
          )}
        >
          <Text value={text} />
        </div>
      </div>

      <div className="shrink-0">
        {token ? (
          <CopyableToken token={token} />
        ) : (
          <span className="text-muted-foreground text-xs transition-colors group-hover:text-foreground">
            View →
          </span>
        )}
      </div>
    </div>
  );
}

export function OfferCard({
  text,
  textClassName,
  href: hrefProp,
  token: tokenProp,
  action: actionProp = "auto",
  className,
  variant = "simple",
  isEditing,
  ...rest
}: OfferCardProps & { variant?: OfferCardVariant }) {
  const chrome = pickChrome(rest as OfferCardProps);
  const id = rest.id;
  const href = useMemo(() => normalizeHref(hrefProp), [hrefProp]);
  const token = useMemo(() => tokenProp?.trim() || undefined, [tokenProp]);
  const action = useMemo(
    () => resolveAction({ action: actionProp, href, token }),
    [actionProp, href, token],
  );

  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    if (!token) return;
    const ok = await copyToClipboard(token);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }, [token]);

  if (action === "link" && href) {
    return (
      <CardNavigate
        link={{ href }}
        isEditing={isEditing}
        className="block w-full"
      >
        <CardShell className={className} id={id} chrome={chrome}>
          <OfferCardInner
            text={text}
            textClassName={textClassName}
            token={token}
            variant={variant}
          />
        </CardShell>
      </CardNavigate>
    );
  }

  if (action === "copy" && token) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={handleCopy}
        className="h-auto w-full justify-start p-0 text-start hover:bg-transparent"
        aria-label="Copy discount token"
        data-copied={copied ? "true" : "false"}
      >
        <CardShell className={className} id={id} chrome={chrome}>
          <OfferCardInner
            text={text}
            textClassName={textClassName}
            token={token}
            variant={variant}
          />
        </CardShell>
      </Button>
    );
  }

  return (
    <div className="w-full">
      <CardShell className={className} id={id} chrome={chrome}>
        <OfferCardInner
          text={text}
          textClassName={textClassName}
          token={token}
          variant={variant}
        />
      </CardShell>
    </div>
  );
}

export function Simple(props: OfferCardProps) {
  return <OfferCard {...props} variant="simple" />;
}

export function Complex(props: OfferCardProps) {
  return <OfferCard {...props} variant="complex" />;
}

export function Deal(props: OfferCardProps) {
  return <OfferCard {...props} variant="deal" />;
}

export default OfferCard;

export const componentType = "universal";
