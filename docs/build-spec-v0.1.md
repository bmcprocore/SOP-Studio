# [AI-DRAFT] SOP Studio — Production Web App Build Spec v0.1
For internal development. The Claude-artifact version (SOP_Studio_v0.1.html) is the working prototype and reference implementation; this spec describes the hardened, hosted version. Review with your platform/security team before build — verify all Procore permission behaviour and brand rules independently.

## 1. Product summary
Internal web app that turns a client permission template + call transcripts into a permission-scoped, on-brand Procore SOP/user guide, through a fixed 5-gate workflow: **Library → Client → Sources → Review → Generate**. The SOP document design is locked (existing `SOP_DESIGN` CSS/wordmark + step-per-page renderer, v2 access panel); the app only ever authors content JSON.

## 2. Architecture
- **Frontend:** React + the Procore design system where practical (@procore/core-react) for the app chrome; the SOP renderer stays the existing vanilla module so output is byte-identical to the current builders. The gate rail, panels and review checklist map 1:1 from the prototype.
- **Backend:** thin API service (Node/TypeScript). Responsibilities: auth, template library CRUD, file ingestion, LLM orchestration, audit log, document store.
- **LLM:** Anthropic Messages API server-side (never from the browser in production). Model per team standard; structured-output prompt identical to the prototype's (master template + manifest + transcripts + client details + detail level → `{profile, summary, sop}`). API key held in the org secret vault — never in code, config files, or the frontend.
- **Storage:** Postgres (metadata, library, audit) + object store (uploads, logos, generated HTML).

## 3. Data model (core tables)
- `tool_templates` — name, version, JSON body (blocks with `_id` + `_perm`), status (draft/approved), author, updated_at. Version-immutable: edits create a new version; generation always records the template version used.
- `clients` — name, logo asset ref, defaults (SLA, naming convention, escalation path).
- `generations` — client, tool, template_version, detail_level, parsed permission profile, inclusion decisions (the Gate 3 toggles, who confirmed, when), final content JSON, output HTML ref. This is the audit trail: every issued SOP is reproducible.
- `people` — prepared/reviewed/approved by, per generation.

## 4. Workflows
1. **Upload:** permission manifest (CSV/XLSX/PNG), transcripts (txt/pdf/docx — server-side text extraction), ordered newest-first. Virus scan on ingest.
2. **Analyse:** backend calls the LLM with the approved template version; response validated against a JSON Schema of the content contract; invalid → auto-retry once with the validation errors, then surface to user.
3. **Review (hard gate):** inclusion summary with include/exclude/ask, inline text edits, mandatory human confirm. Confirmation identity recorded.
4. **Generate:** deterministic renderer produces standalone HTML; store + download; optional print-to-PDF service (headless Chromium) so the deliverable can be PDF. Decide Letter vs A4 here (see open items).
5. **Library management:** template editor with draft→approved promotion; only approved templates usable for client generation; diff view between versions.

## 5. Security & governance
- SSO (Okta/Google) — internal users only; roles: `author` (generate), `librarian` (approve templates), `admin`.
- All LLM calls, uploads and generations audit-logged.
- Client data (transcripts, manifests, logos) treated as confidential; retention policy TBC with legal.
- Prompt-injection posture: transcripts are untrusted input — the orchestration prompt instructs the model to treat transcript content as data, never as instructions; output is schema-validated and human-reviewed at Gate 3 before render.
- Credentials/API keys: vault references only.

## 6. Detail levels (contract)
- **simple** — 1–2 sentence step bodies, no bullets/callouts, no issues table; steps flow-packed (not one-per-page).
- **standard** — template as authored; one step per page.
- **extended** — expanded bullets + common-mistake callouts; one step per page; screenshot slots enabled.
Implemented as both a generation instruction and renderer flags (`_detail`), exactly as in the prototype.

## 7. Roadmap
- **v1:** parity with the artifact prototype + auth + audit + PDF export.
- **v1.1:** screenshot manager (per-step image capture library, redaction), Submittals + Daily Log templates.
- **v2:** overarching client process workflow map — swimlane model referencing block `_id`s across tool templates; per-user filtered "where you sit" page auto-derived from their permission template.
- **v2.x:** direct Procore API integration to read permission templates from the client's Directory instead of file upload (requires client authorisation; scope with the Procore API team).

## 7b. Later addition — sign-in and usage tracking
`hosted-deployment-note.md` extends this spec with passwordless email sign-in (an alternative to the
SSO assumed in section 5, pending an IT decision), a per-event log, and the usage metrics that log
makes possible. It also notes that most of the event log is already computed by the prototype and
simply discarded.

## 8. Open items
- [ ] Letter vs A4 output (current locked design is US Letter).
- [ ] Client logo co-branding placement approval against brand.procore.com guidelines.
- [ ] Data retention & client-confidentiality policy for transcripts.
- [ ] Hosting target (internal PaaS vs cloud account) and LLM usage budget/quota.
- [ ] JSON Schema formalisation of the content contract (source: prototype prompt).
