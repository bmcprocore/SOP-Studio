---
name: procore-sop-builder
description: >-
  Creates and updates Procore Standard Operating Procedures (SOPs) and user guides as
  single, print-ready, on-brand HTML documents (US Letter portrait). Use whenever the
  user asks to write, draft, format, or restyle a Procore SOP, work instruction, or
  process guide — especially when turning call transcripts, workshop notes, or an
  existing draft into a structured, role-based SOP that follows Procore brand and design
  guidelines. Built for the Procore Implementation / GPS APAC team.
license: Internal — Procore. For implementation use.
---

# Procore SOP Builder

Turn process knowledge (transcripts, notes, an existing draft, or a verbal brief) into
**one self-contained, print-ready HTML SOP** that exactly matches Procore's brand and a
fixed 4-page document format.

## What this produces

A single `.html` file the user can open and print to PDF:

- **US Letter portrait, 816 × 1056 px @ 96dpi**, fixed header/footer on every page.
- Default **4 pages**: Cover · Overview · Procedure · Close-out (add pages as needed).
- Procore brand locked in: Inter Tight + DM Mono, orange `#FF5200` accents only, sand
  panels, square geometry, the hex mark, Australian-English construction voice.
- Missing facts rendered as obvious **placeholders** — never invented.

## How to use this skill

1. **Read `references/brand-and-format.md`.** It is the authoritative output contract,
   brand rules, component library, and quality bar. Follow it exactly; do not change the
   design token values.

2. **Start from `assets/sop-skeleton.html`.** It is a complete, on-brand starter whose
   `<style>` block already implements every token and component, with the Procore
   wordmark embedded. Copy it, then replace the `[bracketed]` text and `.ph` /
   `.placeholder` spans with real content. Repeat the `<header>`/`<footer>` on every page
   and bump the page number. **Do not edit `:root` token values.**

3. **If the user supplies transcripts or asks for a full content build, also read
   `references/authoring-brief.md`.** It governs *how content is researched and
   structured*: the source-priority hierarchy (newest transcript wins; Procore APAC docs
   only fill gaps), the required section structure (Overview → Scope → Roles →
   Process → Cross-role impact → System instructions → Reporting → Exceptions → Best
   practice), and the cross-role dependency / risk outputs. Map each required output into
   pages/sections of the skeleton.

4. **Apply strong defaults; only deviate when asked.** Ask brief clarifying questions
   only if the *process itself* is unclear — otherwise produce the document and use
   placeholders for missing facts.

5. **Deliver one HTML file in a single code block.** No commentary inside the block.

## Decision guide

- **"Format / restyle / brand this SOP"** → brand-and-format.md + skeleton only.
- **"Build an SOP from this transcript / these notes"** → brand-and-format.md + skeleton
  + authoring-brief.md (research, structure, role mapping, risk & dependency outputs).
- **"Add a page / change the doc ID / split by role"** → reuse the skeleton's components;
  keep one consistent doc ID and version across every header/footer.

## Hard rules (most-violated first)

- **Never invent** customer names, dates, doc IDs, SLAs, approvals, or commitments —
  use placeholders.
- **Never change** the `:root` design tokens or introduce off-brand colours/gradients.
- **Never set body text below 9pt**; never let content overflow a page — split instead.
- **No JavaScript** in the output; all CSS stays in one `<style>` block.
- Keep the **doc ID and version consistent** in every header and footer.

## Files

- `references/brand-and-format.md` — output contract, brand tokens, components, quality bar.
- `references/authoring-brief.md` — content research + SOP structure rules (for transcript builds).
- `assets/sop-skeleton.html` — the fillable, on-brand 4-page HTML starter (wordmark embedded).

## Google Gem workflow (transcript / NotebookLM → JSON → SOP)

For teams who want to generate SOPs outside Claude: `prompts/procore-sop-gem-system-prompt.md`
is a Gem system prompt that turns an uploaded call transcript or pasted NotebookLM notes into
ONE JSON object (schema in `prompts/procore-sop-json-schema.md`) — never HTML, never invented
facts. Paste that JSON into `SOP JSON Loader.html` (project root) to instantly render the
on-brand SOP in-browser, then print to PDF. Use this path when the user wants a repeatable,
no-Claude-chat way to turn transcripts into SOPs; use the Document OS + Authoring Brief prompts
(or this skill directly) when they're already working with Claude.
