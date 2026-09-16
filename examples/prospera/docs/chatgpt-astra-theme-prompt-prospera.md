# ChatGPT Astra — Prospera (Category I banking) theme pack prompt

Copy everything in [The prompt](#the-prompt) into ChatGPT Astra. **BASELINE_URL**, **PAGES_TO_OPEN**, chrome, and CTA are already filled. Do not replace them.

This file is the spec for what “complete” means for a **Prospera** head on the same Sitecore Content SDK + Next.js App Router stack as [`chatgpt-astra-theme-prompt.md`](./chatgpt-astra-theme-prompt.md). Token names and recipe enums match that file. This pack asks for **5 photos**, not 20.

**Assumption:** Astra can open the baseline URL, inspect computed styles and screenshots, generate accessible color ramps, choose Google Fonts, produce recipe defaults against existing enums, write paste-ready CSS tokens, generate the 5-image photo set, and emit the Sitecore Brand Kit PDF copy. Do not ask it to invent new components or page templates.

**Brand vs analog:** The live site you inspect is the *analog* (look only). The fictional brand is **Prospera**. Do not clone the analog’s logo, name, lockup, tagline, illustrations, or copy.

---

## The prompt

```
You are ChatGPT Astra and for this exercise I want you to operate as if you are a Chief Designer working with many of the most powerful brands in the world to build a cohesive and connected digital experience for a .com. You can fetch live URLs, inspect computed CSS and screenshots, generate accessible color ramps, produce Google Font pairings, generate a licensed-style photo set, and emit a complete implementation pack for an existing Sitecore Content SDK + Next.js App Router marketing head.

You are not designing a new component library. This head already has components, page designs, and recipe enums. You translate one analog website into:

1. CSS design tokens that use this app’s exact variable names
2. Recipe param defaults that use this app’s exact enum values
3. Google Fonts + next/font wiring
4. A 5-image photo set with filenames this pack specifies
5. Sitecore Brand Kit copy (PDF-ready) for the fictional brand Prospera
6. A visual style guide (boards) so a human can approve the look before implementation

Do not clone the analog’s logo, name, lockup, tagline, illustrations, or copy. Extract system: color roles, type contrast, radius, density, hero treatment, cards, header, photography. All customer-facing names in this pack are Prospera (never the analog bank).

════════════════════════════════════════
INPUTS — these are filled; do not change them
════════════════════════════════════════

BASELINE_URL:             https://www.starlingbank.com/ (LOCKED)
VERTICAL:                 Category I banking (LOCKED)
BRAND_NAME:               Prospera (LOCKED)
LEGAL_NAME:               Prospera Bank, N.A. / Prospera Financial Group (LOCKED — fictional; use in Brand Kit legal voice only)
CONVERSION_CTA:           Apply Now (LOCKED)
SITE_CHROME:              Personal · Business · About · Help · Login · Apply Now (LOCKED)
                          Primary nav = Personal, Business, About, Help.
                          Login = header link (utility / account), not the conversion button.
                          Apply Now = header CTA only.
PAGES_TO_OPEN:            (LOCKED — open all of these)
                          https://www.starlingbank.com/
                          https://www.starlingbank.com/current-account/
                          https://www.starlingbank.com/apply/?r=pca
                          https://www.starlingbank.com/business-account/
                          https://www.starlingbank.com/business-account/#eligibility
                          https://www.starlingbank.com/business/accounting/
                          https://www.starlingbank.com/features/virtual-cards/
                          https://www.starlingbank.com/features/
                          https://www.starlingbank.com/current-account/tools/budget-planner/
                          https://www.starlingbank.com/about/
                          https://www.starlingbank.com/help/
                          https://app.starlingbank.com/login
                          https://www.starlingbank.com/apply/

Analog note: Starling is a UK digital bank. Extract look (color, type, radius, density, header pattern). Do not clone Starling’s name, bird, cards, illustrations, app UI, or copy. Prospera stays the fictional U.S. Category I brand. https://app.starlingbank.com/login is authenticated chrome — capture that Login is a header link; do not theme the marketing head as the banking app.

════════════════════════════════════════
WHO PROSPERA IS (LOCKED)
════════════════════════════════════════

Prospera is a fictional U.S. Category I banking organization: a nationally scaled, complex institution in the same supervisory bucket as U.S. G-SIBs (Federal Reserve tailoring Category I — not a community bank, credit union, neobank, or regional “hometown” brand).

Must feel
- Institutional trust, regulated clarity, national presence
- Full franchise: consumer products + advice/wealth + commercial proof (case studies) + branches
- Calm density, precise type, conservative motion (almost always none)
- Photography: real branches, cities, advisory conversations, diverse customers and bankers — editorial, not stock-handshake cliché if you can avoid it

Must not feel
- Fintech disruptor, crypto, neon gradients, “we’re not a bank”
- Credit-union folksy, farm-town warmth as the primary voice
- Luxury private-bank only (wealth exists under Advice; it is not the whole site)
- Retail furniture, travel destinations, or multi-industry “Solutions” hubs
- Analog bank names, logos, slogans, mascots, or recognizable branch interiors from BASELINE_URL

════════════════════════════════════════
SITEMAP (LOCKED — style this tree; do not invent templates or extra top-level chrome)
════════════════════════════════════════

Reuse existing handles only. Title-Case hubs, kebab product/PDP slugs. Do not add page templates. Checking, cards, mortgage, and HELOC are all product@1. Branches are location@1. Wealth/treasury are service@1.

Do not install /Solutions (this site is the vertical). Do not install /Destinations (geo is Locations). Do not install SaaS Features / Status / Integrations URLs.

/
├── Products                                          page@1
│   ├── Checking-and-Savings                          product-category@1
│   │   ├── everyday-checking                         product@1
│   │   └── high-yield-savings                        product@1
│   ├── Cards                                         product-category@1
│   │   └── rewards-visa                              product@1
│   ├── Lending                                       product-category@1
│   │   ├── thirty-year-mortgage                      product@1
│   │   └── home-equity-line-of-credit                product@1
│   └── *                                             wildcard
│
├── Services                                          page@1   (not in header; Advice lives in the tree only)
│   ├── wealth-planning                               service@1
│   ├── retirement                                    service@1
│   └── treasury                                      service@1
│
├── Locations                                         page@1
│   ├── North-America                                 location-territory@1
│   │   └── New-York                                  location-metro@1
│   │       └── …                                     location@1   (branch)
│   ├── EMEA                                          location-territory@1
│   └── APJ                                           location-territory@1
│
├── Resources                                         page@1
│   ├── Articles                                      page@1   … article@1 (+ one article-with-toc@1)
│   ├── News                                          page@1   … news@1
│   ├── Case-Studies                                  page@1   … case-study@1 (commercial / SMB)
│   └── Documentation                                 page@1   (disclosures / help)
│
├── Offers                                            page@1   … offer@1 (promo APY / limited-time rates — not retail “sale”)
├── Pricing                                           page@1   (Rates & fees — abstract hub, not SaaS tiers)
│
├── Partners                                          page@1   … partner@1
├── Events                                            page@1   … event@1
│
├── About                                             page@1
├── Leadership                                        page@1
├── People                                            page@1   … person@1
├── Careers                                           page@1   … job@1
├── Contact                                           page@1
├── Business                                          page@1   (nav: Business — commercial hub, not a new template)
├── Get-Started                                       page@1   (Apply Now)
│
├── Support                                           page@1   (nav: Help)
├── Search                                            page@1
├── FAQs                                              page@1
├── Privacy / Terms / Accessibility                   page@1
├── Landing-Pages                                     landing@1 / blank-landing@1
└── Not-Found / Server-Error

Chrome (not extra URLs)
- Header: Personal · Business · About · Help · Login · **Apply Now**
- Personal → /Products (checking, cards, lending including HELOC)
- Business → /Business (`page@1` hub)
- About → /About
- Help → /Support
- Login → existing account-link pattern (e.g. `/account/sign-in`); not a new page template; not the CTA
- Apply Now → /Get-Started
- Footer: three columns + legal, same tree (Personal / Business / Help / About / legal)
- Header CTA label is always “Apply Now”

Do not put Products, Advice, Resources, or Company in the header. Those remain in the IA tree where listed; they are not top chrome.

Page designs for unused types (including destination-page@1) stay in the kit. You do not delete them. You do not bind Destinations in chrome.

════════════════════════════════════════
HARD RULES
════════════════════════════════════════

1. Use ONLY the CSS token names and recipe enum values listed in this prompt. If a look cannot be expressed, say so in “Cannot express” and pick the nearest existing knob.
2. Fonts: Google Fonts, OFL. Two families + IBM Plex Mono (do not switch to JetBrains Mono — this is not an IT vertical). If the analog uses a paid face, map to the closest Google pair and record the source family.
3. Do not invent ColorScheme names, components, or page templates. Do not recommend OverlapTop, MediaInset, per-page unique ColorSchemes, or aggressive two-tone brand-lock treatments.
4. Composition rhythm (locked for this head):
   - Browse hubs with photos: hero@1 FullBleed, Layout centered, Hero HeadingLayout display
   - Abstract hubs (Resources, Documentation, Pricing/Rates & fees, Get-Started): BackgroundColor primary, no FullBleed photo required
   - Utility/legal/search/errors: content-block or short hero, no FullBleed primary band
   - Band rhythm: default surface → listing → one muted ColorScheme/promo SurfaceTone → default
   - One accent on hero + primary CTAs only
   - First listing card Featured or MediaStacked where the family has it; rest Default
   - Closer: one promo@1, ImagePosition end (or no image), CTA scheme matching the hero
   - Section headings: HeadingLayout start on listings; center only under a centered hero; do not use start-with-section-divider on every grid
5. Page designs stay standard-page@1 / hub-page@1 / *-page@1. Insertable types stay as they are. You style them; you do not replace them. HELOC is not a new type.
6. Deliver EVERY artifact in “Output package.” If a section is long, finish it fully before starting the next. If you must continue in a follow-up, stop on a heading.
7. Brand Kit, photo captions, recipe CTA labels, and style-guide copy say Prospera — never the analog’s legal name.
8. Banking chrome: prefer --button-radius ≈ 0.375rem unless the analog is clearly pill or square-gov; cards may be slightly rounder than buttons. Do not use retail/travel pill CTAs (999px) unless the analog’s primary button is unmistakably a pill.
9. Light-first marketing site. Do not ship new .dark values unless the analog is dark-first (Category I consumer banks almost never are).

════════════════════════════════════════
EXISTING RECIPE ENUMS (values only)
════════════════════════════════════════

ColorScheme
  default | none | white | black | neutral | primary | primary-gradient | secondary | secondary-gradient | tertiary | tertiary-gradient | accent | accent-gradient | accent-2 | accent-2-gradient | accent-3 | accent-3-gradient | info | success | warning | destructive
  Role: rendering-param surface. `default` = inherit parent (no class). `none` = transparent. Gradients are decorative chrome for related sibling bands, not a second brand.

BackgroundIntensity
  subtle | bold
  Role: how saturated a section fill is. `subtle` = weak *-background tint (hub supporting bands). `bold` = solid role color + inverted text (use at most once, e.g. closer).

OverlayStyle
  none | solid | gradient | blur
  Role: hero overlay on the image/color. `solid` at OverlayOpacity; `gradient` fades from overlay edge; `blur` = low-opacity color + backdrop blur.

Hero HeadingLayout
  display | compact
  Role: title size ramp on hero@1. `display` = oversized title + kicker eyebrow (browse hubs). `compact` = smaller ramp (narrow overlays / utility).

HeadingLayout (section headings)
  start | start-with-accent | start-with-section-divider | center | center-with-accent | center-with-section-divider
  Role: alignment × treatment for grids and blocks. Center only under a centered hero.

EyebrowStyle
  text | badge
  Role: kicker above titles. `text` = small uppercase line. `badge` = pill chip.

ButtonVariant
  default | outline | ghost | link
  Role: primary CTA = default; secondary = outline or ghost; inline = link. Corner radius is NOT a variant — it is --button-radius.

CardElevation
  theme | none | xs | sm | md | lg
  Role: card shadow. `theme` defers to --card-shadow. Flat analog → none. Soft analog → sm.

Header partial (pick ONE for the whole site)
  header-brand-nav@1              logo + primary nav + CTA (starter default)
  header-utility-bar@1            extra utility row
  header-two-tier@1               two rows
  header-centered-logo@1          logo centered
  header-transparent-overlay@1    transparent over FullBleed hero
  Pick transparent-overlay only if the analog header sits on the hero image.
  This analog uses Personal | Business plus About · Help · Login · Apply Now. Prefer header-utility-bar@1 or header-two-tier@1 so Login can sit in the utility row and Apply Now is the sole CTA. Do not use centered-logo unless the analog is clearly logo-centered.

FooterColorScheme (site footer or card footer bands)
  none | muted | neutral | primary | secondary | tertiary | accent | accent-2 | accent-3 | info | success | warning | destructive
  Role: optional tinted band. Site footer is usually none or muted.

Forms
  FormColorScheme: neutral. Submit: ColorScheme primary, ButtonVariant default.

Share widget
  Out of scope. Leave existing Article/News chips, Product/Destination Menu, others hidden.

Card variants by meaning (not variety)
  Featured or MediaStacked = first hub/editorial tile
  Default = product and remaining cards

════════════════════════════════════════
TOKEN DICTIONARY
Every token below exists in src/app/globals.css. For each one you customize, output name, hex or CSS value, and a one-line “why this analog.” Tokens you do not change: list under KEEP_STARTER — do not invent replacements.

How ramps work
  50  = lightest tint (page washes, *-background)
  100–200 = subtle bands, hover tints, *-background-active
  300–400 = borders, charts, mid decoration
  500     = named role default for secondary/tertiary/accent/info/success/warning/destructive
  600     = hover / *-foreground on tinted surfaces
  700     = primary KEY in this app (--color-primary → primary-700). Body CTAs, links.
  800–900 = pressed/active, darkest text-on-tint

If you customize a role, you MUST supply 50–900 AND the companion tokens for that role (hover, active, background, foreground, background-active).

--- TYPE ---

--font-sans
  Stack for UI sans. Fallback after the Google heading/body face if they are sans.
  Role: generic sans; usually the same family as --font-body.

--font-serif
  Stack for serif. Role: analog serif or Georgia fallback; --font-accent often points here.

--font-mono
  Monospace stack. Role: code, tabular UI, documentation. Default IBM Plex Mono. Keep (banking rates/fees tables may use it; do not switch to JetBrains Mono).

--font-heading
  Family used by h1–h6, heroes, card titles, display numbers (font-heading in components).
  Role: THE display voice of Prospera. Set to the Google heading family. Category I banks often pair a serious serif or a sturdy grotesque with a quiet sans — follow the analog, not a startup geometric.

--font-body
  Family for paragraphs, forms, nav, buttons unless --button-font overrides.
  Role: long-read and UI chrome. Set to the Google body family.

--font-accent
  Family for pull quotes, optional eyebrows, decorative lines.
  Role: usually --font-heading or --font-serif. Do not introduce a third Google family unless the analog clearly uses one.

--font-code
  Alias of --font-mono. Role: code-snippet@1 and inline code. Keep pointing at --font-mono.

--heading-weight
  Numeric weight for titles (components use font-(--heading-weight,600)).
  Role: must exist on the heading face (600 preferred; 500 or 700 if no 600).

--leading-tight
  Line-height 1.25. Role: compact UI (stats, badges). Rarely change.

--leading-heading
  Line-height for headings (default 1.3). Role: display tightness. Serif display may want ~1.15–1.25.

--leading-body
  Line-height for body (default 1.5). Role: readability. Do not drop below 1.45.

--leading-relaxed
  Line-height 1.625. Role: long-form article body. Optional bump for editorial Insights.

--button-font
  Family inside buttons. Role: usually --font-body. Only point at heading if the analog uses display type on CTAs.

--button-weight
  Weight inside buttons (default 600). Role: CTA emphasis.

--button-letter-spacing
  Tracking on buttons (default normal). Role: uppercase/wide CTAs if the analog uses them.

--button-text-transform
  none | uppercase | … Role: analog CTA casing. Prefer none unless the analog is clearly all-caps.

--button-shadow
  Box-shadow on buttons (default none). Role: only if analog CTAs are elevated.

--button-radius
  Corner radius on buttons. Role: THE button shape. Square/gov ~0.25rem; banking ~0.375rem; retail/travel pill var(--radius-4xl) or 999px. This is not ButtonVariant. Default bias for Prospera: ~0.375rem.

--button-icon-radius
  Radius on icon-only buttons (default 999px). Role: keep full if buttons are circular; match --button-radius if the analog is square.

--card-title-weight
  Weight for card titles (default 600). Role: match --heading-weight unless cards are lighter.

--card-title-tracking
  Letter-spacing for card titles (default normal). Role: rarely change.

--- SHAPE ---

--radius
  Base corner radius (default 0.25rem). Role: controls the whole radius scale’s starting point for components that read the base token.

--radius-base
  Alias of --radius. Role: keep equal to --radius.

--radius-none
  0. Role: sharp edges. Do not change.

--radius-xs … --radius-sm … --radius-md … --radius-lg … --radius-xl … --radius-2xl … --radius-3xl … --radius-4xl
  Step scale from 0.0625rem to 2rem. Role: cards, inputs, overlays, large shells. If the analog is rounder, shift the SCALE (e.g. bump base and md/lg) rather than random per-component radii.

--radius-full
  Pill (very large rem). Role: chips, avatars, pill buttons. Keep.

--card-radius
  Card corner radius (default 0.75rem). Role: listing cards, feature tiles. Independent of --button-radius (banks often square buttons + slightly rounded cards).

--color-badge-radius
  Badge/chip radius (default 0.25rem). Role: EyebrowStyle badge, status chips. Match --button-radius language.

--card-border-width
  Card hairline (default 1px). Role: 0px if analog cards are shadow-only; 1px if outlined.

--card-border
  Card border color. Role: usually --color-border / --border.

--card-background
  Default card fill. Role: usually --color-background or white.

--card-muted-background
  Quiet card fill (mix of primary into muted). Role: nested/muted cards. Recalculate if primary changes.

--card-elevated-background
  Elevated card fill. Role: raised tiles; usually white / --color-card.

--card-shadow
  Default card elevation (default none). Role: analog card depth. none | a --shadow-* token.

--card-foreground
  Text on cards. Role: usually --color-foreground.

--card-description-color
  Secondary text on cards. Role: usually --color-muted-foreground.

--input-border
  Form field border color. Role: usually --color-border.

--input-border-width
  Field border width (default 1px). Role: analog form chrome.

--input-background
  Field fill. Role: usually --color-background.

--input-background-hover
  Field fill on hover. Role: slight tint or same as background.

--icon-set
  Icon library key (lucide). Role: KEEP unless you have a hard requirement. Components resolve NamedIcon against this.

--- TYPE SCALE (usually KEEP_STARTER) ---

--spacing
  Base spacing unit 0.25rem. Role: Tailwind spacing. Do not change.

--text-3xs … --text-2xs … --text-xs … --text-sm … --text-md … --text-base … --text-lg … --text-xl … --text-2xl … --text-3xl … --text-4xl … --text-5xl … --text-6xl … --text-7xl … --text-8xl … --text-9xl
  Font-size ramp. Role: KEEP_STARTER. Hero “display” is a component ramp, not these tokens.

--- SHADOWS ---

--shadow-none
  No shadow. Role: keep.

--shadow-xs --shadow-sm --shadow-base --shadow-md --shadow-lg --shadow-xl --shadow-2xl
  Elevation ladder. Role: analog depth. Flat sites keep starter or none. If you customize, give full CSS box-shadow values.

--shadow-inner
  Inset shadow. Role: pressed wells, inputs. Optional.

--shadow-outline
  Focus ring shadow. Role: should use primary at ~0.6 alpha.

--shadow-dark-lg
  Darker large shadow. Role: optional; KEEP unless analog uses dramatic elevation.

--- PAGE / CHROME COLOR ---

--white / --black
  Literal #fff / #000. Role: keep.

--color-theme-white / --color-theme-black
  Explicit theme white/black for overlays and invert. Role: keep #fff/#000 unless analog uses off-white/off-black as “paper.” If paper is warm, set --color-background to that off-white and still keep theme-white as true white for inversions.

--color-background
  Page canvas. Role: analog body background (usually white or cool institutional paper — not cream retail).

--color-foreground
  Default text. Role: analog body text (usually near-black / navy-black). Must pass WCAG AA on --color-background.

--color-muted
  Quiet fill (neutral-100 light). Role: zebra rows, muted chips.

--color-muted-background
  Section muted fill (neutral-100). Role: supporting bands at BackgroundIntensity subtle + ColorScheme default/neutral.

--color-muted-foreground
  Secondary text (#5e5e5e today). Role: dek, captions, placeholders. AA on background.

--color-muted-hover / --color-muted-active
  Muted interactive states. Role: hover/press on muted chrome.

--border / --color-border
  Default hairline (today primary-200). Role: analog border. Often a neutral-200, not a brand tint — only use primary-200 if the analog’s rules are branded.

--color-border-a11y
  High-contrast border (primary-foreground). Role: focus/a11y edges.

--ring
  Focus ring color (today primary). Role: keyboard focus. Match primary key.

--color-overlay
  Dimmer over media (blackAlpha-500). Role: hero scrim. Adjust alpha if analog overlays are heavier/lighter.

--color-popover
  Popover/dropdown fill. Role: usually --color-background.

--color-popover-foreground
  Popover text. Role: usually --color-foreground.

--color-card
  Alias of --card-background for shadcn-like consumers.

--color-placeholder
  Input placeholder. Role: usually muted-foreground or primary-foreground depending on field style.

--color-inverse-text
  Text on solid brand fills (today white). Role: must pass AA on primary-700 (and bold bands).

--color-current / --transparent
  Keep.

--- BRAND ROLES (customize these) ---

For each of primary, secondary, tertiary, accent, accent-2, accent-3:

--color-{role}-50 … --color-{role}-900
  Full hue ramp. Role: see “How ramps work.”

--color-{role}
  Named alias. In this app: primary → 700; secondary/tertiary/accent/accent-2/accent-3 → 500. Keep that mapping unless the analog’s “brand” is clearly a mid tone (then document the exception).

--color-{role}-hover
  Hover (typically 800 for primary, 600 for others). Role: links, buttons :hover.

--color-{role}-active
  Pressed (typically 900 / 700). Role: :active.

--color-{role}-background
  Subtle fill (typically 50 or 100). Role: BackgroundIntensity subtle; ColorScheme {role} on sections.

--color-{role}-foreground
  Text/icon on that subtle fill (typically 600). Role: readable type on *-background. AA required.

--color-{role}-background-active
  Pressed subtle fill (typically 100 or 200). Role: interactive tinted cells.

--color-primary-foreground
  Text ON solid primary (today inverse/white). Role: CTAs, bold primary bands. AA on primary-700.

Primary is the brand. Secondary is the second institutional hue (not a hover of primary). Tertiary is a third related hue (optional; KEEP starter purple if analog is two-hue). Accent is the highlight (CTAs that are not primary, decorative bars). Accent-2 / accent-3 are extra accents for sibling decorative chrome (utility-card grids). If analog has only two hues, KEEP accent-2/accent-3 starter or alias them to secondary/accent — say which.

Category I banks are often navy/blue + one gold or red accent. Do not keep the starter purple as primary “because it was there.” Rebuild primary from the analog. Do not invent a rainbow of equal brand colors.

Gradient ColorScheme values (primary-gradient, etc.)
  Role: they consume the same ramps; you do not add tokens. Use them only if the analog actually uses sibling gradient bands. Category I consumer sites rarely need them — default to solid.

--- NEUTRALS ---

--color-gray-50 … --color-gray-900
  Primitive cool gray. Role: source for --color-neutral-*. Recolor the gray ramp if analog paper/text is warm or blue-gray.

--color-neutral-50 … --color-neutral-900
  Semantic neutrals (alias gray today). Role: text, muted, borders if not branded.

--color-neutral
  Alias of neutral-500. Role: mid gray.

--color-neutral-hover / --color-neutral-active
  Neutral interactive. Role: KEEP unless neutrals change.

--color-neutral-background / --color-neutral-foreground / --color-neutral-background-active
  Neutral as a ColorScheme. Role: quiet bands.

--- SEMANTIC (default KEEP_STARTER unless analog has a strong meaning) ---

info    — instructional / “good to know” (this starter’s info ramp is purple-ish; do not “fix” to blue unless analog info is clearly blue)
success — positive / confirmation
warning — caution / rates / outages
destructive / danger — errors, delete, outages critical
  Each has 50–900, --color-{role}, hover, active, background, foreground, background-active.

--color-danger-* aliases destructive/red. If you change destructive, keep danger in sync.

Do NOT hue-shift semantics “to be on brand.” Only change if the analog’s success/warning/error are unmistakably different and still pass AA.

--- PRIMITIVE HUES (aliases into roles; do not theme independently unless you re-point aliases) ---

--color-blue-* --color-cyan-* --color-teal-* --color-green-* --color-orange-* --color-yellow-* --color-purple-* --color-pink-* --color-red-*
  Raw palettes. Today: secondary aliases teal, tertiary purple, accent orange, accent-2 cyan, accent-3 pink, destructive red, success green, warning orange.
  Role: if you customize a brand role, either (a) write hexes directly on --color-primary-* etc., or (b) rebuild the primitive and keep aliases. Prefer (a) for primary. Document aliases you change.

--- ALPHA ---

--color-blackAlpha-50 … 900
  Black at rising opacity. Role: overlays, shadows, scrims. KEEP unless analog overlays are brown/navy (then prefer --color-overlay pointing at a navy alpha, keep blackAlpha for generic dimming).

--color-whiteAlpha-50 … 900
  White at rising opacity. Role: dark-header hairlines, dark-mode borders. KEEP.

--- CHARTS ---

--color-chart-1 … --color-chart-5
  Series colors. Role: ranking-table, stats, matrix. Recolor to primary/secondary/accent/tertiary/success so charts match the vertical. Must remain distinguishable. Rates/APY callouts must stay readable — do not make every series primary.

--- SIDEBAR (app chrome; low priority for marketing verticals) ---

--color-sidebar
--color-sidebar-foreground
--color-sidebar-primary / --color-sidebar-primary-foreground
--color-sidebar-accent / --color-sidebar-accent-foreground
--color-sidebar-border / --color-sidebar-ring
  Role: in-app sidebars, not the public header. KEEP_STARTER unless you are theming an authenticated shell.

--- SURFACES ---

--color-background-surface
  Raised canvas (today primary-50). Role: well/offset page regions. Recolor to primary-50 of the NEW primary.

--color-background-accent
  Accented canvas (today primary-100). Role: highlighted wells.

--- DARK MODE (.dark) ---

This app inverts many of the aliases above. For Prospera, default is light-only: say “do not ship new .dark values.” If the analog is dark-first, provide a .dark { } block using the same token NAMES with dark hexes, and verify AA.

════════════════════════════════════════
PROCESS
════════════════════════════════════════

A. Open every page in PAGES_TO_OPEN. Capture header, hero, cards, footer, forms, type, photography.
B. Extract hexes from computed CSS where possible; cite selector/location. Expand to ramps. Verify WCAG AA: body on background; white on primary key; muted-foreground on background; primary-foreground on primary-700. Report ratios. Fix failing steps.
C. Map analog fonts → Google Fonts. Weights 400/600/700 (omit 600 if missing and set --heading-weight). Include italic only if body italic is common.
D. Choose header partial, button radius, card radius, overlay, intensity language. Record SITE_CHROME exactly: Personal · Business · About · Help · Login · Apply Now.
E. Fill recipe defaults for all required surfaces. Header CTA = Apply Now. Login is a link, not a second CTA.
F. Generate exactly 5 images (actual images, not just queries) using the image-style rules and the filename map below. Prefer photoreal editorial consistent with Category I banking; no analog watermarks, no cloned people, no Starling illustrations or app screenshots, no crypto/neon. Do not generate extra photos.
G. Write Brand Kit sections for Prospera (fictional Category I). Glossary must include product words to keep (APY, HELOC, branch, advice) and analog/fintech words to avoid.
H. Emit visual style-guide boards (color, type, buttons, hero, cards, header/footer, do/don’t).
I. Emit the file package.

════════════════════════════════════════
OUTPUT PACKAGE — emit all of these
════════════════════════════════════════

### FILE: README.md
Vertical = Category I banking. Brand = Prospera. Analog URL. One-paragraph look. How to apply (fonts → tokens → recipes → photos → brand kit). Note: IA/chrome already specified; implementer still must verticalize recipes separately from this pack.

### FILE: brief.md
Must feel (8) / must not (8) for Prospera Category I. SITE_CHROME. CONVERSION_CTA. Header partial choice + why. One sentence that HELOC is product@1 under Lending.

### FILE: visual-diagnosis.md
12–16 sentences: color temperature, type contrast, radius, density, hero, cards, header, photography, motion (almost always none), what makes this Category I bank vs the starter purple/Manrope look and vs a neobank.

### FILE: style-guide.md
Boards in markdown + generated images:
1. Color — ramps as swatches, roles labeled
2. Type — heading/body/mono specimens at H1, H2, body, button, caption
3. Buttons — default / outline / ghost / link on light, and on primary
4. Hero — FullBleed vs abstract primary band (Rates & fees / Get-Started)
5. Cards — Default vs MediaStacked vs Featured
6. Header + footer (Personal · Business · About · Help · Login · Apply Now)
7. Do / don’t (6 each, visual) — include “no analog logo” and “no neon fintech”

### FILE: fonts.md
Table: role | Google family | weights | italic | mapped-from analog | token
next/font/google snippet mapping CSS variables to --font-heading, --font-body, --font-mono.
Note missing 600 cuts.

### FILE: tokens.css
Paste-ready :root { } with EVERY customized token. Then a KEEP_STARTER list of omitted names. Do not dump unchanged primitives. Include comments above each group using the Role text from the dictionary.

### FILE: tokens.dark.css  (only if dark-first analog)
.dark { } customized tokens only.

### FILE: contrast.md
Table: foreground | background | ratio | AA | AAA | fix applied.

### FILE: recipe-defaults.md
Table required rows (every row must have component handle + params from enums only):

| Surface | Component | Params |
| Header | header-*@1 | Nav: Personal, Business, About, Help; Login link; CTA label = Apply Now, ButtonVariant, ColorScheme |
| Home hero | hero@1 | variant, Layout, Hero HeadingLayout, OverlayStyle, ColorScheme |
| Home highlights | features-list-grid@1 (or analog family grid) | HeadingLayout, first card variant |
| Home closer | promo@1 | ImagePosition, ColorScheme, CTA ColorScheme |
| Hub hero (image family) | hero@1 | FullBleed + display + overlay — Personal/Products, Business, Locations |
| Hub hero (abstract family) | hero@1 | BackgroundColor primary, intensity — Help/Support, Documentation, Pricing, Get-Started |
| Hub grid | family list-grid | HeadingLayout start, first card Featured/MediaStacked |
| Hub supporting band | stats or promo or carousel | ColorScheme muted/neutral, BackgroundIntensity subtle |
| Hub closer | promo@1 | match hero CTA scheme |
| PDP | details (leave share policy) | ColorScheme defaults — checking, card, mortgage, HELOC all product-details |
| Contact / Get-Started | form-builder@1 | FormColorScheme, submit ColorScheme |
| Legal / FAQ / Search | content-block or short hero | no FullBleed |
| Footer | footer partial | FooterColorScheme |
| Primary CTA | cta-button@1 | Variant default, ColorScheme primary |
| Secondary CTA | cta-button@1 | outline or ghost |
| Eyebrows | | EyebrowStyle |
| Section heading under centered hero | | HeadingLayout center |
| Section heading on listings | | HeadingLayout start |
| Cards | | Elevation, radius via tokens |

### FILE: cannot-express.md
Baseline looks we will not reproduce + nearest fallback. Must include: https://app.starlingbank.com/login (authenticated app — Login is a header link only); Starling bird / card illustrations / in-app Spaces UI; Personal|Business as a site-switcher we approximate with two nav items; analog mega-menus we cannot rebuild. Do not invent a sixth primary nav item.

### FILE: brand-kit.md
Sitecore Brand Kit sections for Prospera — not generic startup voice, not the analog bank’s voice:
- Brand Context: purpose, consumer, essence, benefits (Category I national bank)
- Global Goals: digital mandatories, SEO, accessibility, diversity, regulated disclosures
- Tone of Voice + 3 scenarios (Apply Now / current account, business account, HELOC inquiry)
- Dos (8) and Don'ts (8)
- Visual Guidelines: colour roles, type, density, buttons, hero, cards
- Image Style + 3 scenarios
- Grammar Guidelines (short) — rates as facts, not hype
- Glossary: 10 terms to keep/avoid (keep: APY, HELOC, Personal, Business, Prospera; avoid: Starling, analog slogans, crypto, Solutions-as-industries)
This file must be PDF-ready (print CSS or export-ready markdown).

### FILE: photos/ + photos.csv
Generate exactly 5 images, exact names. Reuse these across other pages — do not add a sixth file.

home-hero.jpg              homepage hero — people + money habits / national scale; not Starling HQ, cards, or app UI
hub-01.jpg                 Personal — checking & everyday banking
hub-02.jpg                 Business — owners / commercial (not analog accounting screenshots)
pdp-01.jpg                 current-account / apply product (physical card or people, not cloned analog card art)
promo-closer.jpg           Apply Now

photos.csv columns: filename, use, aspect (16:9), prompt used, license note
All five: 16:9.
No analog watermarks, no Starling bird or illustrations, no cloned analog people, no crypto/neon, no destination-travel scenery as “banking.”

### FILE: qa.md
Yes/no checks including: fonts applied, AA on hero and CTA, no rainbow ColorSchemes, legal not FullBleed, header = Personal · Business · About · Help · Login + CTA Apply Now, Login is not a second button, exactly 5 photos, photos not analog watermarks, HELOC not a new template, tokens names match dictionary, KEEP_STARTER honored, Brand Kit says Prospera not Starling.

### FILE: implement.md
Exactly:
1. next/font in src/app/[site]/[locale]/layout.tsx; map to --font-heading/--font-body/--font-mono
2. Merge tokens.css into :root in src/app/globals.css (do not replace the whole file)
3. Apply recipe-defaults.md to Home, hubs, closer, header (Personal / Business / About / Help / Login + Apply Now)
4. Replace picsum with the 5 files in photos/ per photos.csv; reuse them — do not invent more image files
5. Upload brand-kit.md (PDF) to Sitecore Design → Brand kits; process/publish
6. QA Home, Personal (Products), Business, one PDP, Help/Support, Get-Started, legal, mobile header (Login + Apply Now)

Do not add templates. Do not change proxy order, route shape, or enum recipes. Do not push recipes to any site from this pack alone.

Do not add templates. Do not change proxy order, route shape, or enum recipes. Do not push recipes to any site from this pack alone.

END OF PROMPT
```

---

## How to review this file

You are checking four things:

1. **Inputs** — Starling baseline + pages, Prospera brand, chrome (Personal · Business · About · Help · Login · Apply Now), and 5 photos are locked.
2. **IA** — the tree still has Products (including HELOC) and `/Business`; header does not use Products/Advice/Resources/Company.
3. **Token dictionary** — every name Astra is allowed to set, with the role it plays in *this* head.
4. **Output package** — enough files that implementation is mechanical: fonts, token merge, recipe params, **5 photos**, brand kit.

If a token is missing from Astra’s `tokens.css` and also missing from `KEEP_STARTER`, the pack is incomplete.

## What this prompt still does not ask for

- New page templates, new ColorScheme enum members, or new React (no `heloc@1`).
- Relume / Untitled UI / Leonardo as separate products (Astra is assumed to cover that work).
- A rewritten `globals.css` from scratch (merge only — the file has `@theme`, primitive aliases, and `.dark`).
- Changing share-widget policy or insertable types.
- Implementing the sitemap in recipes (that is the verticalize step in the banking fork). This prompt only makes the pack match that tree.
