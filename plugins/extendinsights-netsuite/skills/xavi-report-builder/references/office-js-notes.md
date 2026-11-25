# Office.js execution and recovery

Use only tools exposed by the host. `execute_office_js` is one possible interface;
its presence and support must be established, not assumed. If there is no Office.js
tool but another workbook tool is available, use that tool's supported operations.
If there is no workbook access, deliver formulas and manual steps. Do not attempt
Office.js probes through a nonexistent tool or claim direct writes require no API.

## Writes

Use Excel.run with a single context per operation; do not nest Excel.run calls.
Inspect the destination and create a fresh report sheet unless editing was requested.
Batch structure writes and commit before live formulas. Several context.sync calls
are valid when a later operation depends on loaded or committed state; a fixed
one-sync rule must not override correctness. Hide gridlines on the target sheet
and optionally suspend screen updating until the next sync.

Before reading Range.values, text, formulas, rowIndex, rowCount, left or top, load
those properties and await context.sync. Collection getCount returns a ClientResult;
load/sync and use its value, not arithmetic on the result object. Prefer keeping the
chart object you just created instead of rediscovering it by collection index.

Write explicit `.formulas` arrays. Do not use autoFill on asynchronous custom
functions. Use `.numberFormat` for formatting; do not copy entire ranges merely to
copy styles. Set text input formats before writing account numbers or period strings.

## Bounded resolution

After committing formulas, read the expected numeric cells and distinguish numbers,
pending results and persistent errors. Never use COUNTA or a stable count as success.
Within the tool's execution limit, allow at most ten checks about two seconds apart;
use a shorter budget when needed. Avoid separate chat turns for each poll. If the
budget expires, report pending cells and leave completion/formatting pending.

For a seed #VALUE!, re-enter the same formula once and read back after a bounded
wait. Persistent errors require diagnosis, not repeated writes. For budgets, wait
until all Actual cells are numeric before re-entering pending Budget cells; cap
re-entry at two passes. If Actuals remain busy, do not enter the budget recovery step.
Final formats apply only to resolved ranges; schedule no implicit future action.
Tell the user if a later refresh may require reapplying formats.

## Charts

Create line charts with ChartType.line and apply series.smooth when supported.
Do not require optional styling for report completion. Set explicit series values
and category names to avoid treating dates as a numeric series. For clustered
Actual/Budget column charts use series-by-columns. Use valid host enums; for line
labels prefer ChartDataLabelPosition.top. A rejected chart option does not establish
that all Office.js or worksheet APIs are unavailable.

Retain created objects in the same context. Load anchor left/top before positioning.
If setting explicit axes, use finite resolved numbers and a strictly positive major
unit; otherwise leave automatic scale. Include all sign ranges. Do not announce a
dynamic scale or hidden axis unless it was actually applied and checked.

## README append

Use getItemOrNullObject and getUsedRangeOrNullObject, syncing before testing
isNullObject. For an existing used range load rowIndex and rowCount; append at
`rowIndex + rowCount + 2` (Excel row numbering), not rowCount alone. Preserve
existing content. Only autofit a nonempty range; wrap long notes and limit width.

## Failure reporting

Retry only transient operations with bounded attempts. A failed optional chart may
leave a valid table; a failed formula/verification cannot be hidden. Report what
completed, what remains unresolved, and the smallest next step. Do not expose routine
recovery plumbing, but do not suppress errors or present an incomplete report as done.
