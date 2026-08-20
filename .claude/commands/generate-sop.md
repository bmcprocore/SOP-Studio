Generate a permission-scoped SOP. Arguments (any order, ask for what's missing): tool,
permission manifest (file path or pasted text/screenshot), client name, persona hint,
detail level (simple|standard|extended, default standard), transcripts (paths, newest first).

Follow CLAUDE.md strictly:
1. Load templates/<tool>/master-library-v*.json (latest version).
2. Parse the manifest → base level + granulars; match closest persona in _personas.
3. Present the inclusion summary table (include / exclude+rule / ASK) and STOP for approval.
4. On approval: assemble the content JSON per the schema in CLAUDE.md, save to
   output/<Client>_<Tool>_<Persona>_v1.0.json, then run:
   node scripts/render.js output/<file>.json
   and report the output path. Offer --pdf.
Never invent values; blanks stay "" (placeholders). Status is always "draft".

$ARGUMENTS
