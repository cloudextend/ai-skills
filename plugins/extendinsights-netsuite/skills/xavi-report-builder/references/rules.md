# Formula and completion rules

- XAVI period arguments must be literal values or cell references. Compute DATE,
  TEXT, EDATE, concatenation and arithmetic in helper cells before passing them to
  XAVI. Refresh All may skip expressions embedded in its arguments.
- Use the fiscal dates and reserved ranges in _conventions.md. Do not mix alternate
  filter layouts or hardcode January–December after asking for a fiscal-year start.
- Pass B3:B6 in every financial XAVI call, including NETINCOME, RETAINEDEARNINGS and
  CTA. Pass B8 in the accounting-book slot when supported. NAME/TYPE/PARENT are
  account lookups and do not take segment filters. Formula signatures are in formulas.md.
- Use actual account numbers from the user or loaded COA, stored as text before
  writing values. Financial calls and lookups reference those cells. Account
  prefixes such as 4* are not universally revenue; use them only when the COA
  establishes their scope. Summary reports use TYPEBALANCE.
- Balance-sheet types omit fromPeriod (`,,`). Income/expense calls need both period
  boundaries. NETINCOME also needs both, including for a single month.
- BUDGET uses the same single-month DATE-serial helper for both boundaries. Sum
  individual months for quarters and years. Do not pass a range or text-period
  string. Keep accountingBook and budgetCategory in their documented positions.
  Verify a nonblank category/book against a known budget before bulk fill; do not
  silently discard an unsupported filter.
- Balance Sheet/Trial Balance: exclude the GL retained earnings account from the
  equity type total before adding calculated RETAINEDEARNINGS. Obtain the account
  from the user or COA special-account metadata, inspecting actual column headers.
  TYPE(account) returns Equity, not a unique retained-earnings type. If the account
  is unknown, mark the equity section incomplete; do not promise entering an unused
  input later will fix a formula that never references it.
- Treat pending cells as unresolved, not as proof of success. #BUSY! can mean a
  request is in progress; #CALC! may be transient in XAVI but can also be persistent.
  Re-enter a transient #VALUE! formula once, then diagnose/report persistent errors.
  Use bounded waits. Numeric zero is a valid resolved value; errors are not zero.
- Determine completion from expected numeric cells and error status. COUNTA counts
  errors and formulas and cannot prove that asynchronous requests finished.
- Reapply final formatting after resolution because XAVI may replace number formats.
  If the wait expires, report pending cells and arrange the final pass when resolved.
  Do not re-enter genuinely pending budgets while Actuals are still fetching.
- Do not silently suppress failures or declare figures verified from mock data,
  successful formula writes, matching display formats, or a forced tie-out.
