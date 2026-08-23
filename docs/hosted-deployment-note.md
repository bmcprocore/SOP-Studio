# Hosting the Studio, with sign-in and usage tracking — reference note

**Status: a note for future reference, not a decision and not a build.** Nothing here is
implemented. It extends `build-spec-v0.1.md` rather than replacing it — read that first for the
overall architecture, data model and security posture. This note covers the three things that spec
does not: **passwordless sign-in, the event log, and the usage metrics**.

Written 21 Aug 2026 against Studio v3.13.

---

## 1. The most useful thing to know first

**The Studio already produces almost everything the event log needs. It just throws it away.**

Every document generated today is stamped with these, in the content JSON:

| Already stamped | What it is |
|---|---|
| `_confirmedBy`, `_confirmedAt` | who approved the inclusion list, and when |
| `_permissionProfile` | the base level and granular permissions it was scoped to |
| `_detail` | simple / standard / extended |
| `_region` | APAC / NAMER / TBC — also drives paper size and terminology |
| `_segment` | SMB / COMM / ENT / STR |
| `_accountType` | GC / owner / specialty contractor |
| `_overrides` | any section included against the permission rule |
| `customer`, `processName`, `version` | client, process and document version |
| `outName()` | the exact output file name |

So the back end's first job is not to invent tracking. It is to **persist what the tool is already
computing**. That is a much smaller job than it sounds, and it means the audit trail and the usage
metrics come from the same source rather than being bolted on separately.

**Three things are genuinely missing** and must be added to the app before the metrics work:

1. **The template version used.** `version` is the *document's* version and the user can edit it.
   The *template* version needs stamping separately as `_templateVersion`, taken from the library
   entry at the moment the SOP is created.
2. **Render events.** The tool tracks only whether something has been rendered, not how many times.
   Regeneration rate cannot be measured without logging every render.
3. **Session timing.** Nothing records when work on a document started. Time-to-produce cannot be
   measured without it.

---

## 2. Architecture — the smallest thing that works

`build-spec-v0.1.md` describes the full production build. For a first hosted version, less is
needed:

- **Frontend:** serve the existing single HTML file as-is. It already works offline in a browser;
  hosting it changes nothing about how it behaves. Do not rewrite it in React until there is a
  reason — the spec's React plan is the right end state, not the right starting point.
- **Backend:** one small Node/TypeScript service. Endpoints: request a sign-in link, verify a
  sign-in link, list and save templates, record an event, serve the metrics.
- **Database:** Postgres. SQLite is enough for a pilot but do not build on it if this will be
  multi-user across regions.
- **Rendering:** already solved. `scripts/render.js` drives headless Chromium and produces the
  PDF at the correct paper size. That script moves server-side essentially unchanged.
- **Claude API:** stays server-side, never in the browser, exactly as the existing spec says. The
  transcript-to-SOP step is the natural first use.

**What hosting fixes immediately, regardless of anything else:** the template library currently
lives in each person's browser, so nothing is shared and nothing is governed. A server-side
library is the single biggest reason to host this.

---

## 3. Passwordless email sign-in

The user types their email, receives a one-time link, clicks it, and is signed in. No password.

**The flow**

1. User submits their email address.
2. Server checks it against an allowed domain list. For an internal tool this is the real access
   control — restrict to the company domain.
3. Server generates a random token, stores only a hash of it, and emails the link.
4. User clicks. Server verifies the hash, marks the token used, and issues a session cookie.

**The rules that matter, in order of how often they are got wrong**

- **Single use.** Mark the token consumed the moment it is verified. Email links get forwarded,
  scanned by security tooling, and logged by mail servers.
- **Short lifetime.** Ten to fifteen minutes. Long enough to switch to a mail client, short enough
  that a leaked link is stale.
- **Store the hash, never the token.** A database leak must not yield working sign-in links.
- **Rate limit by email and by IP**, or the endpoint becomes a way to spam someone's inbox.
- **Do not reveal whether an address exists.** Always answer "if that address is allowed, a link is
  on its way." Otherwise the form becomes a way to enumerate staff.
- **Session cookie:** HttpOnly, Secure, SameSite=Lax, with a sensible expiry.
- Be aware that corporate mail scanners sometimes *click* links to check them. If that happens the
  token is consumed before the user sees it. The usual mitigation is to require a POST on the
  landing page — one button that says "Confirm sign-in" — rather than signing in on page load.

