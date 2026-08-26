# The page-fitting check does not work — investigation note

**Status: a defect found and documented, not fixed.** Recorded 26 Aug 2026 against Studio v3.16
after an attempt to let short steps share a page was made and then reverted.

## What was asked for

Steps currently take one page each regardless of length, so a short step leaves most of a page
blank and the approvals block can be pushed onto a page of its own. Letting short steps share a
page would fix both.

## Why it was reverted

Packing works — the sample SOP went from 9 pages to 6, and the sparse pages disappeared. But **one
page overflowed by 20px**, meaning content ran off the bottom and was silently clipped by the
page's `overflow: hidden`. On a document that tells a customer what they are permitted to do,
content vanishing without warning is far worse than white space. So it was reverted rather than
shipped.

## The underlying defect

The renderer decides what fits using `paginate()`, which measures candidate content in a hidden
sandbox element (`#sop-measure-body`, styled as `.pg-body`). That check cannot work as written:

1. **`.pg-body` is absolutely positioned with a fixed `top` and `bottom`.** Its height is therefore
   fixed by the page, and `scrollHeight` returns that height whatever is inside it. Measured
   directly: a 200px block, a 964px block, a 2000px block and a 5000px block **all report a
   scrollHeight of exactly 964**. The check `scrollHeight <= clientHeight + 1` is therefore true
   for almost any content — it has never been able to detect an overflow.

2. **`.pg-body` is also a flex column**, so children shrink to fit unless pinned with `flex: none`.
   That compounds the first problem.

This was harmless while every step had its own page, because the procedure section never went
through the packing path. It only matters once steps share a page.

Replacing `scrollHeight` with a direct measurement of where the content actually ends made the
result stable — 6 pages at every safety margin from 0 to 48px — but one page still overflowed by
the same 20px, and the safety margin had no effect on it at all. That points at a further problem
in the measuring sandbox itself which was not identified before this was stopped.

## What to do next

Fix the measurement before attempting the packing again. Concretely:

- Verify the sandbox element is actually laid out when measured. If `#sop-measure-wrap` is hidden
  rather than merely off-screen, every rectangle it reports is zero and no fit check can work.
- Measure against a container whose height is set by its content, not by the page.
- Add a regression check that renders a document and asserts no page's content exceeds its body
  height. There is currently no test for this, which is why the defect survived unnoticed.

**Until that is done, the one-step-per-page behaviour should stay.** It wastes space, but it has
never clipped anything.
