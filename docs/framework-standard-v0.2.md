# [AI-DRAFT] Procore SOP Builder — Framework & Standard v0.2
**Pilot tool: RFIs** · Supersedes v0.1 · Draft for internal review

**Locked decisions (this version):**
- **One SOP document per tool, per permission persona** (tool-by-tool confirmed).
- **Output format:** the locked SOP Builder HTML templates (condensed / step-per-page / step-per-page + images). The design is never modified — only the content JSON is authored.
- **Brand:** the locked templates carry the Procore design (orange `#FF5200`, ink `#1A202C`, Inter Tight / DM Mono, hex mark + wordmark). Reference: brand.procore.com.

---

## 1. How the system works

One **master content library per tool** — a JSON file in the *exact schema the SOP builders consume*, with two additions the renderer safely ignores:

- Every step, checklist item and issue carries a `"_perm"` tag: `{ "min": "ReadOnly" | "Standard" | "Admin", "granular": "…" }`.
- A `"_personas"` map lists, for each standard persona, exactly which block IDs are in scope, plus its "cannot do" statement.

Because the builders ignore unknown JSON keys, the master library **is already valid builder input** — generating a persona SOP is a *filtering* exercise, never a writing exercise. Nobody authors content per user; the library is authored once per tool and maintained centrally.

---

## 2. The 4-Gate pipeline (team standard)

**Gate 1 — Upload.** Team member provides: client's permission template (export/screenshot, or the intake table below), tool selection, client name, and the builder variant.

| Tool | Base level (None / Read Only / Standard / Admin) | Granular permissions enabled |
|---|---|---|
| RFIs | | |

**Gate 2 — Parse & Summarise.** The builder (Claude) matches the permission profile to the closest persona in the tool's master library and produces the **Inclusion Summary** — a table of every block: ✅ Included / ⛔ Excluded (with the permission rule) / ❓ Ask (client-config dependent). Nothing is generated yet.

**Gate 3 — Edit & Confirm.** Team member toggles blocks, supplies client-specific values (naming convention, SLA days, escalation path — every `[bracketed]` placeholder), and confirms. *Generation never proceeds without this confirmation.*

**Gate 4 — Generate.** Assemble the persona JSON: keep in-scope blocks, fill cover fields, leave genuinely unknown values as empty strings (they render as `.placeholder` — never invent names, dates, SLAs, IDs). Paste into the chosen builder → Render preview → Download. File naming: `Client_Tool_Persona_vX.Y_YYYYMMDD.html` matching the `docId`.

---

## 3. Builder variant selection (default standard)

| Variant | Use when | Default for |
|---|---|---|
| **Condensed** | Quick-reference SOP; experienced users; print handout | Read Only / responder personas |
| **Step-per-page** | Training delivery; one action per page | Standard & Manager personas without screenshots |
| **Step-per-page + images** | Full user guide with Procore screenshots per step | Client-facing user guides (preferred final deliverable) |

All three consume the **same JSON** — a persona's content is authored once and can be issued in any variant.

## 4. Content JSON contract (fixed — matches the locked builders)

Top level: `docId, version, status(draft|in-progress|review|approved — new SOPs never "approved"), customer, processName, subtitle, processOwner, effectiveFrom, appliesTo, approvals{preparedBy,reviewedBy,approvedBy,scheduledReview:{name,date}}, purpose, roles[], phases[4], procedureIntro, referenceTool, steps[], closeoutIntro, owner, checklist[], issues[], references[]`.
Step: `title, role, system, time, body, bullets[], callout{label,body}` (+ `image{src,caption}` in the images variant). Inline `<code> <strong> <em>` only. Person fields are `"Name · Role"`.

**Persona conventions (because the template has no dedicated permission section):**
- The persona's **"cannot do"** statement goes into `procedureIntro` and/or a `callout` labelled `Cannot do` on the relevant step.
- **Handoffs** are expressed as a `callout` labelled `Handoff` on the step where control passes.
- The **roles table always shows all four roles** (even in a Read Only guide) so every persona sees the full accountability chain — their own role is what the steps then cover.
- `subtitle` states the persona explicitly, e.g. *"User guide for Site Engineers (Standard permission) raising RFIs in Procore, authored for [Client]."*

## 5. Standard persona set (applies to every tool)

| Persona | Typical profile | Guide depth |
|---|---|---|
| P1 Responder | Read Only / distribution member | Respond + track only |
| P2 Doer | Standard | Create/draft workflow + respond + track |
| P3 Manager | Standard + tool's manager granular permission | Full lifecycle they control |
| P4 Admin | Admin | Everything + configuration + controls |

A client permission template is mapped to the **closest persona, then adjusted** — granular permissions add/remove individual blocks; the Inclusion Summary shows every adjustment.

## 6. RFI pilot — delivered

`RFI_master_library_v0.1.json` contains the full RFI lifecycle (S01–S10), permission-tagged, with the four-persona assembly map, checklist (C01–C06), issues (RFI-01–05) and references. **"Ask" items surfaced at Gate 3 for RFIs:** default RFI Manager enforced? · private RFIs enabled? · email-in responses enabled? · cost/schedule impact fields on? · SLA days · naming convention · escalation path · deletion approval rule.

> ⚠️ Verify S02–S04 behaviour (draft-only creation for Standard; manager scope limited to owned/managed RFIs) against the current APAC RFIs permissions matrix before first client release, and re-verify at each Procore release that touches RFIs.

## 7. Replicating to the next tool

1. Pull the tool's User Permissions matrix + granular permissions FAQ (APAC support site).
2. Copy `RFI_master_library` as the skeleton; rewrite steps for the tool's lifecycle, tagging `_perm` per the matrix.
3. Define the persona map + "Ask" list; write each persona's `cannot_do`.
4. Dry-run all four personas through Gates 2–4; render in the step-per-page builder and review.
5. Version the library `Tool_master_library_vX.Y.json` in the shared repository. Tool is live.

Suggested order: **Submittals → Daily Log → Documents/Drawings → Inspections → Commitments/Change Events.**

## 8. Future stage — client process workflow overlay

The `_id`s (S01…) are the join key. The overarching client workflow map will reference step IDs across tool libraries; a user's permission template then filters the master map to "your steps" automatically — same mechanism, one level up. Keep IDs stable across library versions.

## 9. Open items

- [ ] Verify RFI library against current APAC permissions documentation (owner: implementation lead).
- [ ] Print format: the locked templates are US Letter (`@page size:letter`, 816×1056px). Confirm acceptable for AU/NZ clients or schedule an A4 variant of the locked design.
- [ ] Confirm whether generated SOPs may carry client logos alongside the Procore wordmark (brand.procore.com co-branding rules).
- [ ] Agree the shared repository location for master libraries and issued SOPs.
- [ ] Screenshot standard for the images variant: capture size, redaction of client data, caption convention (suggest `Fig. S02-1 · RFIs → Create`).
