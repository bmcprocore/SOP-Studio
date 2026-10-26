# The content contract — every field, and what it becomes

This is the only thing you author: **one JSON file**. `scripts/render.js` turns it into the
finished document. You never write HTML.

Unknown value → empty string `""`. It renders as a visible orange placeholder, which is the
point: a gap the human can see and fill beats a plausible invention.

---

## The document has four parts

| Part | What the reader sees | Fields that fill it |
|---|---|---|
| **Cover** | Title, customer, ownership, approvals | `processName` `subtitle` `customer` `docId` `version` `status` `processOwner` `effectiveFrom` `approvals` |
| **Section 1 · Overview** | Why this exists, and **what you are allowed to do** | `purpose` `appliesTo` `access` `phases` |
| **Section 2 · Procedure** | The steps, one per page | `procedureIntro` `referenceTool` `steps` |
| **Section 3 · Close out** | Sign-off checklist, troubleshooting, approvals | `closeoutIntro` `owner` `checklist` `issues` `references` |

---

## Cover

| Field | Type | Notes |
|---|---|---|
| `docId` | string | e.g. `SOP-RFI-001`. Appears in every page header. |
| `version` | string | `"1.0"`. Appears in every footer. |
| `status` | string | `draft` \| `in-progress` \| `review` \| `approved`. **New SOPs are always `draft`.** |
| `customer` | string | The client's name. |
| `processName` | string | The big cover title, e.g. `"RFI management"`. |
| `subtitle` | string | **Name the persona explicitly** — "User guide for Site Engineers (Standard permission) raising RFIs in Procore, authored for [Client]." |
| `processOwner` | string | `"Name · Role"`. |
| `effectiveFrom` | string | `"DD Mmm YYYY"`. |
| `appliesTo` | string | Business unit / region / project type. Renders in Section 1. |
| `approvals` | object | `preparedBy`, `reviewedBy`, `approvedBy`, `scheduledReview` — each `{name, date}`. Person fields are `"Name · Role"`. |

## Section 1 · `access` — the most important object in the file

This fills the **"Your access in this tool"** panel. It is what makes the document an SOP rather
than a generic manual. If it is empty, the section prints bare placeholders and the document has
failed at its one job.

```json
"access": {
  "tool": "RFIs",
  "level": "Standard + RFI Manager rights",
  "levelMeaning": "You manage the full lifecycle of RFIs you create or are designated RFI Manager for — opening, numbering, distributing, chasing, marking the official response and closing.",
  "granular": [
    { "name": "Act as RFI Manager",
      "meaning": "Open, number and distribute RFIs you create or manage; set assignees and due dates; close RFIs." }
  ],
  "notIncluded": [
    "Edit, reopen or delete other users' RFIs — RFIs Admin.",
    "Configure tool settings or the permissions table — RFIs Admin."
  ]
}
```

- `level` — the reader's permission in the client's own words, so it matches their screen.
- `levelMeaning` — written in **second person** ("You can…"), plain language, no jargon.
- `granular` — only the granular permissions this reader actually holds. Use Procore's exact
  wording; `docs/procore-permission-reference.md` has it captured from a live instance.
- `notIncluded` — renders as the **"Outside your access"** callout. Each line names the boundary
  *and who does it instead*, so the reader always knows where the work goes next.

On Route A this object is copied straight from the persona in the master library. On Route B you
write it — and if you do not know the client's permission setup, **ask**.

## Section 1 · the rest

| Field | Type | Notes |
|---|---|---|
| `purpose` | string | Why the process exists and what good looks like. 3–5 lines. |
| `phases` | array of **exactly 4** | `{name, desc}` — the four chips in "Process at a glance". One line each, naming the role that acts. |

## Section 2 · Procedure

| Field | Type | Notes |
|---|---|---|
| `procedureIntro` | string | Sets up the steps. On Route A the persona's "cannot do" statement is appended here automatically. |
| `referenceTool` | string | e.g. `"Procore · RFIs (web & mobile)"`. |
| `steps` | array | One step per page. |

Each step:

| Field | Notes |
|---|---|
| `_id` | `S01`, `S02`… **Keep these stable across versions** — they are the join key for the future client workflow map. |
| `title` | One action. If it needs "and", it is probably two steps. |
| `role` | Who performs it — `"RFI Creator"`, `"RFI Manager"`, `"All users"`. |
| `system` | Where it happens — `"Procore · RFIs"`, `"Site / drawings"`. |
| `time` | Realistic, e.g. `"~5 min"`, `"ongoing"`. Omitted at `simple` detail. |
| `body` | 1–3 sentences, instruction-based, second person. |
| `bullets` | Optional. Sub-actions or checks. Omitted at `simple`. |
| `callout` | Optional `{label, body}`. Omitted at `simple`. |

**Callout labels that carry meaning** — use these rather than inventing new ones:

- `Handoff` — control passes to someone else here.
- `Scope` — a limit on what this permission reaches.
- `Cannot do` — a boundary the reader will otherwise walk into.
- `Why it matters` — the commercial or contractual consequence.
- `Note` / `Tip` — everything else.

## Section 3 · Close out

| Field | Notes |
|---|---|
| `closeoutIntro` | How to use the checklist, and where to go when something does not behave as described. |
| `owner` | Who owns the close-out. `"Name · Role"`. |
| `checklist` | `{_id (C01…), text, hint, owner}`. `owner` is the role that signs it off. |
| `issues` | `{_id (E01…), code (RFI-01…), issue, resolution}`. **Only issues this reader can actually resolve.** Omitted entirely at `simple` detail. |
| `references` | `{tool, url}` — support.procore.com links. |

## Control fields (read by the tooling, not printed)

| Field | Notes |
|---|---|
| `_detail` | `simple` \| `standard` \| `extended`. See below. |
| `_region` | `"APAC"` prints A4. Anything else prints US Letter. **AU/NZ clients need `"APAC"`.** |
| `_persona` | Which persona this was scoped to. Set by `split-by-role.js`. |
| `_role` | Set only when a role narrowing was applied. |
| `_perm` | On library blocks only — `{min, granular}`. The renderer ignores it. |

## Detail levels

| Level | Steps | Bullets & callouts | Issues table |
|---|---|---|---|
| `simple` | Short bodies, 1–2 sentences | None | None |
| `standard` | One step per page | As authored | Yes |
| `extended` | Expanded, with common-mistake callouts | Required | Yes |

---

## How to write it

- **Second person, present tense.** "Open the RFIs tool and select Create" — not "the user should
  open…". Written for the person doing the task at the time they are doing it.
- **Australian / New Zealand construction English.** Programme, variation, head contract, defect,
  site diary, progress claim. Use Procore's real tool names for the client's account type.
- **One action per step.** Decisions and approvals are their own steps.
- **Plain language.** Assume moderate Procore knowledge and no project-management theory.
- **Density over prose.** This is a working document, not a white paper.
- **Inline markup: `<code>`, `<strong>`, `<em>` only.** `<code>` for anything the reader clicks or
  types — `<code>+ Create</code>`, `<code>Closed</code>`.
- **Placeholders stay bracketed** — `[X business days]`, `[Customer escalation]` — until someone
  supplies the real value.

## Two fields the browser app supports and `scripts/render.js` does not

`clientLogo` (a data-URL logo on the cover) and a per-step `image` object render in
`app/SOP_Studio_v0.1.html` only. The locked design used by `scripts/render.js` ignores both. Do
not promise a client screenshots in a command-line render.
