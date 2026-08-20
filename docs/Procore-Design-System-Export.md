# Procore Design System — Knowledge Export

**Purpose:** Upload this file to a Claude.ai Project's knowledge base so any output generated there — SOPs, documents, decks, prototypes, UI — stays on-brand for Procore without needing this design-system tool. It contains the complete visual language, voice rules, exact tokens, and document/SOP structural requirements in one place.

**How to use this file:** Treat every value below as fixed brand fact, not a suggestion. When asked to design or write anything for Procore, apply the voice rules to the copy and the exact hex/px/font values below to the visuals. Don't invent new colors, fonts, or spacing — derive from these tokens.

---

## 1. Brand voice & content rules

Procore writes as a **trusted industry partner who understands construction** — confident, operational, plain, never flashy.

- **Audience-first, second person.** Speak to the reader as a builder. Use "you", not "we" — Procore is the tool, not the hero.
- **Outcome-focused.** Every line lands on a benefit (margin, efficiency, certainty), not a feature list.
- **Industry-confident, not jargony.** Construction nouns (RFIs, submittals, punch list, jobsite) used freely; no buzzwords, no hype.
- **Sentence case everywhere** — headlines, buttons, nav. Not Title Case, except named products (*Project Execution*, *Cost Management*) and proper nouns (*Procore*, *Procore AI*, *Groundbreakers*).
- **No full stops on CTAs** ("Request a demo", "See pricing"). Em-dashes for rhythm. Digits in headlines ("500+ integrations").
- **No emoji, ever.** No exclamation marks, no ALL CAPS shouting. Smart curly quotes only.
- Localisation: British/Australian spelling by default (*maximise, optimise, centralise*) unless the audience is US-based.

Tone targets: Professional 9/10, Warm 6/10, Playful 1/10, Technical 5/10, Energy medium.

---

## 2. Color tokens

Warm and earthy — not cool-tech SaaS blue-grey. Orange is used sparingly and with conviction; never gradiated.

| Token | Hex | Usage |
|---|---|---|
| Procore Orange | `#FF5200` | Primary brand color — buttons, links, hex mark, eyebrows |
| Orange hover | `#E64A00` | Primary button hover |
| Orange pressed | `#C84100` | Primary button press, active link |
| Orange tint | `#FFE9DD` | Subtle surface tint, text selection |
| Ink | `#1A202C` | Dark brand color — footers, dark hero sections, sidebar |
| Black | `#000000` | Primary text |
| Sand 50 | `#FBF8F4` | Marketing page background |
| Sand 100 | `#F5F1ED` | Secondary button background |
| Sand 200 | `#ECE0D6` | Secondary surface / secondary button hover |
| Sand 300 | `#DCCEBE` | — |
| Sand 400 | `#BFAFA0` | — |
| Gray 50 | `#F7F8FA` | In-app subtle background |
| Gray 100 | `#EEF0F3` | Row hover, light dividers |
| Gray 200 | `#E1E4E8` | Default border |
| Gray 300 | `#C7CCD3` | Strong border |
| Gray 400 | `#9AA1AB` | Subtle text |
| Gray 500 | `#6B7380` | Muted / secondary text |
| Gray 600–900 | `#4A525E → #14171D` | In-app sidebar / deep UI surfaces |
| Info (link, in-app) | `#2E6FE6` | Tag chips, in-app links |
| Success | `#1F8A5B` | "Open" / done status |
| Warning / Due | `#E5A100` | "Due today" status |
| Danger | `#D32F2F` | "Overdue" status |

Rules: solid color blocks only, edge-to-edge — **no gradients** on flat surfaces. Cool grays are for in-app product only, never marketing. Marketing surfaces alternate sand `#FBF8F4` and white in giant vertical sections.

---

## 3. Type

- **Headings/display:** Pitch Sans (proprietary) — substitute **Inter Tight**.
- **Body:** Inter Tight.
- **Wordmark:** Procore Sans (proprietary) — substitute Inter Tight.
- **Mono/accent:** DM Mono (Google Fonts) — the brand-deck-approved pairing is **Inter Tight + DM Mono**.
- Headings are **medium weight (500)**, not bold — Procore scales with size, not weight.
- Tracking: `-0.02em` on display sizes, default on body.
- `text-wrap: balance` on headlines, `pretty` on paragraphs.

| Token | Size | Use |
|---|---|---|
| Display XL | clamp(56–96px) | Hero headline |
| Display L | clamp(40–72px) | Section headline |
| Display M | clamp(32–56px) | Sub-section headline |
| H1 | 44px | Page title |
| H2 | 32px | Section title |
| H3 | 24px | Subsection |
| H4 | 20px | Card/group title |
| Body LG | 18px | Lead paragraph |
| Body | 16px | Default text |
| Body SM | 14px | Secondary text |
| Caption | 12px | Meta, labels |
| Overline | 11px | Uppercase eyebrow label |

1920×1080 slide scale: Title 160px / H1 96px / H2 64px / H3 40px / Body 28px / Eyebrow 18px.

