# Procore SOP — Brand & format specification

This is the authoritative brand + format spec for a Procore Standard Operating
Procedure (SOP). The output is always **one self-contained, print-ready HTML file**.
Pair this with `assets/sop-skeleton.html` (the fillable starter) — its `<style>` block
already implements every token and component below; **do not change `:root` token
values**.

---

## Output contract

1. Produce **ONE** full HTML file in a single code block — savable as `.html` and
   printable as-is. No commentary inside the code block.
2. Page size: **US Letter portrait, 816 × 1056 px @ 96dpi** (8.5″×11″). Each page is an
   `<article class="page">`.
3. Include `@page { size: letter portrait; margin: 0 }` and a `@media print` block
   (white background, no shadows, page sized in inches). Already in the skeleton.
4. Every page carries a fixed **HEADER** (Procore wordmark left; doc title + ID right)
   and **FOOTER** (confidential mark; revision; "NN / NN" page number).
5. Default to **4 pages** — Cover · Overview · Procedure · Close-out — but add or remove
   content pages to fit the material.
6. Use supplied content verbatim where given. Where a fact is missing, insert a
   **placeholder** (see below). **Never invent** customer names, dates, IDs, SLAs or
   commitments.
7. Keep all CSS in one `<style>` block in `<head>`. **No JavaScript.** Load fonts from
   Google Fonts.

## Fonts (already linked in the skeleton)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet">
```

- **Inter Tight** → all headings + body.
- **DM Mono** → step numbers, codes, IDs, monospace accents.
- Procore's proprietary Pitch Sans / Procore Sans are not redistributable — Inter Tight
  is the approved substitute.

## Brand rules

- **Colour:** white pages, ink text `#1A202C`, **Procore Orange `#FF5200`** for accents
  ONLY — eyebrows, the hex mark, step numbers, the left edge of sand panels, links. Warm
  **sand `#FBF8F4`** for highlight panels. Grays for rules and secondary text. Semantic
  green `#1F8A5B` (approved), blue `#2E6FE6` (info), amber `#E5A100` (due), red `#D32F2F`
  (overdue). Do not introduce other colours. **No gradients.**
- **Shape:** largely square. Radius only on buttons (4px) and status pills (999px). 1px
  rules in gray-200. Sand panels carry a 3–4px orange left edge.
- **Type:** Inter Tight, tight tracking on headings (−0.02em). Cover title ~44pt/500;
  section title 20pt/500; subhead 12.5pt/600; body 9.5–10.5pt; eyebrows uppercase
  8.5pt/700 with 0.12em tracking in orange. Mono for numbers/IDs.
- **Hex mark (◈):** the recurring brand motif — use it in eyebrows and the footer
  (`<span class="hex"></span>`, already styled).
- **Voice:** plain, direct, Australian English, construction-industry register. Use real
  Procore tool names (RFIs, Submittals, Inspections, Drawings, Directory, Workflows,
  Inbox, Reports, Closeout) and in-app vocabulary. No marketing fluff, no emoji.
- **Density:** this is a working document. Prefer tables, numbered steps and checklists
  over prose. **Never set body text below 9pt.**

## Placeholders — for any fact not supplied

- Inline: `<span class="ph">[Customer name]</span>` (tinted, italic, light orange wash)
- Field value: `<span class="placeholder">[Role · Name]</span>`
- Use obvious square-bracket labels: `[Customer name]`, `[Process]`, `[DD Mmm YYYY]`,
  `[Tool name]`, `[X business days]`, `[SOP-PRC-000]` — easy to find and fill.

## Component library (all styled in the skeleton)

- **Cover:** orange eyebrow + hex · big title · sub · sand `cover-meta` grid (Customer /
  Process owner / Version·Status / Effective) · `doc-control` table.
- **Section head:** orange eyebrow ("Section 0N · Name") · `h1.section-title` · `.lead` ·
  optional right-hand sand `.meta` note (`.page-intro`).
- **Roles & responsibilities** table (`.roles`): Role | Procore permission | Responsibility.
- **Process at a glance** (`.phases`): 4 chips, mono "PHASE 0N", name, one-line description.
- **Numbered steps** (`.steps`/`.step`): big mono number · title · meta pills
  (role / system / time) · prose + bullets · optional `.callout` ("Procore"/"Tip", with
  `<code>` for UI paths).
- **Close-out checklist** (`.checklist`): square box · text + hint · owner initials.
- **Issues & resolution** table (`.issues-table`): mono ERR-0N | Issue | Resolution.
- **References list**, **Revision history** table, **Approvals sign-off** blocks (`.signoff`).
- **Status pill** (`.pill-status.draft` / `.approved`).

## Quality bar

- Content must fit within each page's body area — never overflow the 1056px page or let
  the footer collide with content. **Split across pages instead.**
- Tables: uppercase 8pt gray header on gray-50 fill; 1px gray-200 row rules.
- Keep one consistent doc ID and version in **every** header/footer.
- If given a transcript, extract real steps/roles/SLAs from it; mark gaps as placeholders.
