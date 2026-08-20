# Contributing to Procore SOP Studio

Thanks for helping build this. To keep `main` stable and reviewable, we use a
**feature-branch + pull-request** workflow. Nobody commits or pushes directly to `main`.

## Workflow

1. **Start from an up-to-date `main`:**
   ```bash
   git switch main
   git pull
   ```
2. **Create a feature branch:**
   ```bash
   git switch -c feature/<short-description>
   ```
   Use a clear prefix: `feature/…`, `fix/…`, `docs/…`, `chore/…`.
3. **Commit your work on that branch** (small, focused commits with clear messages).
4. **Push the branch and open a pull request:**
   ```bash
   git push -u origin feature/<short-description>
   gh pr create --fill --base main
   ```
5. **Get a review.** At least one approval is required before merge.
6. **Merge via the PR** (squash or merge commit per the team's preference). Delete the branch after.

## Enforcement

Two layers keep this workflow honest:

1. **GitHub branch protection** (authoritative). `main` rejects direct pushes and requires
   a pull request with at least one approval before merging. This applies to everyone,
   regardless of the tools they use.

2. **Claude Code hook** (local guard). `.claude/settings.json` registers a `PreToolUse`
   hook (`.claude/hooks/enforce-branch.js`) that blocks `git commit` on `main`/`master`
   and any `git push` to `main`/`master` from within Claude Code, with a reminder to
   branch and open a PR. It requires **Node.js** (already needed for `scripts/render.js`).
   The hook fails open — if anything is unusual it stays out of the way — so branch
   protection remains the real safety net.

## Project notes

- This repo builds **permission-scoped Procore SOPs in a locked visual design**. Read
  `CLAUDE.md` and `docs/framework-standard-v0.2.md` before changing content or the renderer.
- **Never redesign the locked document** (`design/…`, the `SOP_DESIGN` CSS/wordmark) without
  an explicit instruction to version the design.
- **Do not commit client deliverables.** Generated SOPs live in `output/` and PDFs are
  git-ignored. Keep real client names, data, and permission manifests out of the repo.
