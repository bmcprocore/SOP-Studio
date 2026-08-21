# Procore SOP Studio — version history

A plain-language record of what changed in each version and why. Written for internal
circulation; no technical knowledge assumed.

| Version | Date | In one line |
|---|---|---|
| 1.0 | — | Original Studio, authored by Brendan McGurk |
| 2.0 | — | Colleague's adapted version, as received |
| 3.0 | 20 Aug 2026 | Second SOP system merged in; role-specific guides |
| 3.1 | 20 Aug 2026 | Interface rebuilt to the Procore design system |
| 3.2 | 20 Aug 2026 | Studio logo throughout; wider workflow rail |
| 3.3 | 20 Aug 2026 | Tells you when it cannot run |
| 3.4 | 20 Aug 2026 | Author attribution — in the tool, not the document |
| 3.5 | 20 Aug 2026 | **Approval enforced; permission scoping made real** |
| 3.6 | 20 Aug 2026 | Save an SOP back as a template; templates finally persist |
| 3.7 | 20 Aug 2026 | Sections outline with tick-to-include and drag-to-reorder |
| 3.8 | 20 Aug 2026 | Region selector and regional terminology |
| 3.9 | 21 Aug 2026 | Permission upload, layout previews, overrides, gated delete |
| 3.10 | 21 Aug 2026 | Collapsible review; customer-segment file naming |
| 3.11 | 21 Aug 2026 | Procore tool names adapt to the customer's account type |

---

## 1.0 — Original

The first Studio, authored by Brendan McGurk and given to a colleague. It is not held in
this repository, so nothing further is recorded about it here.

## 2.0 — As received from the colleague

The colleague's adapted version, returned as a set of 18 files and kept frozen as the
reference point. Everything below is measured against it.

What it already did well, and what has been preserved throughout:

- The document design is locked and cannot be edited by accident. Nobody writes layout —
  they write content, and one renderer draws every SOP identically.
- Anything unknown prints as a visible placeholder instead of being invented.
- Sections can be reordered and excluded, and that carries through to the PDF.
- The whole tool is a single file that runs in a browser with no installation.

Known weaknesses at 2.0, all since addressed: the mandatory approval step could be skipped
entirely, there was nowhere to enter a client's permissions, and the review screen showed
what each section was rather than why it was included.

---

## 3.0 — Second SOP system merged in

- Imported the GPS APAC package: the SOP builder skill, the transcript-to-SOP prompts, the
  offline JSON loader, the Procore design system reference, and two real client SOPs.
- Added role-specific guides: one master process can be split into a separate guide per job
  role, at a chosen level of detail, keeping the steps that role performs plus the steps
  everyone performs.
- Established that job role is the backbone and permission level is an attribute of a role —
  a payroll administrator and a director may hold the same Procore permission and still need
  different guides.

## 3.1 — Interface rebuilt to the Procore design system

- Corner rounding, button styling, spacing and motion now follow Procore's published rules
  rather than ad-hoc values. Eight different corner radii were replaced by the four the
  system defines.
- Buttons gained the correct hover and pressed colours; previously pressing a button showed
  no visible change at all.
- Headings set in medium weight rather than bold, per the brand rules.
- The SOP document design was not touched.

## 3.2 — Studio logo and a wider rail

- The plain orange hexagon was replaced throughout by the SOP Studio logo, including the
  browser tab icon.
- The workflow rail on the left was doubled in width so the step names are readable.
- Each step now fills the window until something has been rendered, so moving between steps
  visibly changes the screen.

## 3.3 — Tells you when it cannot run

- If the Studio is opened somewhere that blocks scripts — a preview pane, a document viewer —
  it now says so in a banner instead of silently ignoring every click.
- Workflow navigation was made resilient so it keeps working even if something else fails
  during start-up.

## 3.4 — Author attribution

- Added: "Created by Brendan McGurk · APAC Strategic Product Consultant · Questions or
  support: message me on Slack, or post in the SOP Studio channel".
- Briefly placed in the SOP document footer, then corrected: it appears **only in the Studio
  interface** and never on an SOP issued to a customer. The document design was returned to
  its 2.0 state.

## 3.5 — Approval enforced, permission scoping made real

The most significant release, following a full interface and experience audit.

