# Budget vs. Actual

Ask for monthly/quarterly granularity, fiscal year/start month, budget source
(NetSuite or manual), and account scope. Obtain accounts from the user or COA;
never insert a fixed demo account list. Label a selected-account report as such.
For a revenue report, reconcile the included leaf accounts to TYPEBALANCE Income
and disclose excluded accounts. For mixed account types, group separately; do not
label their combined sum Total Revenue or apply a universal favorable/unfavorable sign.

Use shared inputs B2:B9. B7 is Budget Category; B8 is Accounting Book. Keep both
argument positions even when the book is blank. Before NetSuite budget bulk fill,
verify one known account/month/category against the user's source. Signature and
period limitations are in formulas.md. If the category/book signature is unsupported,
report that limitation instead of silently returning an unfiltered budget.

## Layout

Headers row 30; accounts start row 31. A = account number (text), B = account name
via NAME($A31). Each period has Actual, Budget, Variance, Variance %. After the last
period, add one four-column FY block. Compute every header/range from one map:

```javascript
const colLetter = n => {
  let s = '';
  while (n > 0) { n--; s = String.fromCharCode(65+n%26)+s; n = Math.floor(n/26); }
  return s;
};
const nPeriods = isQuarterly ? 4 : 12;
const blocks = Array.from({length:nPeriods+1}, (_,p) => ({
  actual:colLetter(3+4*p), budget:colLetter(4+4*p),
  variance:colLetter(5+4*p), percent:colLetter(6+4*p)
}));
```

Monthly occupies C:AX, FY AY:BB. Quarterly occupies C:R, FY S:V.
Do not use AA:AD for monthly FY totals; those columns are the seventh fiscal period.

Monthly Actual and Budget reference the corresponding D3:O3 helper twice.
Quarterly Actual references the start/end cells D8:G9. Quarterly Budget sums
three monthly calls (never a range):

```javascript
const budgetFormula = (row, monthOffsets) => '=' + monthOffsets.map(m => {
  const h = `$${String.fromCharCode(68+m)}$3`;
  return `XAVI.BUDGET($A${row},${h},${h},$B$3,$B$4,$B$5,$B$6,$B$8,$B$7)`;
}).join('+');
// Q1 example; Q2 uses [3,4,5], Q3 [6,7,8], Q4 [9,10,11].
const q1Budget = budgetFormula(31,[0,1,2]);
```

FY Actual/Budget sum existing period cells; no additional XAVI calls. Variance =
Actual − Budget. Percent = IF(Budget=0,"N/A",(Actual-Budget)/ABS(Budget)).
At a group total, sum amounts, then compute percent from those total amounts;
never sum row percentages. Default variance text is neutral, not red/green.

Manual-budget path: use clearly labeled input placeholders and explanatory notes;
state that comparisons are provisional until entered. Do not call XAVI.BUDGET.
Preserve manually entered budgets when updating other report parts.

Seed the first Actual; verify it resolves. If blank-filter scope is understood,
fill directly without the filter/fill-scope prompts. Otherwise clarify scope first.
Actuals and Budgets use identical segments/book. Explain B3:B8 controls on delivery.

## Completion and chart

Wait for all expected Actual cells to be numeric before considering budget re-entry.
If the wait expires, stop recovery and mark pending. After Actuals finish, re-enter
stuck budget cells at most twice with bounded waits/readback. If still pending,
report exact cells; do not repeatedly cancel their requests. Apply final formats
after resolution; verify every percent column, including the FY column.

For quarterly reports, chart aggregate Actual vs Budget for the four quarters.
Place staging data below the table/notes, with linked totals, not hardcoded values.
Use a clustered column chart, explicit series-by-columns, and exclude FY and
percentage columns. Respect any selected-account scope in chart title and README.
