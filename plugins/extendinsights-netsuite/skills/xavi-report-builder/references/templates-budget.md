# XAVI Templates — Budget vs. Actual

> Shared conventions and the Notes/Reconciliation block are in `_conventions.md`.

## FAST-PATH RECIPE (read this, then act — do not re-derive the layout)

A quarterly BvA is a fixed, known layout. Do not deliberate over structure — execute:
1. **Batch 1 question:** company name · report title · brand colors (one `ask_user_input`).
2. **Batch 2 question:** year + FY start · monthly/quarterly · budget source (one call).
3. If quarterly: **one** confirm call with the 4 quarter ranges embedded in the question text.
4. **Phase 1 (one `Excel.run`):** filter block A2:B7, title, headers row 8–9, account numbers
   A11:A20, names `=XAVI.NAME($A{r})` B11:B20, Total Revenue row 21, all Var$/Var% arithmetic,
   number formats, widths, gridlines off. Bulk range writes only.
5. **Phase 2:** seed C11, re-enter once.
6. **Phase 4 (skip both prompts — fill immediately):** loop-generate budget formulas, bulk-write
   Actuals + Budgets, FY Budget = `=D{r}+H{r}+L{r}+P{r}`.
7. **Step A:** wait until every cell resolves; re-enter stuck budget cells (cap 2 passes).
8. **Step B (LAST):** format-enforcement pass (compute Var% cols), verify last % column.
9. **Phase 5:** quarterly Actual-vs-Budget chart.
10. README, closing recap.

Columns (quarterly): C/D/E/F = Q1 Actual/Budget/Var$/Var%; G/H/I/J = Q2; K/L/M/N = Q3;
O/P/Q/R = Q4; S/T/U/V = FY Actual/Budget/Var$/Var%. Accounts rows 11–20, Total row 21.

Full detail below — but the recipe above is the whole job. Act on it.

---

## Template 4 — Budget vs. Actual

### Setup questions — ask upfront using `ask_user_input`, in this order

**Question 1 — Budget data source:**
> "Where is your budget data stored?"
- Option 1: `NetSuite` — use `XAVI.BUDGET` formulas
- Option 2: `Somewhere else` — insert placeholder cells the user fills manually

**Question 2 — Year:**
> "What year should this report cover?"
- `ask_user_input` free-text, e.g. `2025`

**Question 3 — Granularity:**
> "Monthly or quarterly comparison?"
- Option 1: `Monthly` — 12 period columns
- Option 2: `Quarterly` — Q1–Q4 columns

After collecting answers: **immediately write the shell (Phase 1)** — structure, labels,
headers, preset column widths — before writing any XAVI formulas. Speed illusion first.

---

### Filter block layout

```
A2: Year              B2: [year]        ← shaded #EBF3FF
A3: Subsidiary        B3: [value]       ← shaded
A4: Department        B4: [value]       ← shaded
A5: Location          B5: [value]       ← shaded
A6: Class             B6: [value]       ← shaded
A7: Budget Category   B7: [value]       ← shaded — passed as last arg to XAVI.BUDGET
A9: FY Start Month    B9: [1-12]        ← shaded — drives all period formulas
```

`$B$7` (Budget Category) is the additional filter for BvA. It maps to the optional
`budgetCategory` parameter in `XAVI.BUDGET`. Leave blank to pull all budget categories.

---

### Account list (current fixed set — temporary)

Always use exactly these 10 accounts for this report until further notice:

| Account | Label |
|---------|-------|
| 4000 | Revenue |
| 4002 | Revenue |
| 4004 | Revenue |
| 4006 | Revenue |
| 4008 | Revenue |
| 4010 | Revenue |
| 4100 | Revenue |
| 4200 | Revenue |
| 4300 | Revenue |
| 4400 | Revenue |

Place account numbers in column A (A11:A20). **Column B account names must use
`=XAVI.NAME($A11)`** — never hardcode the label text. This pulls the live account name
from NetSuite so the report always matches the chart of accounts. Example for row 11:
`=XAVI.NAME($A11)` → "Sales", row 12 `=XAVI.NAME($A12)` → "Sales - Merchandise", etc.

All XAVI.BALANCE, XAVI.BUDGET, and XAVI.NAME formulas reference `$A{row}` — never hardcode
account numbers or names in formulas.

---

### Column structure — Monthly

