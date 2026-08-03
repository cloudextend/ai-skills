# XAVI Report Builder — Build Rules (load with _conventions.md on every build)


- **⛔ NEVER embed Excel functions inside a XAVI argument — this rule overrides all other guidance.**
  Excel functions (`DATE`, `TEXT`, `EOMONTH`), `&` concatenation, and arithmetic (e.g. `$B$2-1`)
  inside a XAVI argument will cause Refresh All to silently skip the cell. XAVI's recalculation
  engine resolves period arguments by reading the literal cell value — it cannot evaluate a
  nested formula expression. Always compute the value in a **helper cell**, then pass that cell
  reference to the XAVI formula.
  - ❌ `=XAVI.TYPEBALANCE("Bank",,DATE($B$2,12,1),$B$3,$B$4,$B$5,$B$6)`
  - ❌ `=XAVI.TYPEBALANCE("AcctRec",,DATE($B$2-1,12,1),$B$3,$B$4,$B$5,$B$6)` ← arithmetic too
  - ❌ `=XAVI.NETINCOME(TEXT(DATE($B$2,$B$7,1),"mmm-yyyy"),$B$8,...)`
  - ✅ Write `=DATE($B$2,12,1)` in helper cell `$B$10` (labeled "FY End"), then:
    `=XAVI.TYPEBALANCE("Bank",,$B$10,$B$3,$B$4,$B$5,$B$6)`
  - ✅ Monthly header cell `C$9` already holds a DATE serial → `XAVI.TYPEBALANCE("Income",C$9,C$9,...)` ✓
  This rule applies to **every XAVI formula in every template** — no exceptions.
  When generating formula strings in Office.js, never concatenate `DATE(...)`, `TEXT(...)`,
  or any expression into the string. Reference a pre-written helper cell whose value has
  already been committed to the sheet via `context.sync()`.
  See each template for the specific helper cells to add to the filter block or helper area.

- **Use native input boxes for discrete user inputs.** When collecting a single value
  (account number, year, company name, hex color code, etc.), use the `ask_user_input`
  tool to render a native input box rather than asking as a prose chat question. This
  feels cleaner and more intentional than a typed reply in the chat thread. Use prose
  questions only for open-ended responses where an input box would be too constraining.
- **Platform — use Mac-safe Office.js unconditionally** (works on all platforms):
  `ChartType.line`+`series.smooth`, no `seriesBy` on line charts, `ChartDataLabelPosition.top`,
  never `autoFill` async XAVI cells. Detail in `references/office-js-notes.md`.

- **`XAVI.BUDGET` date range bug — sum single-month serials via helper cells.**
  `XAVI.BUDGET` does not handle a date range between `fromPeriod` and `toPeriod` —
  it returns 0 or wrong values. Both arguments must be the **same single period**,
  passed as a **cell reference** that resolves to a DATE serial — never a `DATE(...)`
  expression written inline (violates the no-Excel-functions-in-XAVI-args rule above).
  For monthly layouts, pass the month header cell (e.g. `C$9`). For quarterly layouts,
  use the individual-month helper cells defined in the template's helper area.
  Do NOT use `TEXT(...,"mmm-yyyy")` strings — the string form resolves to 0.
  For quarterly/full-year totals, sum individual single-month calls.
  Document in the task pane and README whenever a BvA report is built.
- **Stuck `#BUSY!` budget cells — re-enter, but only after Actuals resolve.**
  `XAVI.BUDGET` resolves in milliseconds. If a budget cell is still `#BUSY!`/`#CALC!`
  *after every `XAVI.BALANCE` Actual cell has resolved to a number*, it is stuck, not
  slow — re-enter it (read its formula, write the same string back, `context.sync()`).
  Gate strictly on Actuals-done: re-entering a cell that is genuinely mid-fetch cancels
  and restarts the fetch. Cap at 2 passes; if still stuck, tell the user to click that
  cell and press Enter rather than looping. Full step in `references/templates-budget.md`.
