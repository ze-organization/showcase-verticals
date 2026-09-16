"use client";

import Head from "next/head";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  DetailsShell,
  DetailsTitle,
} from "@/components/registry/components/page-details/_details-shell";
import { SocialShare } from "@/components/registry/components/social/social-share";
import { NextImage as Image } from "@/components/registry/primitives/editables/image";
import { RichText } from "@/components/registry/primitives/editables/richtext";
import { Text } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { DETAILS_SHARE_PLATFORMS } from "@/lib/registry/details-share";
import {
  detailsHideShare,
  detailsMediaBoxClass,
  detailsMediaFitClass,
  detailsProseClass,
  detailsShowSeparator,
  detailsTextAlignClass,
  parseDetailsImagePosition,
  parseDetailsTocPlacement,
  type DetailsShellParams,
} from "@/lib/registry/details-shell";
import {
  type Field,
  type ImageField,
  type Page,
  Placeholder,
  type RichTextField,
  useSitecore,
} from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";
import { sitecorePassthrough } from "@/lib/registry/with-sitecore";

interface Fields {
  Title: Field<string>;
  ShortDescription: Field<string>;
  Content: RichTextField;
  Image: ImageField;
}

interface ArticleWithTocDetailsProps extends Omit<ComponentProps, "params"> {
  fields?: Partial<Fields>;
  params?: ComponentProps["params"] & DetailsShellParams;
  /**
   * Injected by the SDK placeholder when this export is a passthrough.
   * `withSitecore` drops `page`; empty-datasource article details has
   * to read Title / Image / body from the current route instead.
   */
  page?: Page;
}

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Layout Service ships the partial's rendering with `dataSource: ""`
 * and no field bag. Page content lives on `route.fields`. Prefer a real
 * datasource when one is assigned; otherwise use the current page.
 */
function resolveFields(
  renderingFields: Partial<Fields> | undefined,
  routeFields: Record<string, unknown> | undefined,
): Partial<Fields> {
  const route = (routeFields ?? {}) as Partial<Fields>;
  return {
    Title: pickText(renderingFields?.Title, route.Title),
    ShortDescription: pickText(
      renderingFields?.ShortDescription,
      route.ShortDescription,
    ),
    Content: pickText(renderingFields?.Content, route.Content),
    Image: pickImage(renderingFields?.Image, route.Image),
  };
}

function unwrapField<T extends { value?: unknown }>(raw: unknown): T | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as { jsonValue?: unknown; value?: unknown };
  if (obj.jsonValue && typeof obj.jsonValue === "object") {
    return obj.jsonValue as T;
  }
  return raw as T;
}

function pickText<T extends { value?: unknown }>(
  preferred: T | undefined,
  fallback: T | undefined,
): T | undefined {
  const first = unwrapField<T>(preferred);
  const next = unwrapField<T>(fallback);
  const value = first?.value;
  if (typeof value === "string" && value.trim().length > 0) return first;
  return next ?? first;
}

function pickImage(
  preferred: ImageField | undefined,
  fallback: ImageField | undefined,
): ImageField | undefined {
  const first = unwrapField<ImageField>(preferred);
  const next = unwrapField<ImageField>(fallback);
  const src =
    first?.value && typeof first.value === "object" ? first.value.src : undefined;
  if (src) return first;
  return next ?? first;
}