```
Col A: Account number   (values: 4000, 4002, … 4400)
Col B: Account name     =XAVI.NAME($A11)
Col C: Jan Actual       =XAVI.BALANCE($A11, C$9, C$9, $B$3,$B$4,$B$5,$B$6)
Col D: Jan Budget       =XAVI.BUDGET($A11, C$9, C$9, $B$3,$B$4,$B$5,$B$6,$B$7)  [or placeholder]
Col E: Jan Variance $   =C11-D11
Col F: Jan Variance %   =IF(D11=0,"N/A",(C11-D11)/ABS(D11))
[cols G–Z: Feb–Dec, same pattern, each month = 4 columns: Actual, Budget, Var$, Var%]
Col AA: Full Year Actual  =SUM of all monthly Actual cols for this row
Col AB: Full Year Budget  =SUM of the 12 monthly Budget cells already on this row (D,H,L,... ) — NOT new XAVI calls
Col AC: FY Variance $     =AA{row}-AB{row}
Col AD: FY Variance %     =IF(AB{row}=0,"N/A",(AA{row}-AB{row})/ABS(AB{row}))
```

**Month header rows (row 9):**
```
C9: =DATE($B$2,1,1)   format mmm-yyyy   label for Jan Actual
D9: "Budget"           Jan Budget header
E9: "Var $"
F9: "Var %"
[repeat G–Z for Feb–Dec]
AA9: "Full Year Actual"
AB9: "Full Year Budget"
AC9: "Var $"
AD9: "Var %"
```

**Year band header (row 8):** Merge C8:AD8, centered, `brand.titleColor` tint:
`="← " & $B$2 & " Budget vs. Actual →"`

---

### Column structure — Quarterly

> ⚠️ XAVI.BUDGET does not support date ranges (returns 0). Use single-month `DATE(...)`
> serials summed for quarter/year totals — see "Budget source: NetSuite path" below.
> Quarterly Actual uses a standard date range via XAVI.BALANCE (this works fine).
> Quarterly Budget must sum three individual monthly XAVI.BUDGET calls per quarter.

**Quarterly layout requires period helper cells.** Add to Phase 1 before any XAVI formula
strings: a hidden helper row (row 10, `sheet.getRange("C10:N10").rowHidden = true`) with 12
monthly DATE serials, one per column, using the FY start month pattern. Then add quarter
start/end helpers in the **col D-F helper block** (rows 2-8, alongside the filter block).
These cells
are referenced by all quarterly XAVI formula strings — `DATE(...)` is never embedded inline.

```javascript
// Phase 1 addition — 12-month helper row (hidden, C10:N10)
const monthHelpers = Array.from({length: 12}, (_, m) => {
  const mo = `MOD($B$9+${m}-1,12)+1`;
  const yr = `IF(MOD($B$9+${m}-1,12)+1>=$B$9,$B$2,$B$2+1)`;
  return `=DATE(${yr},${mo},1)`;
});
sheet.getRange("C10:N10").formulas = [monthHelpers];
sheet.getRange("C10:N10").rowHidden = true; // hidden helper row; referenced by formula strings
```

**Quarter formulas — reference helper cells:**
```
Col C: Q1 Actual   =XAVI.BALANCE($A11,$C$10,$E$10,$B$3,$B$4,$B$5,$B$6)
                    ↑ C10=FY Month 1 (start), E10=FY Month 3 (end)
Col D: Q1 Budget   =XAVI.BUDGET($A11,$C$10,$C$10,$B$3,$B$4,$B$5,$B$6,$B$7)
                   +XAVI.BUDGET($A11,$D$10,$D$10,$B$3,$B$4,$B$5,$B$6,$B$7)
                   +XAVI.BUDGET($A11,$E$10,$E$10,$B$3,$B$4,$B$5,$B$6,$B$7)
```
Q2 Actual: `$F$10` to `$H$10`, Q3: `$I$10` to `$K$10`, Q4: `$L$10` to `$N$10`.

Q2 Budget (cols H): months 4+5+6, Q3 Budget (col L): months 7+8+9, Q4 Budget (col P): months 10+11+12
Full Year Budget (col T): sum the 4 quarter Budget cells `=D{row}+H{row}+L{row}+P{row}` — no extra XAVI calls

```
Col S: Full Year Actual   =C11+G11+K11+O11  (sum of Q1–Q4 Actual)
Col T: Full Year Budget   =D{row}+H{row}+L{row}+P{row}  (sum of the 4 quarter Budget cells)
Col U: FY Var $           =S{row}-T{row}
Col V: FY Var %           =IF(T{row}=0,"N/A",(S{row}-T{row})/ABS(T{row}))
```