Font weights: regular 400, medium 500, semibold 600, bold 700. Line-heights: tight 1.05, snug 1.2, normal 1.4, relaxed 1.55.

---

## 4. Spacing, radii, shadows, motion

**Spacing** (base 4): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px.

**Radii** — Procore is largely square; radius lives on buttons and chips only:
| Element | Radius |
|---|---|
| Section blocks / containers | 0 |
| Marketing buttons | 4px |
| In-app cards & inputs | 8px |
| Status pills, avatar chips | 999px (full round) |

**Shadows** — subtle, neutral, never colored/glowing:
- Raised card: `0 1px 3px rgba(20,23,29,.08)`
- Modal: `0 24px 64px rgba(20,23,29,.18)`

**Borders:** 1px solid `#E1E4E8` — the standard divider. Cards use a border *or* a shadow, never both.

**Motion:** restrained only — cross-fades, simple reveals. Easing `cubic-bezier(0.2,0,0,1)`. Durations 120/180/280ms. No bounce, no overshoot, no rotation.

**Hover/press:** primary button darkens orange→`#E64A00`(hover)/`#C84100`(press), 1–2px translateY down on press, no scale. Links underline + darken. Cards/rows get a flat gray-100 fill on hover — no shadow growth, no scale.

---

## 5. Imagery & iconography

- Full-bleed photography of real construction sites — warm-toned, naturally lit, people-central, hi-vis orange/yellow, diverse crews. **Never B&W, grainy, moody, or heavily filtered.**
- The orange hexagon is the brand's geometric primitive — a quiet anchor beside/above headlines, never carrying text.
- Two icon systems: (1) large 96×96 flat-orange illustrative icons with a dotted/textured fill for marketing personality tiles; (2) small 16–24px monochrome solid-fill functional icons for in-app/footer chrome. Where a functional mark is missing, substitute **Lucide** at 1.5px stroke and flag it.
- No emoji anywhere, in any surface.

---

## 6. Component patterns

**Buttons** — 4 variants, 3 sizes (sm/md/lg), `border-radius: 4px`, `font-weight: 600`, Inter Tight, transition `180ms cubic-bezier(.2,0,0,1)`:

```css
/* primary */
background: #FF5200; color: #fff;
background:hover #E64A00; background:press #C84100;
/* secondary */
background: #F5F1ED; color: #1A202C; background:hover #ECE0D6;
/* ghost */
background: transparent; color: #1A202C; border: 1px solid #1A202C;
background:hover #1A202C; color:hover #fff;
/* link */
background: transparent; color: #FF5200; text-decoration:hover underline;
```
Sizes: sm `8px 14px`/14px type · md `12px 20px`/15px type · lg `14px 24px`/16px type.

**Cards:** white surface, 8px radius in-app / 0–4px marketing, padding 16/20/24px by density, border OR shadow never both.

**Status chips (in-app):** fully rounded (999px), color-coded — Open/done green `#1F8A5B`, Due today amber `#E5A100`, Overdue red `#D32F2F`.

**Layout rhythm:** marketing = giant alternating sand/white vertical sections, loose 12-col grid, 24–32px gutters, generous whitespace above/below display type. Wordmark always top-left with healthy padding. Primary CTA is always orange.

---

## 7. Document & SOP output requirements

When producing a Standard Operating Procedure, work instruction, report, or other structured document for Procore, apply the same tokens as a fixed document system:

- **Header:** Procore wordmark top-left on every page, healthy padding, sand `#FBF8F4` or white background.
- **Type hierarchy:** document title in Display M/H1 (Inter Tight, medium weight, sentence case); section headers H2/H3; body copy 16px/1.55 line-height, `text-wrap: pretty`.
- **Color use:** orange `#FF5200` reserved for the title accent, section numbering, or callout labels — never as a full-page wash. Body text on white or sand-50; ink `#1A202C` for dark section dividers if needed.
- **Structure:** numbered sections with sentence-case headings, short paragraphs, bulleted steps over dense prose. Status/callout boxes use the semantic colors (info blue, success green, warning amber, danger red) with a 1px border, not filled blocks.
- **Footer:** page number + document title, small caption-size type (12px), gray-500 `#6B7380`.
- **Voice:** apply Section 1 rules verbatim — second person, sentence case, no emoji, no exclamation marks, outcome-first phrasing for any instructional copy ("Do this to keep the schedule on track", not generic filler).
- **Fonts:** Inter Tight throughout (headings medium 500, body regular 400); DM Mono only for code/config values or field labels that call for a technical feel.

This keeps any generated SOP or document visually and verbally identical to Procore's marketing and product surfaces — same tokens, same voice, different container.

---

## 8. Caveats

- **Pitch Sans** and **Procore Sans** are Procore-proprietary and not distributable — Inter Tight substitutes for both everywhere in this system. Swap in the licensed faces for production if you have access.
- Reverse-engineered from the `procore.com/en-au` marketing site plus a Procore presentation brand-deck PDF; no Figma or app codebase was available, so in-app specifics are best-effort.
- Functional icons not present in brand source material are substituted from Lucide (lucide.dev) and should be flagged as such if it matters to the audience.
