import type * as React from "react";

import { cn } from "@/lib/registry/cn";

/**
 * Default type ramp for HTML authored in a rich-text field. Applied via
 * descendant selectors so every `<RichText>` (which wraps in `<Prose>`)
 * picks it up without per-callsite classes.
 *
 * Nested headings sit one step below the page-title `TypographyH*`
 * primitives so an h1 inside body copy does not compete with the
 * section title. Family / weight / leading read the theme tokens
 * (`--font-heading`, `--heading-weight`, `--leading-heading`,
 * `--leading-body`). Callers can still override spacing or size
 * through `className` (e.g. `[&_p]:mb-0` on a compact card).
 */
const PROSE_DEFAULT_CLASS = [
  // Links
  "[&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-accent",

  // Headings. Ladder: h1 ≈ heading-size large, h2 ≈ default, h4 ≈ small.
  "[&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:scroll-m-20 [&_h1]:font-(--heading-weight,600) [&_h1]:font-heading [&_h1]:text-3xl [&_h1]:leading-[var(--leading-heading,1.3)] [&_h1]:tracking-tight [&_h1]:md:text-4xl",
  "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:scroll-m-20 [&_h2]:font-(--heading-weight,600) [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:leading-[var(--leading-heading,1.3)] [&_h2]:tracking-tight [&_h2]:md:text-3xl",
  "[&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:scroll-m-20 [&_h3]:font-(--heading-weight,600) [&_h3]:font-heading [&_h3]:text-xl [&_h3]:leading-[var(--leading-heading,1.3)] [&_h3]:tracking-tight [&_h3]:md:text-2xl",
  "[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:scroll-m-20 [&_h4]:font-(--heading-weight,600) [&_h4]:font-heading [&_h4]:text-lg [&_h4]:leading-[var(--leading-heading,1.3)] [&_h4]:tracking-tight [&_h4]:md:text-xl",
  "[&_h5]:mt-6 [&_h5]:mb-2 [&_h5]:font-(--heading-weight,600) [&_h5]:font-heading [&_h5]:text-base [&_h5]:leading-[var(--leading-heading,1.3)] [&_h5]:tracking-tight",
  "[&_h6]:mt-6 [&_h6]:mb-2 [&_h6]:font-(--heading-weight,600) [&_h6]:font-heading [&_h6]:text-sm [&_h6]:leading-[var(--leading-heading,1.3)] [&_h6]:tracking-tight",
  "[&_:is(h1,h2,h3,h4,h5,h6):first-child]:mt-0",
  "[&_:is(h1,h2,h3,h4,h5,h6):last-child]:mb-0",

  // Paragraphs. `last-child` collapse keeps compact single-p slots from
  // growing a trailing gap.
  "[&_p]:mb-4 [&_p]:leading-[var(--leading-body,1.5)] [&_p:last-child]:mb-0",

  // Lists
  "[&_ul]:my-4 [&_ul]:ms-6 [&_ul]:list-disc",
  "[&_ol]:my-4 [&_ol]:ms-6 [&_ol]:list-decimal",
  "[&_li]:mt-2 [&_li]:wrap-break-word",
  "[&_:is(ul,ol):first-child]:mt-0 [&_:is(ul,ol):last-child]:mb-0",

  // Quote + inline code (match TypographyBlockquote / TypographyInlineCode)
  "[&_blockquote]:mt-6 [&_blockquote]:mb-4 [&_blockquote]:border-s-2 [&_blockquote]:ps-6 [&_blockquote]:italic",
  "[&_code]:relative [&_code]:rounded [&_code]:bg-muted-hover [&_code]:px-[0.3rem] [&_code]:py-[0.2rem] [&_code]:font-mono [&_code]:text-sm",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_strong]:font-semibold",
  "[&_hr]:my-8 [&_hr]:border-border",
].join(" ");

/**
 * Wrapper for rich text / long-form content. Default h1–p (and list /
 * quote / code) styles live here so Sitecore RTE HTML and markdown
 * bodies share one type ramp.
 */
function Prose({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prose"
      className={cn(PROSE_DEFAULT_CLASS, className)}
      {...props}
    />
  );
}

export { Prose };