**Quarter headers (row 9):**
```
C9: "Q1 Actual"   D9: "Q1 Budget"   E9: "Var $"   F9: "Var %"
G9: "Q2 Actual"   H9: "Q2 Budget"   I9: "Var $"   J9: "Var %"
K9: "Q3 Actual"   L9: "Q3 Budget"   M9: "Var $"   N9: "Var %"
O9: "Q4 Actual"   P9: "Q4 Budget"   Q9: "Var $"   R9: "Var %"
S9: "Full Year Actual"   T9: "Full Year Budget"   U9: "Var $"   V9: "Var %"
```

---

### Budget source: NetSuite path

> ⚠️ **XAVI.BUDGET known bug:** A date range (different from/to periods) does not work —
> it returns incorrect results or 0. Each call must use the **same single period** (the
> same `DATE(...)` serial) for both the from and to argument. To get multi-month totals
> (quarterly, full year), **sum individual single-month calls**.
>
> **Use real `DATE(...)` serials — NOT `TEXT(...,"mmm-yyyy")` strings.** The string form
> resolves to 0. Pass the same `DATE($B$2,m,1)` arguments you use in `XAVI.BALANCE`.

**Monthly budget column formula (col D, Jan):**
```
=XAVI.BUDGET($A11,C$9,C$9,$B$3,$B$4,$B$5,$B$6,$B$7)
```
Where `C$9` is the month header cell — a real `DATE($B$2,1,1)` serial (displayed as
mmm-yyyy but stored as a date). Pass it directly; do NOT wrap it in `TEXT(...)`.
`$B$7` is the Budget Category filter (blank = all categories).
`$A11` references the account number cell — never hardcode.

**Quarterly budget formula (e.g. Q1 = Jan + Feb + Mar) — reference helper cells C10:E10:**
```
=XAVI.BUDGET($A11,$C$10,$C$10,$B$3,$B$4,$B$5,$B$6,$B$7)
+XAVI.BUDGET($A11,$D$10,$D$10,$B$3,$B$4,$B$5,$B$6,$B$7)
+XAVI.BUDGET($A11,$E$10,$E$10,$B$3,$B$4,$B$5,$B$6,$B$7)
```
(Q2 = F10:H10 — Q3 = I10:K10 — Q4 = L10:N10)

**Full Year budget — do NOT write 12 more XAVI calls.** Sum the cells already on the row:
```
Quarterly layout:  =D{row}+H{row}+L{row}+P{row}   (the four quarter Budget cells)
Monthly layout:    =SUM of the 12 monthly Budget cells already on the row
```
Each quarter cell already sums its 3 months, so the four-quarter sum equals all 12 months
with zero additional `XAVI.BUDGET` calls. This is plain Excel arithmetic — instant, and it
avoids generating a 700-character 12-call formula per row (the main cause of slow builds).

### Budget source: Somewhere else (placeholder path)

For budget columns, write a placeholder value of `0` formatted as the standard number
format. Add a cell comment to each budget cell:
```javascript
sheet.comments.add(
  sheet.getRange("D11"),
  "Budget placeholder — replace with your actual budget figure for this account and period."
);
```
Add the comment only to the first budget cell per row (D11 for monthly, D11 for quarterly).
Tell the user:
> "I've added budget placeholders you can fill in manually. Each budget cell has a note
> explaining what to enter. Replace the 0s with your figures — the variance columns
> will update automatically."

---

### Formatting

- **Actual columns:** plain number format `#,##0_);(#,##0);"-"` — NO currency symbol,
  NO decimals. Same format as Budget columns. White background.
- **Budget columns:** same `#,##0_);(#,##0);"-"` format. Very light gray fill `#F5F5F5`
  for subtle visual distinction from Actual.
- **Variance $ columns:** `#,##0_);(#,##0);"-"`, no fill, neutral black text (no red/green).
- **Variance % columns:** format `0%;(0%)` — percent, NO decimals, parentheses for negative.
  Never currency. This is the most commonly mis-formatted column — apply `0%;(0%)` explicitly
  to every Var % cell in Phase 1 and re-assert in the Phase 4 enforcement pass.
- **Apply all formats to the full data range in Phase 1**, not just header cells — so XAVI
  values land into already-formatted cells instead of inheriting the locale default
  (`$#,##0.00`). Re-assert in Phase 4 after formulas resolve.
