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
| 3.11.1 | 21 Aug 2026 | Procore permission structure captured as reference (docs only) |
| 3.12 | 21 Aug 2026 | **Accessibility overhaul** — keyboard reordering, screen-reader support, autosave |
| 3.13 | 21 Aug 2026 | APAC documents now export on A4 (document design v3) |
| 3.13.1 | 21 Aug 2026 | Hosting and usage-tracking note added (docs only) |
| 3.14 | 21 Aug 2026 | Review simplified — one place to decide, one to understand |
| 3.15 | 24 Aug 2026 | Shareable builds — templates travel with the file |
| 3.16 | 24 Aug 2026 | **Document quality** — access panel, intros and close-out guidance fixed |
| 3.16.1 | 26 Aug 2026 | Page-fitting defect found and documented; packing attempt reverted |
| 3.17 | 26 Aug 2026 | **Service check** — the document is now guarded; empty SOPs blocked |
| 3.17.1 | 27 Aug 2026 | **Command-line guides are permission-scoped again** — access panel filled, Admin content no longer leaks |
| 3.17.2 | 27 Aug 2026 | **One document, one renderer** — the SOP skill now assembles content and no longer hand-writes HTML |
| 3.18 | 27 Aug 2026 | **Template gallery** — all 80 Procore tools registered, with granular permissions per tool |
| 3.19 | 27 Aug 2026 | **Seeded libraries** — Procore's permission matrices harvested; 11 tools now start half-built |
| 3.20 | 2 Oct 2026 | **Hosted on Procore Sites** — a Sites build that prints to PDF; template delete confirmed by name; PDF libraries travel inside the file |

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

## 3.11.1 — Procore permission structure captured as reference

Documentation only. **The Studio itself is unchanged and remains v3.11.**

- Captured the real Procore permission structure from a live instance: the four levels, every
  tool by category, and the exact granular permission wording for the ten tools that have it —
  RFIs, Submittals, Specifications, Documents, Action Plans, Meetings, Defect List, Photos and
  Drawings.
- Held at `docs/procore-permission-reference.md`, with the source capture in `docs/reference/`.
- **Reference only. Nothing in it is applied automatically.** It is now the first step when
  authoring a new tool template, so the wording used in the library matches what the client
  actually sees on their screen.
- Two things it confirmed: the RFI library uses only one of the five granular RFI permissions
  Procore offers, and the tool names in this instance are the Australian ones the templates are
  already written in — Head Contracts, Variations, Defect List, Site Diary, Progress Claim.

## 3.12 — Accessibility overhaul

Acting on a formal UI/UX review. Every item below was measured before and after.

- **Sections can now be reordered by keyboard.** Previously drag-and-drop was the only way, which
  meant keyboard-only users could not reorder at all. Every row in the detail list now has up and
  down buttons, using the same control as the existing remove button. Dragging still works.
- **Every control now has a name.** Eleven checkboxes on the Review screen announced as "checkbox"
  with no indication of what they controlled.
- **The tool now speaks.** Render results, errors and confirmations were previously silent to a
  screen reader. All six status areas announce themselves.
- **The sign-off is three keystrokes away.** It previously took 73 tab presses to reach the one
  step nothing can proceed without. A skip link now goes straight there.
- **Required fields are marked properly**, not just with a red asterisk, and every screen has a
  proper page heading.
- **Colour contrast fixed** on warnings, success messages, section counts and rail labels. The
  status colours themselves are unchanged — text variants were added alongside them.
- **Work is saved automatically** and offered back if you close the tab by accident. There is also
  a warning before leaving with unsaved changes.
- Clicking anywhere on a section's title now toggles it, and the small row buttons have a proper
  click area.
- The delete password is now called a confirmation phrase, and says plainly that it prevents
  accidents rather than controlling access.
- The page language follows the region, so a North American document is not read aloud in an
  Australian voice by a screen reader.

**Deliberately not changed:** the primary button's white-on-orange contrast measures 3.25:1 against
a 4.5:1 requirement, but that pairing comes from Procore's own design system. It has been referred
to the brand and design team rather than altered locally.

