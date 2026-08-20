Create a new master content library for a Procore tool. Argument: tool name.

1. Research the tool's User Permissions matrix and granular permissions FAQ on
   support.procore.com (APAC). List the permission-relevant actions.
2. Copy templates/rfi/master-library-v0.2.json as the skeleton into
   templates/<tool>/master-library-v0.1.json.
3. Rewrite steps for the tool's real lifecycle; tag every block's _perm from the matrix;
   write the four persona access objects and block maps; flag client-config-dependent
   blocks as ASK candidates.
4. Dry-run all four personas: assemble each persona JSON to output/dryrun/ and render one
   with scripts/render.js for visual review.
5. Present a verification checklist of every permission claim with its source URL —
   these need human sign-off before the template is used with clients.

$ARGUMENTS