- **Column widths (Phase 1 preset):** all Actual and Budget columns = 90px; Var$ = 80px; Var% = 60px
- Section headers, subtotals, gridlines off: same rules as all other templates
- Column widths: preset in Phase 1 (no autofit round-trip); user adjusts manually if needed

---

### Four-phase build sequence

**Phase 1 — Shell (immediate, before any XAVI calls):**
- `sheet.showGridlines = false` — first line, always
- Filter block A2:B7 with labels and shaded input cells (B7 = Budget Category, new)
- Account numbers A11:A20; account names B11:B20 via `=XAVI.NAME($A{row})`
- **Total Revenue row at row 21:** label "Total Revenue" in B21 (bold, single top border);
  each column = SUM of rows 11:20 (e.g. Full Year Actual total `=SUM(AA11:AA20)`,
  Full Year Budget total `=SUM(AB11:AB20)`). This row feeds the chart.
- All column headers (rows 8–9)
- All calculated columns (Var $, Var %, Full Year totals) as plain arithmetic
- Column width presets (90px Actual/Budget, 80px Var$, 60px Var%)
- Formatting: borders, bold headers, number formats

Send before Phase 1: `"📐 Building your Budget vs. Actual structure..."`

**Phase 2 — Seed one formula:**
Write `C11` (Jan Actual for account 4000) only. Wait for resolve.
Send: `"🔗 Connecting to NetSuite... testing the first actual formula."`

**Phase 3 — SKIPPED for Budget vs. Actual.**
Do NOT show the "set your filters, then continue" prompt. BvA fills immediately with all
filters blank (consolidated, all segments, all budget categories). The user can set the
filter cells (B3–B7) afterward and the report recalculates automatically — tell them this
in the closing message rather than pausing the build. Go straight from the seed formula
(Phase 2) to the bulk fill (Phase 4).

**Phase 4 — Bulk fill (no prompts — fill immediately):**
**Skip BOTH the filter prompt and the fill-scope prompt.** Neither applies to BvA. After
the seed formula resolves, fill the entire report in one pass with filters left blank.

Write all Actual columns in one pass, then all Budget columns (NetSuite path) or skip
(placeholder path). Variance columns are already written as arithmetic in Phase 1 — no
XAVI calls needed.

After the fill, include this in the closing message so the user knows how to filter:
> "The report is built consolidated across all segments. To filter, set the cells in
> B3–B6 (Subsidiary, Department, Location, Class) using the XAVI task pane, or type a
> Budget Category in B7 — the whole report recalculates automatically when you do."

> ⚠️ **Build budget formula strings with a JS loop — never hand-write them.**
> Each quarterly Budget cell is a 3-call `XAVI.BUDGET` sum (~180 chars); typing these out
> longhand for every row is the main cause of multi-minute stalls (Claude spends minutes
> generating ~14,000 characters of near-identical formula text before the write fires).
> Instead, generate the strings programmatically inside the Office.js block so Claude
> writes the loop ONCE:
> ```javascript
> // C10:N10 is the hidden 12-month helper row written in Phase 1.
> // Column C = FY month 1, D = FY month 2, ..., N = FY month 12.
> // colLetter(3) = "C", colLetter(4) = "D", etc.
> // Build the 3-call quarterly budget sum for a given row + quarter start col index (1-based).
> const budgetQ = (row, startColIdx) =>
>   [startColIdx, startColIdx+1, startColIdx+2]  // three consecutive month helper columns
>     .map(ci => {
>       const c = colLetter(ci);
>       // ✅ Reference helper cell — no DATE() inside XAVI arg string
>       return `XAVI.BUDGET($A${row},$${c}$10,$${c}$10,$B$3,$B$4,$B$5,$B$6,$B$7)`;
>     })
>     .join("+");
>
> const rows = [11,12,13,14,15,16,17,18,19,20];
> // Quarter Budget columns → first month helper column index (C=3, F=6, I=9, L=12)
> const qStart = { D:3, H:6, L:9, P:12 };
> for (const [col, ci] of Object.entries(qStart)) {
>   const formulas = rows.map(r => [`=${budgetQ(r, ci)}`]);
>   sheet.getRange(`${col}11:${col}20`).formulas = formulas;
> }
> // Full Year Budget = sum the 4 quarter cells (NOT 12 more calls)
> sheet.getRange("T11:T20").formulas = rows.map(r => [`=D${r}+H${r}+L${r}+P${r}`]);
> ```
> This writes 4 bulk range assignments instead of 40 hand-typed formulas, and the FY
> column is plain arithmetic. For the MONTHLY layout, the loop is even simpler — one
> single-month `XAVI.BUDGET` call per Budget column, no 3-call sum.

