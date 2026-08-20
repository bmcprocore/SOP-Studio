# Procore SOP Studio

Generates **permission-scoped Procore SOPs / user guides** in a locked, on-brand document
design. A client's Procore permission template acts as a *filter* over a master content
library per tool — nobody writes SOPs per user; the library is authored once and filtered
per persona. Claude Code is the generation engine; `CLAUDE.md` governs how it behaves here.

## Getting started (Claude Code)
```bash
cd procore-sop-studio
npm install puppeteer        # one-time, for headless rendering / PDF
claude                       # start Claude Code in the repo
```
Then, inside Claude Code:
```
/generate-sop tool: RFIs, client: <name>, detail: standard
```
…and attach or paste the permission manifest when asked. Claude will show the **inclusion
summary** for your approval (Gate 3 — mandatory), then assemble the JSON, render it, and put
the finished SOP in `output/`.

Other commands:
- `/new-tool-template Submittals` — scaffold and research the next tool's master library.
- `/review-sop output/<file>.json` — audit a generated SOP against the standard.

Manual render / PDF:
```bash
node scripts/render.js output/Client_RFIs_Persona_v1.0.json --pdf
```

## Repo layout
| Path | What it is |
|---|---|
| `CLAUDE.md` | Project instructions — the operating standard Claude Code follows |
| `templates/rfi/master-library-v0.2.json` | RFI master content library (permission-tagged blocks + persona map) |
| `design/SOP_Builder_step_per_page_v2.html` | **Locked** document design + renderer (access panel v2). Do not restyle |
| `app/SOP_Studio_v0.1.html` | Claude-artifact app version (browser workflow, shared team library) |
| `scripts/render.js` | Headless render: content JSON → standalone SOP HTML (+ `--pdf`) |
| `examples/` | Worked persona JSON example |
| `docs/` | Framework standard v0.2 · production build spec v0.1 |
| `output/` | Generated SOPs (git-ignored — client deliverables stay out of the remote) |

## The rules that matter
1. **Design is locked.** Content JSON only; the renderer contract is in `CLAUDE.md`.
2. **Gate 3 is mandatory.** No SOP is assembled without a human approving the inclusion summary.
3. **Nothing is invented.** Unknown values render as visible placeholders; newest transcript
   wins; Procore docs fill gaps only.
4. **Everything generated is a draft** until a human reviews and approves it.

## Status / verification
RFI master library is `AI-DRAFT` — verify permission behaviour against the APAC RFIs
User Permissions matrix (support.procore.com) before first client release. Output page size
is US Letter (locked design); see docs/framework-standard-v0.2.md open items for the A4
decision and client-logo co-branding rules (brand.procore.com).

## Roadmap
Submittals → Daily Log → Documents/Drawings → Inspections → financial tools; then the
overarching client process workflow map (block `_id`s are the join key). Production web app
spec: `docs/build-spec-v0.1.md`.