---

## 3.13 — APAC documents print on A4

- **Page size now follows the document's region.** An APAC document prints A4; North America and
  unset regions stay US Letter exactly as before. Australian and New Zealand customers were
  previously handed a document sized for American paper.
- This is the first change to the locked document design since the tool was built, so it was
  versioned as **document design v3** and made only on explicit instruction. The original design
  is not rewritten — A4 is an override laid on top, so Letter output is unchanged to the byte.
- Page counts differ between the two papers because the tool re-measures where content falls at
  the real paper size, rather than assuming.
- The downloaded file carries the paper setting inside it. Without that it would revert to Letter
  when opened on someone else's computer.

## 3.13.1 — Hosting and usage tracking (documentation only)

The Studio itself is unchanged. A reference note was added covering the three things the build
specification never addressed: signing in by emailed link rather than a password, a log of what
happened, and the usage figures worth reporting — unique users per week and month, documents per
user, how often a document is regenerated, and time saved.

Two findings were recorded rather than assumed:

- **The tool already computes nine tracking fields on every document and then throws them away.**
  Keeping what it already works out is most of the log. Only three things are genuinely missing:
  which template version was used, a record of each render, and a session start time.
- **Time saved cannot be measured retrospectively.** The manual baseline disappears as people
  adopt the tool, so it has to be captured before anything is built. It is the only item on the
  list that gets harder the longer it is left.

Also flagged for a decision: the existing plan assumes corporate single sign-on, so emailed-link
sign-in needs IT agreement first; and the log would hold staff emails next to client names, which
needs a retention policy agreed up front.

## 3.14 — Review simplified: one place to decide, one to understand

Acting on a self-assessment against five established usability principles.

- **Every earlier setting is now restated on the Review screen** — region, paper, account type,
  detail level, permissions and customer segment — with a link back to change any of them. Five
  settings were previously chosen across three screens with only two visible at sign-off, so the
  rest had to be held in the user's head while approving content.
- **The tick box and the reorder controls now sit together**, 6px apart instead of 745px on an
  872px-wide row. Including a section and then moving it previously meant crossing three-quarters
  of the screen and back.
- **The duplicate list is gone.** The screen used to show the same 21 sections twice, both fully
  interactive, with nothing indicating which one was in charge. The outline now owns every
  control and the detail column alongside it is read-only explanation with a status dot per
  section. Despite adding the settings bar, the number of controls on the screen fell from 115
  to 94.
- **Also fixed, and more concerning than the interface work:** two automated checks had silently
  broken when the interface changed, and the way they were being run reported a crashed check as
  a pass. Both were repaired, and the check runner now treats any crash as a failure.

## 3.15 — Shareable builds: templates travel inside the file

Templates were stored per computer, so nothing was ever genuinely shared with the team.

- A build step now bundles every approved template **inside a copy of the Studio**. Share that one
  file and whoever opens it has the approved templates on first run — no set-up, no importing, no
  instructions.
- **Templates someone saved themselves are never overwritten.** Only published templates are
  replaced, and only when the incoming version is newer. Tested by forcing a large version jump:
  the published template refreshed, the user's own draft survived untouched.
- Published templates are badged in the list so they can be told apart from local ones. Opening an
  older build does nothing; opening the same build twice does not announce itself again.
- This finally fills the librarian role the build specification has described from the start — one
  author, everyone else receives — without needing a server. Its limits are stated plainly:
  updating means redistributing the file, and only one person authors.

## 3.16 — The generated document fixed: one cause behind three faults

**There were two copies of the RFI template and they had drifted apart.** The copy embedded in the
tool was missing the introduction to the steps, the close-out introduction and the whole persona
map; the master file had all three. Every document created that way printed `[Intro to the steps.]`
and `[Intro.]` and showed an empty access panel — which is exactly what the client PDF that
prompted this showed.

- The embedded copy is now regenerated from the master file, so there is one source and the two
  cannot drift again.
- The step that turns a template into a document was blanking both introductions and dropping the
  persona map. It now carries them.