- **Executive Dashboard `$B$8` and `$B$9` are FORMULAS in General format — never text (`@`).**
  `$B$8` (Last Closed) = `="Apr-"&$B$2` (month abbrev from the user's normalized answer,
  year from B2). `$B$9` (PY Same Period) = `=LEFT($B$8,3)&"-"&($B$2-1)`. Both must stay
  General format — a text format would make Excel show the formula literally instead of
  the resolved period string. The dashboard prompt accepts a free-text month+year like
  "April 2026"; normalize the month to its 3-letter abbreviation (accept full name,
  abbreviation, or number) and parse the year into B2. Do not use `DATEVALUE` for B9 —
  it does not parse reliably. All period arguments resolve to dash-format strings.
- **Trial Balance period cells must be TEXT, not date serials.** For Trial Balance reports,
  XAVI parses period arguments as NetSuite accounting period strings (e.g. `"Dec-2025"`).
  Always set `numberFormat = [["@"]]` on the period cells BEFORE writing their values. Never
  use `=DATE(...)` in TB period cells. If IS account rows return 0 or `#CALC!` indefinitely,
  diagnose by checking whether the period cell `valueType` is `Double` — if so, reformat to
  text and prompt the user to retype. See full detail in `references/formulas.md`.
- **Never invent account numbers.** Use `XAVI.TYPEBALANCE` with the known account type strings
  for all summary-level formulas. Only use `XAVI.BALANCE` with an account number if the user
  explicitly provides one.
- **Account numbers always come from a cell, never a string literal.** When a report layout
  has an account-number column (Trial Balance, detailed Income Statement built from a COA),
  every `XAVI.BALANCE`, `XAVI.BUDGET`, `XAVI.NAME`, `XAVI.TYPE`, and `XAVI.PARENT` call must
  reference that cell (`$A{row}`), never embed the account number as a quoted string.
  Use `$A` (column-locked, row-relative) so the formula is draggable down the column.
  - ❌ `=XAVI.BALANCE("4010", $B$8, $B$7, $B$3, $B$4, $B$5, $B$6)`
  - ✅ `=XAVI.BALANCE($A11, $B$8, $B$7, $B$3, $B$4, $B$5, $B$6)`
  Wildcard patterns (`"4*"`, `"6*"`) and `XAVI.TYPEBALANCE` summary calls are the only
  exceptions — they have no per-row account cell to reference.
- **Always use cell references for all filters** — year (`$B$2`), subsidiary (`$B$3`),
  department (`$B$4`), location (`$B$5`), class (`$B$6`). Never hardcode any of these values
  inside formulas.
- **Always use helper/header cells for period arguments** — never a `DATE(...)` expression
  inside a XAVI call. Write `=DATE($B$2, month, 1)` into a dedicated cell (the month header
  row, a filter-block helper cell, or a named helper area — see each template). Then pass
  that cell reference as the period argument. The year must always derive from `$B$2`; the
  month from `$B$9` (FY start) via the fiscal year formula pattern in `_conventions.md`.
  Never hardcode strings like `"Jan 2025"` directly inside XAVI args either.
- **Balance Sheet accounts:** omit fromPeriod (use `,,` not `,""`) — they accumulate from
  inception.
- **XAVI.NETINCOME** always needs both fromPeriod and toPeriod to return YTD net income.
- **`#CALC!` is not an error.** Balance-sheet TYPEBALANCE calls (fromPeriod omitted) fetch from
  NetSuite asynchronously and show `#CALC!` while loading. Never conclude a formula is wrong
  from a `#CALC!` — wait for the fetch to complete, then re-read the value.
- **Do not diagnose wildcard formulas as understating mid-fetch.** `XAVI.BALANCE("4*")` and
  similar wildcards do tie out to TYPEBALANCE totals once fully resolved. Validate with a check
  cell after all values have settled.
- **Cash Flow — equity line:** Use `XAVI.TYPEBALANCE("Equity")` movement only. Never add
  `XAVI.CTA` to the financing section — CTA is already inside the equity balance (adding it
  double-counts) and it measures net-asset translation, not cash movement.
