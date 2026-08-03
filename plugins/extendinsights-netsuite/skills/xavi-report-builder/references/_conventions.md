# XAVI Report Templates

Complete formula layouts for each report type.

**Standard conventions (apply to all templates unless noted):**
- Filter block: A2:B9 — Year `$B$2`, Subsidiary `$B$3`, Department `$B$4`, Location `$B$5`,
  Class `$B$6`, FY Start Month `$B$9` (1=Jan, 4=Apr, etc. — drives all period formulas)
- BvA adds: Budget Category in `$B$7`; Trial Balance adds P&L From `$B$8`, P&L To `$B$7`
- Month headers in row 9 use FY start: first month = `=DATE($B$2,$B$9,1)`, subsequent
  months increment, wrapping year when month > 12. See fiscal year formula pattern below.
- Full Year header in O9; data starts at row 11
- All filter cells shaded `#EBF3FF`; column A bold right-aligned
- **Helper cells placement standard:** helper cells (computed dates, chart staging data, period
  ranges) always go in **columns D-E** (label in D, formula in E) or **D-F** (label + two value
  cols), in **rows 2-8** — the band that is always empty above the row-9 column headers and the
  row-11 data start. Never place helpers in columns beyond the last data column. Label the block
  with a bold header: `D2: "── Helpers ──"` (Deep Dive `#09235C`, no fill). If more than 7 rows
  are needed, extend downward as far as required, keeping all helpers in col D-F.
- `sheet.showGridlines = false` is always the first line of every Phase 1 block

**Fiscal year formula pattern (use whenever $B$9 may not be 1):**
```
Month n of the fiscal year (0-based offset from FY start):
  Month number:  =MOD($B$9 + n - 1, 12) + 1
  Year:          =IF(MOD($B$9 + n - 1, 12) + 1 >= $B$9, $B$2, $B$2 + 1)
  Full date:     =DATE(IF(MOD($B$9+n-1,12)+1>=$B$9,$B$2,$B$2+1), MOD($B$9+n-1,12)+1, 1)

For a standard calendar year ($B$9 = 1), this reduces to DATE($B$2, n+1, 1) as before.
For April FY start ($B$9 = 4):
  Period 1 = Apr-2025, Period 2 = May-2025, ... Period 9 = Dec-2025,
  Period 10 = Jan-2026, Period 11 = Feb-2026, Period 12 = Mar-2026
```
Always use this pattern for month headers and period arguments. Never hardcode
month numbers — `$B$9` must drive every period formula in the report.

**Quarter date ranges for non-January FY:**
```
Q1 from: =DATE(IF($B$9=1,$B$2,IF($B$9<=9,$B$2,$B$2-1)),$B$9,1)
Q1 to:   =DATE(IF($B$9=1,$B$2,IF($B$9<=9,$B$2,$B$2-1)),MOD($B$9+2,12)+1,1)
         (simplified: always 3 months after Q1 from)
Q2 from: 3 months after Q1 from
Q2 to:   3 months after Q1 to
... and so on for Q3, Q4
```
When building quarterly reports, confirm the four quarter date ranges with the
user (via `✓ Confirm` button) before writing any formulas — see Step 3.

Full Year column formula pattern: `=SUM(C{row}:N{row})`

---

## Notes and Reconciliation Block

After delivering any report, always offer to append a methodology notes section a few rows
below the final total. This is especially important for Cash Flow Statements but applies to all
reports.

### When to offer
Always — end every report delivery with:
> "Would you like me to add a methodology notes section below the report? It documents how the
> formulas work and any known differences vs the NetSuite UI, so the report is self-explanatory
> to any reviewer."

### Rules for note content
1. **Explain methodology, never hardcode dollar amounts.** A note saying "FX translation is
   embedded in each reported-currency balance" stays correct when the year changes or data
   refreshes. A note quoting "-$293,839" goes stale and becomes misleading.
2. **If a figure is genuinely useful, reference it with a live formula** — never a typed number.
   Example: `="Net Income ties to the P&L: "&TEXT(C11,"#,##0")` — no `$` in format string
3. **Prefer plain-language prose** over tables or numbers in notes.