**One thing to check before building this.** The existing build spec assumes SSO through Okta or
Google. If Procore IT mandates SSO for internal tools, magic links will not be accepted no matter
how well built. **Ask them before writing any of it.** Magic link is simpler and genuinely fine for
a small internal tool; it is not your decision alone.

---

## 4. The event log

One row per meaningful action, not just per finished document — regeneration cannot be measured
otherwise.

```
events
  id
  occurred_at         timestamp
  user_email          who did it (from the session, never from the browser)
  event_type          'created' | 'rendered' | 'downloaded' | 'confirmed'
  document_id         stable id for one SOP being worked on, survives regeneration
  client_name         customer
  process_name        e.g. RFI management
  tool                RFIs, Submittals …
  template_name
  template_version    from the library entry, not the document version
  detail_level        simple | standard | extended
  region              APAC | NAMER | TBC
  segment             SMB | COMM | ENT | STR
  account_type        GC | OWNER | SPECIALTY
  permission_level    ReadOnly | Standard | Admin …
  granular            list
  override_count      sections included against the permission rule
  page_count
  output_filename
  session_started_at  when work on this document began
```

`document_id` is the important one. Without a stable id that survives regeneration, there is no way
to tell "one person produced five documents" from "one person regenerated the same document five
times" — and those two mean completely opposite things about whether the tool is working.

**A caution.** This table contains staff email addresses and client names together. That is personal
data plus client-confidential data in one place. It needs a retention period agreed before it is
built, and it should not be freely queryable across the business.

---

## 5. The metrics, and what each one needs

**Unique users per week and per month** — distinct `user_email` over the window. Straightforward
once sign-in exists. This is the adoption number and the right one to lead with.

**Documents per user** — count per user over a window, then look at the *distribution*, not the
average. The useful split is people who produced one document and never returned, versus people who
came back. A reasonable definition: someone with two or more documents across separate days in
thirty days is a returning user. Averages will hide this entirely — one heavy user makes a dead tool
look healthy.

**Regeneration rate before finalising** — renders per document before the download. Needs the
`rendered` and `downloaded` events sharing a `document_id`. Read it as a signal about templates: a
document regenerated seven times before anyone downloads it is usually a template that does not fit
the situation, not a careless user. Worth breaking down by template, which is where the actionable
answer lives.

**Time saved versus the manual process** — the hardest of the four, for a reason worth understanding.

The tool can measure time *in the tool*: `session_started_at` to the download. Two cautions on that
alone — exclude sessions abandoned and resumed days later, or the median is meaningless; and time in
the tool is not effort, since people leave tabs open.

The real difficulty is the other half. **You cannot compare against the manual process unless you
know how long the manual process took, and that number disappears as adoption grows.** Once everyone
uses the Studio, nobody is doing it manually to measure.

**So capture the baseline now, before this is built.** Ask the handful of people who still write SOPs
by hand to record how long the next few take them, end to end. A dozen honest data points gathered
this month is worth more than any amount of instrumentation added later. Record what kind of SOP it
was, since a simple best-practice guide and a deep client-specific one are not comparable.

---

## 6. Suggested sequence

1. **Now, before any code:** capture the manual baseline (section 5). It is the only item here that
   gets harder the longer you wait.
2. Confirm with IT whether magic-link sign-in is acceptable, or whether SSO is mandated.
3. Host the existing HTML file as-is behind sign-in, with a server-side template library. This alone
   solves template sharing and governance, and it needs no rewrite.
4. Add the event log. Add `_templateVersion`, render events and session timing to the app at the
   same time — they are small changes but the metrics are impossible without them.
5. Add the metrics view once there is a month of real data. Not before; an empty dashboard teaches
   nobody anything.
6. Move the Claude API call server-side for the transcript-to-SOP step.
7. Only then consider the React rewrite in `build-spec-v0.1.md`, if there is still a reason for it.

---

## 7. Open questions

- Magic link or SSO — Procore IT decides, not this document.
- Where does this host? Internal platform or a cloud account. Affects data residency, which matters
  once EMEA client data is involved.
- Retention period for the event log, given it holds staff emails and client names.
- Who owns the template library once it is shared — the librarian role in `build-spec-v0.1.md` has
  never been assigned.
- One point in the original request was cut off mid-sentence, about measuring how long an SOP takes
  to create. Section 5 assumes the intent was to measure it inside the tool and compare against the
  manual baseline. Confirm before anyone builds to it.
