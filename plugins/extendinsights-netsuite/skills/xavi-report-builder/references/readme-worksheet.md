# README worksheet

After a build, create README or append a report section without overwriting existing
content. Use the null-safe append procedure in office-js-notes.md. If sheet creation
is unavailable, place the documentation below all report/chart ranges or deliver it
in chat when there is no workbook access.

Include:
1. Report name, target worksheet, build date, scope and completion status.
2. Actual input addresses and meanings for this report. Copy the applicable layout,
   not a generic filter list; explain the Trial Balance From/To exception.
3. Formulas actually used, their argument meanings and how helpers supply periods.
4. How to change scope, refresh, update selected accounts and maintain manual budgets.
5. Validation performed, outstanding errors and limitations. Mention that AI output
   must be cross-checked with NetSuite before reliance.

Report-specific notes:
- Income statement: fiscal boundaries, account coverage, net-income comparison.
- Balance sheet: as-of date, FY start, RE exclusion/account input, calculated RE,
  CTA treatment, selected segments/book and observed balance check.
- Trial balance: text periods, sign convention, leaf/parent handling, any hidden or
  deleted rows and how to rebuild when the period/filter changes.
- Budget: selected accounts and coverage, manual-input status, B7 category/B8 book,
  single-month BUDGET workaround, quarter/FY sums and percentage-total calculation.
- Cash flow: balance-delta draft status, noncash adjustments, sources of verified
  FX on cash and the unreconciled difference. A residual is not proof of FX or a
  valid reconciliation. Never place cash-flow methodology under a balance-sheet heading.
- Dashboard: last closed period, fiscal YTD boundary, prior-month comparison and
  chart source ranges. Subsidiary comparisons disclose eliminations/currency limits.

Use headings, a compact formula table and wrapped prose. Dates/figures that should
change with inputs reference cells instead of hardcoded text. Avoid blanket claims
that all accounts, financial totals or NetSuite UI results necessarily agree.