- **"Your access in this tool" is now filled in.** The tool matches the reader's permissions to
  the persona the rule actually produced, then writes that persona's level, its plain-language
  meaning and its cannot-do list onto the document. The master library had carried this text all
  along and nothing had ever read it.
- The close-out section gained a proper escalation path: the issues table, then your own access in
  Section 1, then the reference guides, then your Implementation Manager or Procore Support with
  the project name and RFI number.

**Two reported points were investigated and deliberately not changed.** The sign-off alignment was
measured directly — both columns are exactly the same width with equal gaps, and the checklist
rows are uniform; no misalignment could be reproduced. What is real is that the approvals block
can end up alone on a near-empty final page. The "stretched" appearance was measured too: it is
caused by one step per page with short steps, not by a formatting fault, and changing it means
altering the locked document design.

## 3.16.1 — The page-fitting defect: found, written down, not fixed

Short steps were meant to share a page so the document stopped wasting space. It was built,
measured, and then deliberately reverted.

**Packing worked** — the sample went from 9 pages to 6 and the sparse pages disappeared — **but one
page overflowed and its content was silently cut off.** On a document that tells a customer what
they are permitted to do, content disappearing without warning is far worse than white space.

The attempt uncovered a real defect that had been present all along: **the check that decides
whether content fits has never worked.** It measures the content inside a box whose height is
fixed by the page, so it reports the same height no matter what is inside it. Tested directly, a
200px block, a 964px block, a 2000px block and a 5000px block all reported exactly the same
height. The check has therefore been true for almost any content.

This was harmless while every step had its own page, because that path was never used — which is
precisely why it survived unnoticed for so long. One step per page stays until the measurement is
fixed. It wastes space, but it has never lost anything.

## 3.17 — Service check: the document is now guarded

A full audit. Everything found is either fixed here or written down.

- **The document is now guarded.** The standing rule is that the tool may change but the finished
  PDF must not, and nothing enforced it. A check now renders a fixed document and compares the
  page count, every heading and step title, the page furniture, the Procore colours, typeface,
  logo and page size against a stored reference. It also fails if any page's content runs off the
  bottom. Proven by breaking each case deliberately and confirming it was caught.
- **Empty SOPs are blocked.** A permission level of None dropped every section, yet the list could
  still be approved and a document generated with no procedure in it — a customer could have been
  sent a guide that told them nothing. That is now blocked, naming the likely cause and offering a
  button to fix it.
- **Extended detail no longer misleads.** It rendered identically to Standard, because it is a
  writing instruction for transcript-built SOPs and adds nothing to an authored template. The tool
  now says so rather than appearing to do something.
- Plainer first-run wording: "Seed / reset RFI master template" became "Install the RFI template".
- **Checked and found sound:** text typed into client fields cannot execute as a script; the tool
  still works with browser storage blocked; awkward and very long input renders correctly; a new
  user reaches a finished SOP in eight actions.
- **Recorded, not fixed:** two browser tabs share one draft slot, so the last to type wins.

## 3.17.1 — Command-line guides are permission-scoped again

A review of the generated SOPs found that guides produced from the command line had lost their
permission scoping. Three faults, one cause.

- **"Your access in this tool" was blank on every command-line guide.** The wording was authored in
  the master library all along, but the script deleted the persona map — the only place it lived —
  one step before the document was built. Section 1 printed empty brackets.
- **Admin-only content was leaking into a manager's guide.** Steps and the checklist were being
  filtered, but the troubleshooting table never was. An RFI Manager's guide told the reader to fix
  numbering in a settings screen their permission does not allow them to open.
- **A manager's guide was missing the manager's own two sign-off items**, because the library
  abbreviates the owner as "RFI Mgr" while the role reads "RFI Manager" and the two were compared
  as raw text. Labels are now compared by meaning, with abbreviations expanded.
- **Permission is now the gate and cannot be skipped.** The script requires a persona; asking for a
  job role on its own is refused, because a job title is not a permission. Role remains available
  as an optional narrowing inside a permission, and it now prints exactly which permitted steps it
  removed so a human can confirm that is intended.