function articlePlaceholderName(
  rendering: ComponentProps["rendering"] | undefined,
  prefix: string,
  dynamicPlaceholderId?: string,
): string {
  const id = dynamicPlaceholderId ?? "1";
  const placeholders = (
    rendering as { placeholders?: Record<string, unknown> } | undefined
  )?.placeholders;
  const keys = placeholders ? Object.keys(placeholders) : [];
  const sxa = keys.find((key) => key.startsWith(`${prefix}-*-`));
  if (sxa) return sxa;
  if (keys.includes(`${prefix}-${id}`)) return `${prefix}-${id}`;
  if (keys.includes(`${prefix}-{*}`)) return `${prefix}-{*}`;
  return `${prefix}-*-0-${id}`;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

/**
 * Collect h2 / h3 from the Content HTML (document order) and stamp
 * stable ids plus scroll-margin so TOC buttons can scroll without a
 * URL hash.
 */
function stampHeadingIds(html: string): { html: string; items: TocItem[] } {
  if (!html) return { html: "", items: [] };
  const used = new Map<string, number>();
  const items: TocItem[] = [];
  const stamped = html.replace(
    /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (full, levelStr: string, attrs: string | undefined, inner: string) => {
      const level = Number(levelStr) as 2 | 3;
      const text = stripTags(inner);
      if (!text) return full;
      const attrStr = attrs ?? "";
      const existingId = /\sid=["']([^"']+)["']/i.exec(attrStr)?.[1];
      let id = existingId || slugify(text);
      const count = used.get(id) ?? 0;
      used.set(id, count + 1);
      if (count > 0) {
        id = `${id}-${count + 1}`;
        used.set(id, (used.get(id) ?? 0) + 1);
      }
      items.push({ id, text, level });
      let nextAttrs = attrStr.replace(/\s+id=["'][^"']*["']/i, "");
      if (/\sclass=["']/i.test(nextAttrs)) {
        nextAttrs = nextAttrs.replace(
          /class=["']([^"']*)["']/i,
          (_m: string, cls: string) => `class="${cls} scroll-mt-24"`,
        );
      } else {
        nextAttrs += ' class="scroll-mt-24"';
      }
      return `<h${level}${nextAttrs} id="${id}">${inner}</h${level}>`;
    },
  );
  return { html: stamped, items };
}

function ArticleWithTocDetails({
  params,
  fields,
  rendering,
  page: pageFromSdk,
}: ArticleWithTocDetailsProps) {
  const { page: pageFromHook } = useSitecore();
  const page = pageFromSdk ?? pageFromHook;
  const routeFields = page?.layout?.sitecore?.route?.fields as
    | Record<string, unknown>
    | undefined;
  const resolved = resolveFields(fields, routeFields);
  const [currentUrl, setCurrentUrl] = useState("");
  const [activeId, setActiveId] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const id = params?.RenderingIdentifier;
  const inColumnKey = articlePlaceholderName(
    rendering,
    "article-with-toc-details",
    params?.DynamicPlaceholderId,
  );
  const fullWidthKey = articlePlaceholderName(
    rendering,
    "article-with-toc-details-full-width",
    params?.DynamicPlaceholderId,
  );
  const isPageEditing = page?.mode?.isEditing ?? false;
  const hideShareWidget = detailsHideShare(params);
  const imagePosition = parseDetailsImagePosition(params?.ImagePosition);
  const tocPlacement = parseDetailsTocPlacement(params?.TocPlacement);
  const showSeparator = detailsShowSeparator(params);
  const contentHtml =
    typeof resolved.Content?.value === "string" ? resolved.Content.value : "";
  const stamped = useMemo(() => stampHeadingIds(contentHtml), [contentHtml]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const here = window.location.href;
    const path = new URL(here).pathname;
    if (/^\/(api|_next)\b/.test(path)) {
      setCurrentUrl("");
      return;
    }
    setCurrentUrl(here);
  }, []);

  useLayoutEffect(() => {
    const root = bodyRef.current;
    if (!root || stamped.items.length === 0) return;
    const headings = [...root.querySelectorAll("h2, h3")];
    headings.forEach((el, index) => {
      const item = stamped.items[index];
      if (!item) return;
      el.id = item.id;
      el.classList.add("scroll-mt-24");
    });
  }, [stamped.items, stamped.html, isPageEditing]);

  useEffect(() => {
    if (stamped.items.length === 0) return;
    const headings = stamped.items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el != null);
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const next = visible[0]?.target.id;
        if (next) setActiveId(next);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [stamped.items]);

  const scrollToHeading = (headingId: string) => {
    const el = document.getElementById(headingId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(headingId);
  };

  const showToc = stamped.items.length > 0 && tocPlacement !== "hidden";
  const tocNav = (
    <nav
      aria-label="On this page"
      className="@[768px]:sticky @[768px]:top-24 @[768px]:self-start"
    >
      <p className="mb-3 font-heading font-semibold text-sm">On this page</p>
      <ul className="flex flex-col gap-2">
        {stamped.items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}>
            <button
              type="button"
              className={cn(
                "text-left text-sm leading-snug transition-colors",
                activeId === item.id
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => scrollToHeading(item.id)}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
  const body = (
    <div ref={bodyRef}>
      <RichText
        data-slot="rich-text"
        className={cn(
          showToc ? "" : "@[768px]:mt-10 mt-6",
          detailsProseClass(params),
        )}
        value={isPageEditing ? resolved.Content : stamped.html || resolved.Content}
        isEditing={isPageEditing}
        placeholder="Content"
      />
    </div>
  );

  return (
    <>
      <Head>
        <meta property="og:url" content={currentUrl} />
        <meta property="og:name" content={resolved.Title?.value} />
        <meta property="og:title" content={resolved.Title?.value} />
        <meta
          property="og:description"
          content={resolved.ShortDescription?.value}
        />
        <meta property="og:image" content={resolved.Image?.value?.src} />
        <meta property="og:type" content="article" />
      </Head>

      <DetailsShell
        params={params}
        className="article-with-toc-details"
        id={id}
        fullWidth={
          rendering ? (
            <Placeholder name={fullWidthKey} rendering={rendering} />
          ) : null
        }
      >
        <div className="grid grid-cols-12 @[768px]:gap-4 gap-y-6">
          {imagePosition === "above" ? (
            <div
              className={cn(
                "relative z-10 order-1 @[768px]:col-span-10 col-span-12 @[768px]:col-start-2 @[768px]:row-start-1",
                detailsMediaBoxClass(params, "16x9"),
              )}
            >
              <Image
                value={resolved.Image}
                className={detailsMediaFitClass(params)}
                isEditing={isPageEditing}
                placeholder="Image"
              />
            </div>
          ) : null}

          <div
            className={cn(
              "order-2 @[768px]:col-span-8 col-span-12 @[768px]:col-start-3 @[768px]:mt-8 mt-2",
              detailsTextAlignClass(params),
            )}
          >
            <DetailsTitle
              params={params}
              value={resolved.Title}
              isEditing={isPageEditing}
              tag="h2"
            />
            <Text
              tag="p"
              className="mt-5 font-medium text-lg text-muted-foreground tracking-wide"
              value={resolved.ShortDescription}
              isEditing={isPageEditing}
              placeholder="Short description"
            />
            {showSeparator ? (
              <hr className="my-6 border-0 border-current/20 border-t" />
            ) : null}
            {!hideShareWidget && (
              <div className="mt-6">
                <SocialShare platforms={[...DETAILS_SHARE_PLATFORMS]} />
              </div>
            )}
            {imagePosition === "below" ? (
              <div
                className={cn("mt-8", detailsMediaBoxClass(params, "16x9"))}
              >
                <Image
                  value={resolved.Image}
                  className={detailsMediaFitClass(params)}
                  isEditing={isPageEditing}
                  placeholder="Image"
                />
              </div>
            ) : null}
            {showToc ? (
              <div className="mt-6 @[768px]:mt-10 grid grid-cols-1 @[768px]:grid-cols-3 @[768px]:gap-8 gap-y-6">
                {tocPlacement === "start" ? tocNav : null}
                <div className="@[768px]:col-span-2">{body}</div>
                {tocPlacement !== "start" ? tocNav : null}
              </div>
            ) : (
              body
            )}
          </div>
          {/*
            Nested slots must use `<Placeholder>`, not AppPlaceholder
            with a fallback empty Map. This file is `'use client'`;
            the SDK cannot pass the real component map across that
            boundary. An empty map makes every dropped rendering
            show "missing React implementation". Placeholder reads
            SitecoreProvider's client map, same as Container.
          */}
          <div className="order-4 @[768px]:col-span-10 col-span-12 @[768px]:col-start-2 @[768px]:mt-12 mt-8">
            {rendering ? (
              <Placeholder name={inColumnKey} rendering={rendering} />
            ) : null}
          </div>
        </div>
      </DetailsShell>
    </>
  );
}

/**
 * Passthrough so the SDK keeps injecting `page`. `withSitecore` would
 * drop it, and this rendering's empty datasource has no other way to
 * read the article page fields.
 */
export const Default = sitecorePassthrough(ArticleWithTocDetails);

export const componentType = "universal";
