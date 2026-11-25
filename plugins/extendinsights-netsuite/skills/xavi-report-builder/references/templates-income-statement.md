# Income statements and year comparisons

Read _conventions.md and rules.md. Inputs/helpers occupy rows 2–26; headers row 30;
data rows 31–42. Use the same segments B3:B6 for every variant.

## Summary / CFO Flash

| Row | Label | Calculation |
|---|---|---|
| 31 | Revenue | TYPEBALANCE Income |
| 32 | Other Income | TYPEBALANCE OthIncome |
| 33 | Total Income | Revenue + Other Income |
| 35 | COGS | TYPEBALANCE COGS |
| 36 | Gross Profit | Revenue − COGS |
| 38 | Operating Expenses | TYPEBALANCE Expense |
| 39 | Operating Income | Gross Profit − Operating Expenses |
| 41 | Other Expenses | TYPEBALANCE OthExpense |
| 42 | Net Income | Operating Income + Other Income − Other Expenses |

Rows 34, 37, 40 are spacers. This separates non-operating income from gross profit.
If the customer's presentation differs, label the chosen methodology explicitly.
Months C:N reference D3:O3; O holds full-year totals. Headers are references to date
helpers, formatted mmm-yyyy. Seed C31, then use this whole-report example (rewriting
the seed is harmless; skipping the whole revenue row is not):

```javascript
const cols = Array.from({length: 12}, (_, i) => String.fromCharCode(67+i));
const helpers = Array.from({length: 12}, (_, i) => `$${String.fromCharCode(68+i)}$3`);
const liveRows = [[31,'Income'],[32,'OthIncome'],[35,'COGS'],[38,'Expense'],[41,'OthExpense']];
sheet.getRange('C30:N30').formulas = [helpers.map(h => `=${h}`)];
for (const [row,type] of liveRows) {
  sheet.getRange(`C${row}:N${row}`).formulas = [helpers.map(h =>
    `=XAVI.TYPEBALANCE("${type}",${h},${h},$B$3,$B$4,$B$5,$B$6,$B$8)`)];
  sheet.getRange(`O${row}`).formulas = [[`=SUM(C${row}:N${row})`]];
}
for (const c of [...cols,'O']) {
  for (const [r,f] of [[33,`${c}31+${c}32`],[36,`${c}31-${c}35`],
    [39,`${c}36-${c}38`],[42,`${c}39+${c}32-${c}41`]]) {
    sheet.getRange(`${c}${r}`).formulas = [[`=${f}`]];
  }
}
```

For first-row fill, fill C31:N31 only and clearly mark remaining rows incomplete.
For full fill, check all 60 live cells and compare Net Income against NETINCOME for
the same period/filter/book. Use a check below row 42, not a helper or data cell.
Add a monthly revenue line chart below the check/notes when chart tools are available.

## Year-over-year

B2 = current fiscal start year, B11 = comparison fiscal start year; both editable.
Use common B3:B6 filters, B9 FY month and the shared current/prior helper rows.

Monthly columns: C:N current months, O current FY, P spacer, Q:AB prior months,
AC prior FY, AD spacer, AE amount change, AF percent change. Current dates reference
D3:O3; prior dates D4:O4. Use the same row calculations as the summary.

Quarterly columns: C:F current quarters, G current FY, H spacer, I:L prior quarters,
M prior FY, N spacer, O amount change, P percent change. Each TYPEBALANCE uses a
quarter start/end helper: D8/D9 for current Q1, E8/E9 Q2, F8/F9 Q3, G8/G9 Q4;
prior uses rows 10/11. Full year is the sum of four quarters. No helpers enter the
report's row-30 header or row-31+ data area.

Amount change = current FY − prior FY. Percent change =
`IF(priorFY=0,"N/A",(currentFY-priorFY)/ABS(priorFY))`.
Calculate percent directly even when the user requests percent only. Hide an
unrequested variance column, or omit it and adjust subsequent ranges consistently.
Do not make percent depend on an absent amount-change column.

Chart categories and series match selected granularity: 12 fiscal months or four
quarters; exclude FY and variance columns. Two series, one per selected year.
Verify month sequence, fiscal rollover, both years' totals and a zero prior total.

## Detailed income statement

Prefer the XAVI task pane → Quick Start → Build Income Statement, selecting the
requested year. Inspect its resulting layout before styling or adding formulas;
it does not necessarily use this skill's reserved ranges. Preserve working formulas.

Alternatively load the customer's COA through Bulk Add GL Accounts and inspect
actual column headers. Group accounts by actual type, not assumed number prefixes.
Build account rows with BALANCE referencing text account-number cells; omit summary
parents when summing leaves to avoid double counting. Use TYPEBALANCE as an
independent type-total check, not a replacement that hides incomplete detail.
Show an explicit unallocated difference if detail does not cover a type total.
Other income less other expense is a subtraction, not a sum of positive expenses.
Reconcile Net Income with NETINCOME. Do not infer complete coverage from a wildcard.