- AU/NZ output was still printing on US Letter because nothing set the region. There is now a
  region option, and it says plainly what paper you will get.
- Both RFI guides were rebuilt on the current library and re-rendered on A4.

## 3.17.2 — One document, one renderer

The SOP skill — the thing that responds to "write me a Procore SOP" — was found to be a **second,
hand-written copy of the document design**. It had fallen behind: it had no access panel, it still
used the old roles table the design replaced, and it only knew US Letter. Because it triggers
automatically on the phrase, it was the copy most likely to be reached for.

- **The skill now assembles content and never writes HTML.** Its hand-written starter file was
  removed, so there is one design and one renderer, and permission scoping can no longer be
  bypassed by wording a request differently.
- **The structure was simplified to one decision:** does this tool have a content library? If yes,
  it is a filtering exercise. If no, research the content, then offer to turn it into a library so
  the next guide for that tool is filtering too.
- **The nine-section structure was never really the document.** The old brief mandated nine
  sections and eight analysis outputs that the document cannot hold, so it read like a document
  structure and silently was not one. It is now a research guide, and the analysis outputs are
  delivered as a separate note to the human — an SOP is a working instruction for one person, not
  a risk register.
- A new reference records the content contract in one place: every field, what it becomes in the
  finished document, and how to write it. Checking it against the renderer revealed that client
  logos and per-step images work in the browser app but are ignored by the command-line render —
  now stated, so nobody promises a client screenshots they will not get.
- Overall the skill went from 599 lines to 381, and the 401 lines removed were the ones causing
  harm.

## 3.18 — The template gallery

Every Procore tool is now registered in one place, so the tool list is no longer whatever someone
remembered.

- **80 tools** — 53 project-level and 27 company-level — captured from Procore's own permissions
  matrix index.
- For each tool: **what each customer type calls it** (general contractor, owner, specialty
  contractor), its Australian name, whether it is a project or company tool, the permission levels
  it offers, and the granular permissions to offer once that tool is chosen.
- **Every permission entry records where it came from.** A permission claim that cannot be
  attributed does not belong in a customer's SOP.
- Australian naming was verified against Procore's Australian support site: Prime Contracts are
  **Head Contracts**, Change Orders are **Variations**, Punch List is the **Defect List**, Daily Log
  is the **Site Diary**, Invoicing is **Progress Claims**.
- **The decision on where this lives:** the register is a data file, and the tool reads it — not
  the other way round. Content held inside program code was exactly the fault fixed in 3.16 and
  again in 3.17.2. A data file can also be reviewed and approved before release, which matters when
  the content is permission claims.
- A validator checks the register, and a refresh step can re-import the tool list without ever
  overwriting anything harvested by hand.

## 3.19 — Seeded libraries: eleven tools now start half-built

Writing a content library for a tool from scratch is the slow part. Procore's own permissions
matrix already lists every action a tool supports and the permission each one needs, so that is now
captured and used as the starting point.

- **11 tools captured, 513 actions**, each carrying the permission level that allows it: RFIs,
  Submittals, Commitments, Budget, Change Events, Variations, Head Contracts, Progress Claims,
  Defect List, Site Diary and Drawings.
- **The matrix says more than expected.** It names the specific granular permission that unlocks an
  action, including where any one of several will do — so a seeded library knows that creating a
  drawing set needs either "Upload Drawings" or "Upload and Review Drawings".
- **The pages are read directly rather than summarised.** An AI summary was tried first and got a
  row wrong, reporting an Admin-only action as available to Standard users. In a customer's SOP
  that is a false statement about what someone is allowed to do, so the pages are now transcribed
  precisely instead. Procore's own crawl limits are respected — one page every five seconds.
- **Seeds are clearly not SOPs.** Every step body is empty and every persona statement is blank,
  because nothing has been written yet. The step titles are Procore's action names, not a
  customer's process. A human selects, orders, merges and writes them. A seed must never be issued.