When writing budget columns (NetSuite path), send this task pane message first:
> "📊 Writing budget formulas. `XAVI.BUDGET` resolves per single period, so I'm building
> each quarter as a sum of its three months — this returns accurate totals. The Full Year
> column just adds the four quarters together, so it's instant. See the README for details."

**Phase 4 — Step A then Step B: ONE continuous finalize routine.**

> ⚠️ **THE BUG THIS PREVENTS:** the resolution-wait and the format pass are NOT two
> separate fire-and-forget blocks. If the wait step `return`s early because cells are
> still `#CALC!`, the format pass must still run *after* they resolve. Previously the wait
> block exited on its own and nothing re-ran the formatting — so XAVI's currency stamp
> survived and every column (including Var %) stayed `$`. The routine below loops until
> cells resolve, THEN formats, in one unbroken flow. Never split these into two calls that
> can exit independently.

**Why formatting must come last:** as each `XAVI` cell resolves from `#CALC!`, XAVI stamps
its own `$#,##0.00` format on that cell. Formatting applied before resolution gets
overwritten. So: wait for every cell to resolve (re-entering any stuck budget cell), and
only then apply formats — as the final action, guaranteed to run.

```javascript
// Column maps — set isQuarterly from the build choice.
const colLetter = n => { let s=""; while(n>0){ const r=(n-1)%26; s=String.fromCharCode(65+r)+s; n=Math.floor((n-1)/26);} return s; };
const firstRow = 11, lastRow = 21, nRows = lastRow - firstRow + 1;
const nBlocks = isQuarterly ? 4 : 12;
const blockStart = 3;                                   // column C
const lastCol = colLetter(blockStart + nBlocks*4 + 4 - 1);
const actualCols = []; const budgetCols = []; const varPctCols = [];
for (let b = 0; b < nBlocks; b++) {
  actualCols.push(colLetter(blockStart + b*4));         // Actual = 1st col of block
  budgetCols.push(colLetter(blockStart + b*4 + 1));     // Budget = 2nd col
  varPctCols.push(colLetter(blockStart + b*4 + 3));     // Var %  = 4th col
}
actualCols.push(colLetter(blockStart + nBlocks*4));     // FY Actual
budgetCols.push(colLetter(blockStart + nBlocks*4 + 1)); // FY Budget
varPctCols.push(colLetter(blockStart + nBlocks*4 + 3)); // FY Var %

const NUM='#,##0_);(#,##0);"-"', PCT='0%;(0%)';
const isBusy = t => t.includes("#CALC!") || t.includes("#BUSY!");

// ONE routine: wait (with bounded retries) → clear stuck → THEN format. No early exit
// that skips formatting. Up to ~10 short waits (~2s each) for resolution.
await Excel.run(async (context) => {
  const sheet = context.workbook.worksheets.getActiveWorksheet();
  sheet.showGridlines = false;

  // --- Step A: wait for Actuals, then re-enter any stuck budget cells ---
  for (let attempt = 0; attempt < 10; attempt++) {
    let anyBusy = false;
    for (const col of actualCols) {
      const r = sheet.getRange(`${col}${firstRow}:${col}${lastRow}`);
      r.load("text"); await context.sync();
      if (r.text.flat().some(isBusy)) { anyBusy = true; break; }
    }
    if (!anyBusy) break;                 // actuals done → proceed to budget/format
    await new Promise(res => setTimeout(res, 2000));  // brief wait, then re-check
  }
  // Re-enter stuck budget cells (cap 2 passes)
  for (let pass = 0; pass < 2; pass++) {
    let reentered = 0;
    for (const col of budgetCols) {
      const rng = sheet.getRange(`${col}${firstRow}:${col}${lastRow}`);
      rng.load("text, formulas"); await context.sync();
      rng.text.forEach((row, i) => {
        if (isBusy(row[0])) { sheet.getRange(`${col}${firstRow+i}`).formulas = [[rng.formulas[i][0]]]; reentered++; }
      });
    }
    await context.sync();
    if (reentered === 0) break;
  }

  // --- Step B: format pass — ALWAYS runs, in the same routine, as the last action ---
  const fullRange = sheet.getRange(`C${firstRow}:${lastCol}${lastRow}`);
  fullRange.load("columnCount"); await context.sync();
  fullRange.numberFormat = Array.from({length:nRows}, () => Array(fullRange.columnCount).fill(NUM));
  varPctCols.forEach(c =>
    sheet.getRange(`${c}${firstRow}:${c}${lastRow}`).numberFormat =
      Array.from({length:nRows}, () => [PCT]));
  await context.sync();

  // --- Verify: read back the LAST Var % column (not F, which is always fine) ---
  const lastPct = varPctCols[varPctCols.length - 1];
  const chk = sheet.getRange(`${lastPct}${firstRow}`);
  chk.load("numberFormat"); await context.sync();
  // If chk.numberFormat[0][0] still contains "$", re-apply the varPctCols loop once more.
});
```