### Standard note topics by report type

**Cash Flow Statement:**
- Method: indirect method using reported-currency balance deltas; net income plus working-capital
  changes in operating, investing, and financing sections
- Tie-out: computed ending cash vs `XAVI.TYPEBALANCE("Bank")` ending — difference must be 0
- FX line: the Effect of Exchange Rate on Cash line is computed as the residual between actual
  cash movement and the sum of operating + investing + financing. This keeps per-section totals
  correct and surfaces FX explicitly rather than burying it across lines.
- Equity line: uses `XAVI.TYPEBALANCE("Equity")` movement only. CTA is already inside the
  equity balance — adding it separately would double-count and distort the financing section.
  CTA measures net-asset translation, not cash movement.
- Multi-currency: individual line amounts will differ from the NetSuite UI (which uses
  functional-currency movements); the FX residual line accounts for this difference and the
  tie-out still equals 0.
- Account typing: AR is net of contra accounts; Deferred Revenue broken out separately from
  Other Current Liabilities

**Balance Sheet:**
- Method: TYPEBALANCE with balance sheet account types summed from inception
- Tie-out: Total Assets vs Total Liabilities and Equity — difference should be 0
- Multi-currency: translated balances at period-end rates; CTA captures residual translation
  adjustment in equity

**Income Statement / CFO Flash:**
- Method: TYPEBALANCE by account type; period = single month or full year per column
- XAVI handles sign conventions automatically

### Period argument types (quick reference; full detail in formulas.md)

⛔ **Never put `DATE(...)`, `TEXT(...)`, `EOMONTH(...)`, arithmetic, or `&` concatenation
directly inside a XAVI argument — Refresh All cannot parse it and skips the cell.**
Compute the value in a helper cell and pass that cell reference to XAVI instead.
See each template's "Helper cells" section for the cells to add in Phase 1.

- Income statement / P&L: reference the month-header cell (e.g., `C$9`, already a DATE serial)
  for both fromPeriod and toPeriod. For balance-sheet or single-date reports, use the dedicated
  helper cell (e.g., `$B$8` = `=DATE($B$2,12,1)`). Never write `DATE(...)` inside XAVI.
- Balance Sheet accounts: OMIT fromPeriod (`,,` not `,""`) — they accumulate from inception;
  pass only the "as of" period as toPeriod, using a helper cell.
- Trial Balance & Dashboard: period cells are TEXT (`MMM-YYYY`, dash not space). Format the
  cell as text (`@`) UNLESS the cell is a formula (e.g. dashboard `="Apr-"&$B$2`), which must
  stay General so it evaluates. Reference these cells inside XAVI; never embed TEXT() directly.
- XAVI.BUDGET: same single DATE serial for both args (reference the month-header cell `C$9`);
  never a date range; never a `TEXT(...)` string. Sum single months for quarter/year totals.

### Essential formatting (all reports — inlined so formatting.md is not needed)

- **Numbers:** `#,##0_);(#,##0);"-"` on every value cell. No currency symbol, no decimals.
  Never use Accounting/Currency category (they add `$`). Office.js: `range.numberFormat`.
- **Percentages:** `0%;(0%)` on variance/margin/change cells. No decimals.
- **Apply formats to the FULL data range in Phase 1** (even while empty) so XAVI data lands
  pre-formatted, then re-assert as the LAST step after all cells resolve (XAVI re-stamps
  currency format as each cell resolves — formatting must come after resolution).
- **Gridlines:** `sheet.showGridlines = false` as the first line of every `Excel.run`.
- **Title:** bold 14pt, color `#004FB6`. **Headers:** bold, color `#09235C`.
- **Subtotals:** bold + single top border. **Final total:** bold + double bottom border.
- **No color fills on data rows.** Filter input cells shaded `#EBF3FF` only.
- For deeper formatting questions only, load `formatting.md`.

### Formatting for notes
- Place 3 rows below the final total/check row
- Heading: bold, 11pt, color `#09235C` — e.g. "Notes and Methodology"
- Body: italic, 10pt, color `#595959` (medium gray), normal weight
- No borders, no fills
- One blank row between each note topic
