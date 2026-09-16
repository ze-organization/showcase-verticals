/**
 * Minimal inline accent-token vocabulary for single-line text fields.
 *
 * Authors mark a span of a plain-text field for tinting with ONE token
 * form on ONE color axis:
 *
 *   LISTEN {{accent}}LOUD.{{/accent}}
 *
 * The component picks the tint via its `AccentColor` param
 * (`color-scheme@1` → role text, e.g. `text-accent`); this module only
 * turns the string into segments — it renders nothing and knows nothing
 * about colors. Handlebars-style `{{…}}` delimiters keep the syntax
 * consistent with token vocabularies elsewhere in the product and are
 * author-typable in a Sitecore single-line text field (no rich text).
 *
 * This is deliberately NOT a markup language — it is the seed of the
 * longer-term inline-token system, kept to a single token until that
 * system exists. Design rules:
 *
 *   - **Strict + safe.** Anything that isn't a well-formed
 *     `{{accent}}…{{/accent}}` pair degrades to plain text exactly as
 *     typed: an unclosed `{{accent}}`, a stray `{{/accent}}`, or a
 *     nested `{{accent}}` inside an open span all render literally.
 *     The parser never throws and never emits markup.
 *   - **Literal escape.** A backslash immediately before a token
 *     renders the token as text: `\{{accent}}` → `{{accent}}`. Only
 *     token-adjacent backslashes are consumed; every other backslash
 *     is ordinary text.
 *
 * Consumers: tagline-banner (first adopter). Other display-text bands
 * (hero, promo, countdown-banner) can adopt the same parse + an
 * `AccentColor` param without changes here.
 */

/** One run of tagline text: either plain or accent-tinted. */
export interface InlineAccentSegment {
  text: string;
  accent: boolean;
}

export const INLINE_ACCENT_OPEN = "{{accent}}";
export const INLINE_ACCENT_CLOSE = "{{/accent}}";

const ESCAPE = "\\";

/**
 * Index of the next occurrence of `token` at or after `from` that is
 * not preceded by a backslash escape. `-1` when there is none.
 */
function nextUnescaped(input: string, token: string, from: number): number {
  let idx = input.indexOf(token, from);
  while (idx > 0 && input[idx - 1] === ESCAPE) {
    idx = input.indexOf(token, idx + 1);
  }
  return idx;
}

/** Drop the escape backslash from `\{{accent}}` / `\{{/accent}}`. */
function unescapeTokens(text: string): string {
  return text
    .replaceAll(ESCAPE + INLINE_ACCENT_OPEN, INLINE_ACCENT_OPEN)
    .replaceAll(ESCAPE + INLINE_ACCENT_CLOSE, INLINE_ACCENT_CLOSE);
}

/**
 * Parse a single-line text value into plain / accent segments.
 *
 * Well-formed `{{accent}}…{{/accent}}` pairs become `accent: true`
 * segments; everything else (including malformed token usage) stays
 * plain text as typed. Adjacent plain runs are merged, and empty spans
 * (`{{accent}}{{/accent}}`) are dropped. Never throws.
 */
export function parseInlineAccent(input: string): InlineAccentSegment[] {
  if (!input) return [];
  const segments: InlineAccentSegment[] = [];
  const pushPlain = (raw: string) => {
    if (!raw) return;
    const text = unescapeTokens(raw);
    const last = segments.at(-1);
    if (last && !last.accent) {
      last.text += text;
    } else {
      segments.push({ text, accent: false });
    }
  };

  let cursor = 0;
  while (cursor < input.length) {
    const open = nextUnescaped(input, INLINE_ACCENT_OPEN, cursor);
    if (open === -1) {
      pushPlain(input.slice(cursor));
      break;
    }
    const innerStart = open + INLINE_ACCENT_OPEN.length;
    const close = nextUnescaped(input, INLINE_ACCENT_CLOSE, innerStart);
    if (close === -1) {
      // Unclosed opener — degrade the rest of the string to plain text
      // (the raw token stays visible so the author sees the mistake).
      pushPlain(input.slice(cursor));
      break;
    }
    const inner = input.slice(innerStart, close);
    const closeEnd = close + INLINE_ACCENT_CLOSE.length;
    if (nextUnescaped(inner, INLINE_ACCENT_OPEN, 0) !== -1) {
      // Nested opener inside an open span — degrade the whole region
      // (opener through closer, tokens included) to plain text.
      pushPlain(input.slice(cursor, closeEnd));
      cursor = closeEnd;
      continue;
    }
    pushPlain(input.slice(cursor, open));
    if (inner) {
      segments.push({ text: unescapeTokens(inner), accent: true });
    }
    cursor = closeEnd;
  }
  return segments;
}

/** Whether the value contains at least one well-formed accent span. */
export function hasInlineAccent(input: string | undefined): boolean {
  return input != null && parseInlineAccent(input).some((s) => s.accent);
}

/**
 * The value with well-formed accent tokens removed (content kept) —
 * the plain-text reading for `aria-label`s, `alt`s, and search.
 */
export function stripInlineAccent(input: string): string {
  return parseInlineAccent(input)
    .map((s) => s.text)
    .join("");
}