- **The approval step can no longer be skipped.** Previously a finished PDF could be produced
  and downloaded without anyone opening the review screen. Nothing can now be generated until
  the section list is explicitly confirmed, and who confirmed it and when is recorded on the
  document.
- **Permissions can now actually be entered.** The tool promised permission-scoped SOPs but
  had no way to specify a reader's permissions, so every SOP was scoped to the template
  default. There is now a Permissions step with base level and granular permissions.
- **The review screen shows the reason.** Each section states the rule that kept or dropped
  it. Dropped sections stay visible so you can see what the reader will not receive.
- The workflow was split so each step does one job.

## 3.6 — Templates that persist, and can be created from an SOP

- A tickbox on the Generate step saves the SOP back to the library as a reusable template.
  The template keeps every section, including ones this reader's permissions excluded, so it
  still serves other roles. Client name, logo, dates and sign-off names are never carried over.
- **Fixed: nothing saved to the library was being kept.** The library used a store that only
  exists when the Studio runs inside Claude, so every save silently failed when the file was
  opened normally. Templates now persist, and the tool states whether they are held on that
  computer or shared with the team.

## 3.7 — Sections outline

- The review step gained a panel on the left listing every section with a tickbox and a drag
  handle, with the reasoning alongside it on the right.
- Both stay in step with each other. Sections dropped by the permission rule appear struck
  through, so what is missing stays visible.

## 3.8 — Region and terminology

- A region selector — APAC, NAMER, TBC — on the Create step.
- Construction terminology is swapped to suit the region. Templates are authored in APAC
  terms; selecting NAMER converts them, for example head contract to prime contract.
- Only terms on the approved list are ever changed; anything not listed is left exactly as
  written rather than mistranslated. The list currently holds one confirmed pair and awaits
  the full terminology reference.

## 3.9 — Permission upload, previews, overrides, protected delete

- **Upload a permission template.** A text or CSV export is read and sets the permission level
  for you. A screenshot is recorded as the source but the level is left for you to set, since
  an image cannot be read reliably in a browser.
- **Layout previews.** Under the detail level, a small generic picture of what Simple,
  Standard and Extended each produce — shapes only, no content.
- **Overrides.** A section dropped by the permission rule can be put back deliberately. It is
  flagged in the interface and recorded on the document, so it is never a silent change.
- **Protected delete.** Templates can be deleted, behind a password. This is a deterrent
  against an accidental deletion, not security — the password is readable by anyone who opens
  the file in a text editor.

## 3.10 — Review usability and file naming

- The three review groups collapse, and the sign-off block stays fixed to the bottom of the
  panel. Previously the confirmation was buried beneath twenty-one rows and was hard to find.
- Each group header shows how many of its sections are included.
- A customer-segment selector on the Generate step — SMB, Commercial, Enterprise, Strategic —
  which sets the file name prefix: SMB-, COMM-, ENT-, STR-. The resulting file name is shown
  before you download.

## 3.11 — Procore tool names by account type

- Added an account-type selector on the Create step: general contractor, owner or specialty
  contractor. This applies Procore's own "Point-of-View Dictionaries", which rename tools to
  match what that customer actually sees on screen — for an owner, prime contract becomes
  funding and subcontractor becomes contractor; for a specialty contractor, prime contract
  becomes client contract and invoicing becomes progress billings.
- Account type is a separate question from region. Region changes construction vocabulary;
  account type changes Procore tool names. Both apply, region first.
- Only terms specific enough to be safe are swapped. Rows from Procore's list that are single
  common words — name, owner, due date, revenue — are deliberately not applied, because
  replacing every occurrence would corrupt ordinary sentences such as "process owner". Several
  of those rows also apply only inside Procore's Takeoff and Estimating tool.
- Two limitations, both surfaced in the tool: Procore states these dictionaries are US English
  only, and word substitution cannot fix grammar, so a renamed plural can read awkwardly.
  Read the preview before issuing.

---

## Still outstanding

- The RFI content library is an unverified draft and must be checked against Procore's APAC
  permissions matrix before any client release.
- Only one tool template exists. Submittals, Daily Log and the rest are still to be written.
- Templates are stored per computer; genuine team sharing needs a hosted version.
- Work is not saved automatically — closing the tab loses it.
- The document design is US Letter; an A4 variant is needed for APAC and international use.