The single most important property: **the format pass lives inside the same routine as the
wait, after it — it cannot be skipped by an early return.** If a budget cell is still
`#BUSY!` after the bounded wait, leave it and tell the user to click it and press Enter;
the rest of the report is still correctly formatted.

**A Var % column showing `$` is a build failure, not a cosmetic issue.**

### Phase 5 — Quarterly Actual vs. Budget chart

Act as a data analyst presenting a weekly revenue check-in. Plot a clustered column chart
**below the data** with one category per quarter (Q1–Q4) and two series (Actual, Budget) —
so the exec sees per-quarter performance against plan, not just a single full-year pair.

**Helper range — col D-F, rows 3-7** (visible alongside the filter block — never in far-right
columns). Links to the Total Revenue row 21. `D2` holds the "── Helpers ──" label; the chart
data occupies `D3:F7`:

```
D2: "── Helpers ──"  (bold, #09235C, no fill — section label)
D3: (blank)    E3: "Actual"   F3: "Budget"
D4: "Q1"       E4: =C21       F4: =D21
D5: "Q2"       E5: =G21       F5: =H21
D6: "Q3"       E6: =K21       F6: =L21
D7: "Q4"       E7: =O21       F7: =P21
```

(For a **MONTHLY** report: extend to rows 4–15 with 12 month rows instead of 4 quarter rows,
pointing at each month's Actual/Budget total columns.)

**Mac-safe Office.js:**
```javascript
sheet.showGridlines = false;
const chart = sheet.charts.add(Excel.ChartType.columnClustered,
  sheet.getRange("D3:F7"), Excel.ChartSeriesBy.columns);
chart.title.text = "Total Revenue — Actual vs. Budget by Quarter";
chart.title.visible = true;
chart.legend.visible = true;                       // two series — legend needed
chart.legend.position = Excel.ChartLegendPosition.bottom;
chart.setPosition(sheet.getRange("B24"), sheet.getRange("J42"));
const sA = chart.series.getItemAt(0);              // Actual
const sB = chart.series.getItemAt(1);              // Budget
sA.format.fill.setSolidColor("#004FB6");           // Actual — Blue Light
sB.format.fill.setSolidColor("#A8B1CE");           // Budget — Chrome
[sA, sB].forEach(s => {
  s.hasDataLabels = true;
  s.dataLabels.numberFormat = "#,##0";
  s.dataLabels.position = Excel.ChartDataLabelPosition.outsideEnd;
});
const va = chart.axes.getItem(Excel.ChartAxisType.value);
va.visible = false; va.majorGridlines.visible = false; va.minorGridlines.visible = false;
chart.axes.getItem(Excel.ChartAxisType.category).majorGridlines.visible = false;
chart.format.fill.clear(); chart.plotArea.format.fill.clear();
await context.sync();
```

**Note:** use `Excel.ChartSeriesBy.columns` (NOT `rows`) — with a quarter-per-row helper,
`columns` makes Q1–Q4 the categories and Actual/Budget the two series. `rows` produces one
single-point series per quarter and throws "Parameter out of range" on point-level coloring.

**Why these choices (data-analyst framing):**
- Clustered column per quarter — the exec sees the trend across the year and where Actual
  pulled ahead of or fell behind plan, not just one aggregate pair.
- Data labels replace the Y axis — exact numbers without scanning a scale.
- No gridlines, transparent background — clean for pasting into a weekly deck or email.
- Helper cells in D3:F7 are visible alongside the filter block — easy for the user to audit.

**If `capabilities.chartApiAvailable === false`** (confirmed by `detectCapabilities()`
probe — not inferred from a single error): skip the chart, leave the Total Revenue row
in place, and include it in `buildExecutionReport()` under `featuresSkipped`. Tell the
user in the final report that the chart was skipped and the totals row is ready to chart
manually. Do not skip the chart for any other reason — `InvalidArgument` on a chart
call is a Mac platform API issue, not an availability issue.
