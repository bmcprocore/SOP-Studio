＝＝＝ PROCORE SOP — JSON CONTENT SCHEMA ＝＝＝
Defines the JSON shape a Google Gem (or any LLM) must return so it can be pasted into
"SOP JSON Loader.html" to auto-populate the Procore SOP template. Keep keys exact.
Use null for any fact not found in source material — the loader renders null as a
visible placeholder. Never invent values.

{
  "docId": "SOP-PRC-000",
  "version": "1.0",
  "status": "Draft",
  "processName": "string",
  "customerName": "string or null",
  "processOwner": "string or null (Role · Name)",
  "effectiveDate": "DD Mmm YYYY or null",
  "coverSummary": "1-2 sentence description for the cover page",
  "appliesTo": "business unit / region / project type",
  "purpose": "paragraph — outcome this SOP guarantees",
  "scopeIn": "what's in scope",
  "scopeOut": "what's excluded",
  "roles": [
    { "role": "Project Manager", "permission": "Admin", "responsibility": "string" }
  ],
  "phases": [
    { "name": "Prepare", "desc": "one-line description" }
  ],
  "prerequisites": ["string", "..."],
  "referenceTool": "Procore tool name for the procedure page",
  "steps": [
    {
      "title": "Step title",
      "role": "Owning role",
      "system": "Procore · Tool",
      "time": "~15 min",
      "body": "1-2 sentence description",
      "actions": ["bullet", "bullet"],
      "callout": { "label": "Procore or Tip", "body": "string" } or null
    }
  ],
  "checklist": [
    { "text": "criterion", "hint": "how to verify in Procore", "owner": "PM" }
  ],
  "issues": [
    { "code": "ERR-01", "issue": "string", "fix": "string" }
  ],
  "references": ["string", "..."]
}

RULES FOR THE MODEL FILLING THIS OUT
- Source priority: newest transcript > older transcripts > official Procore APAC docs
  (docs only fill gaps, never override an agreed customer process).
- Every array should have as many real entries as the source supports — do not pad
  with filler. Omit an array entry rather than invent one.
- Set any missing string field to null (not "" and not a made-up value).
- Return ONLY the JSON object — no markdown fences, no commentary, no trailing text.
- steps[].actions is optional (omit key if the step is a single sentence with no sub-actions).
════════════════════════════════════════════════════════