- The immediate benefit is answering a question that previously needed a live Procore instance:
  *what can this permission level actually do in this tool?* A Read Only user, it turns out, can
  perform 28 of the 52 documented RFI actions — including closing an RFI, if they hold "Act as RFI
  Manager".

**One finding worth knowing about.** Procore words the same granular permission differently across
its own sources: the support FAQ says "Associated **to** Users", the permissions matrix says
"Associated **with** Users", and an Australian instance says "**defect** items" where the matrix
says "**punch** items". Since the whole promise is to use wording that matches the customer's own
screen, there is no single correct spelling. Each permission now records every variant it has been
seen under, and where each came from. The matrix also confirmed two permissions the public FAQ
does not document but a live instance did — neither source was complete on its own.

---

## 3.20 — Hosted on Procore Sites

Until now the Studio was shared by sending a file around (3.15). It can now live at an address on
sites.procoretech.com, so the team opens a link instead. Getting it past the Sites publishing
checks forced three changes, one of which is a genuine trade-off.

- **The shared delete phrase is gone.** Deleting a template used to require typing a phrase that
  was stored, in plain text, inside the file — the Sites scanner flagged it as a leaked
  credential. Deleting now asks you to retype the template's own name. Same protection against an
  accidental click; nothing secret in the file. If that old phrase was used anywhere else, change
  it there.
- **The PDF libraries now travel inside the file.** The two libraries behind "Download PDF" were
  fetched from a public download site every time the Studio opened. Sites does not allow outside
  code, so both are embedded. The file is larger (about 1 MB) and now works offline.
- **A second build for Sites, which prints instead of downloading.** The Sites scanner also rejects
  one of those libraries (the one that photographs each page for the PDF) as a "monitoring client".
  It is not one — it never sends anything anywhere — but there is no override, so the Sites build
  leaves both libraries out. Its "Print / Save as PDF" button opens the browser's own print
  dialog with the document on the standard file name. **The trade-off:** a PDF saved this way has
  no fillable checklist boxes or sign-off fields; they print as ordinary lines. The normal build
  is unchanged and still produces the fillable PDF.

Two builds, one source: `node scripts/publish-build.js` makes the normal build;
`node scripts/publish-build.js --sites` makes the Sites build from the same file and refuses to
write it if any trace of the PDF libraries remains. The document design is untouched in both.

Version numbers: 3.18 and 3.19 changed templates and data but never moved the badge in the Studio
itself, which still read 3.17. The badge now says 3.20 and matches this file.

---

## Still outstanding

**Nothing generated by this tool has been verified yet.** The RFI content library and all eleven
seeded libraries are drafts. Permission behaviour must be checked against Procore's Australian
support documentation, and ideally against the customer's own instance, before any client release.

- **69 of the 80 registered tools have not been captured yet.** Eleven are done.
- **A seed is not an SOP.** Eleven tools have a permission-tagged list of candidate actions; none
  of them has an authored process, and every step body is still empty.
- **The page-fitting check does not work** (see 3.16.1). One step per page stays until it is fixed,
  which wastes space but has never lost content.
- **The Gem path still produces permission-blind documents.** The transcript-to-JSON prompt and the
  JSON loader that goes with it have no access panel and no access field in their schema. Anyone
  still using that route is generating SOPs without permission scoping.
- **Procore's own wording is inconsistent** across its support FAQ, its permissions matrix and a
  live instance. Variants are recorded, but which one to print in front of a given customer is a
  judgement call that has not been made.
- **Sharing is a link now, but the library is still per person.** Hosting on Procore Sites (3.20)
  means nobody has to be sent a file, yet each person's templates still live in their own browser,
  only one person can author, and the Sites build cannot make fillable PDFs. The hosted version
  with a shared library and sign-in is specified and unbuilt.
- **Two browser tabs share one draft slot**, so the last to type wins.
- **Client logo co-branding is still undecided** — whether a customer's logo may sit alongside the
  Procore wordmark needs a brand ruling.

Resolved since this list was last written: work is now saved automatically (3.12), APAC documents
print on A4 (3.13), and templates now travel inside a shared build rather than living on one
computer (3.15).