- **Balance Sheet / Trial Balance — always exclude the GL Retained Earnings account
  from `XAVI.TYPEBALANCE("Equity")`.** NetSuite never posts closing entries to RE via
  journal entry — it calculates RE dynamically from accumulated net income. The GL RE
  account therefore holds only a partial balance. If you add `XAVI.RETAINEDEARNINGS()` as
  a separate equity line without first subtracting the GL RE account from the Equity type
  total, it is double-counted and the balance sheet will not tie.
  Always: (1) ask the user for the RE account number before building equity, or (2) use
  INDEX/MATCH on the COA Spec Acct Type column (`"RetEarnings"`) to find it dynamically.
  Store the number in session memory as `reAccountNumber`, write it to cell `$B$10`
  (labeled "RE Account #" in A10, shaded `#EBF3FF`), and add a cell comment explaining
  why the account must be excluded. The equity formula references `$B$10` directly so
  the user can update it and all formulas refresh. Tell the user that updating B10 is
  all they need to do if the account number changes.
  See `references/templates-balance-sheet.md` for full setup instructions.
- **Cash Flow — FX line:** Compute the Effect of Exchange Rate on Cash as a residual:
  `(ending Bank − beginning Bank) − (operating + investing + financing)`. This is the only
  correct approach — do not use `XAVI.CTA` as a substitute.
- **`#VALUE!` — Claude re-enters automatically first, diagnoses second.** If a XAVI formula
  shows `#VALUE!`, Claude MUST re-enter the formula in place itself via execute_office_js —
  do NOT instruct the user to do it manually. Read the cell's `.formulas`, write the same
  formula string back to the cell, and `context.sync()`. This resolves most transient `#VALUE!`
  errors immediately. After re-entry, re-read the range: cells showing `#CALC!` are fetching
  normally. Only investigate parameter formatting (account in quotes, period format, skipped
  filters using `""` not a missing comma) if `#VALUE!` persists after re-entry. Loop the
  re-entry across the whole report range in one pass rather than cell-by-cell.
- **Fiscal year start (`$B$9`) drives all period formulas.** Every month header and
  period argument must derive from `$B$9` (FY start month, 1–12) and `$B$2` (year).
  Never hardcode month numbers. Use the fiscal year formula pattern in
  `references/_conventions.md` to compute correct dates for non-January FY starts.
- **Filter arguments: mandatory in every XAVI formula, including Cash Flow.**
  Always pass `$B$3, $B$4, $B$5, $B$6` for subsidiary/dept/location/class in every
  single XAVI call — including `XAVI.TYPEBALANCE`, `XAVI.NETINCOME`, `XAVI.BALANCE`,
  `XAVI.RETAINEDEARNINGS`, and `XAVI.CTA`. Use `""` for any blank filter argument.
  Never omit filter args from any formula, regardless of report type.
  When writing formulas via Office.js, always verify the generated formula string
  contains all four filter cell references before calling `context.sync()`.
  BvA reports add `$B$7` (Budget Category) as the last arg to `XAVI.BUDGET`.
- **Percentage format:** `0%;(0%)` on every variance/change/margin cell. No decimals.
  In Office.js: `range.numberFormat = [["0%;(0%)"]]`
- **Number format:** `#,##0_);(#,##0);"-"` on every value cell. No currency, no decimals.
  If a cell shows `$`, the format was not applied — overwrite explicitly. Never use
  `NumberFormatCategory.accounting` or `.currency`.
- **Formatting must be the LAST step, applied AFTER all XAVI cells resolve.** As each
  `XAVI` cell resolves from `#BUSY!`, XAVI stamps its own `$#,##0.00` format on that cell.
  If formats are applied while cells are still resolving, XAVI overwrites them as the
  values land and the report reverts to currency (including Var % showing `$-0.87`
  instead of `(87%)`). Always: write formulas → wait until every cell shows a real number
  (gate on resolution, re-entering any stuck cell) → THEN apply the format-enforcement
  pass as the final action. Phase 1 formatting is a head start, not the guarantee; the
  post-resolution pass is what actually sticks. Verify by reading back the LAST percent
  column, not the first.
- **Input/filter cell shading:** B2:B6 (and B7:B8 for TB/BvA) — fill `#EBF3FF`.
  Data, label, and formula cells have no fill.
- **Year is always a cell reference (`$B$2`).** Never hardcode a year literal anywhere.
- **Never mention template names anywhere** — not in chat, the task pane, or thinking
  aloud. Template numbers are internal only. Plain English ("YoY Comparison", "Balance
  Sheet") is fine. When a user asks for a report: "That's definitely possible — let's get
  started" and go straight to the questions.
- If a user asks "why is my number 0?" walk them through the troubleshooting checklist in
  `references/formulas.md`.
