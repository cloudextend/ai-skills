# XAVI Templates — Income Statement Family

> Shared conventions and the Notes/Reconciliation block are in `_conventions.md`.
> Read that file too if you have not already.

## FAST-PATH RECIPE (read this, then act — do not re-derive the layout)

This file holds three layouts: **CFO Flash** (high-level monthly P&L), **YoY Comparison**
(two years side by side), and **Detailed IS** (every GL account). Pick by the user's request.

Common flow for all three:
1. **Batch 1 question:** company name · report title · brand colors (one `ask_user_input`).
2. **Batch 2 question:** year (+ prior year for YoY) · FY start month · monthly or quarterly
   (YoY only) (one `ask_user_input`). If quarterly, one confirm call with ranges in the text.
3. **Phase 1 (one `Excel.run`):** filter block, title/subtitle, month or quarter headers,
   all row labels, plain-math subtotal rows (Total Revenue, Gross Profit, Operating Income,
   Net Income) and Full-Year columns, number formats, borders, gridlines off. Bulk writes.
4. **Phase 2:** seed C11 (Revenue), re-enter once.
5. **Phase 3:** ▶ Continue filter prompt for B3–B6.
6. **Phase 4 (one `Excel.run`):** loop-generate and bulk-write the XAVI rows; format pass last.
7. Optional revenue trend chart (CFO Flash / YoY), README, closing recap.

CFO Flash rows: 11 Revenue, 12 Other Income, 13 Total Revenue, 15 COGS, 16 Gross Profit,
18 OpEx, 19 Operating Income, 21 Other Expense, 22 Net Income. Months C–N, Full Year O.
Detail and YoY layouts are below. Act on the recipe; the detail confirms it.

---

## Template 1 — CFO Flash Report (High-Level P&L)

Uses only `XAVI.TYPEBALANCE`. Works for any company regardless of chart of accounts.

### Filter Setup
```
A2: Year             B2: [year, e.g. 2025]   ← change to update the whole report
A3: Subsidiary       B3: [subsidiary name or ""]
A4: Department       B4: [dept name or ""]
A5: Location         B5: [location name or ""]
A6: Class            B6: [class name or ""]
A9: FY Start Month   B9: [1–12, e.g. 1 for Jan, 4 for Apr]  ← drives all periods
```

### Report Layout

| Row | Label (col B) | Formula (col C — repeat for D–N) | Col O (Full Year) |
|-----|--------------|----------------------------------|-------------------|
| 1 | **[brand.companyName] CFO Flash Report** | ← merged B1:O1, bold 14pt `brand.titleColor` | |
| 2 | **[brand.companyName] — [Subsidiary] — [Year]** | ← subtitle, `=brand.companyName&" — "&$B$3&" — "&$B$2` | |
| 7 | *(blank spacer)* | | |
| 8 | **[blank]** | ← section gap before headers | |
| 9 | *(blank)* | Month headers using FY start: `=DATE(IF(MOD($B$9+0-1,12)+1>=$B$9,$B$2,$B$2+1),MOD($B$9+0-1,12)+1,1)` for period 1, incrementing for periods 2–12. Format mmm-yyyy. | "Full Year" |
| 10 | *(spacer row)* | | |
| 11 | **Revenue** | `=XAVI.TYPEBALANCE("Income",C$9,C$9,$B$3,$B$4,$B$5,$B$6)` | `=SUM(C11:N11)` |
| 12 | **Other Income** | `=XAVI.TYPEBALANCE("OthIncome",C$9,C$9,$B$3,$B$4,$B$5,$B$6)` | `=SUM(C12:N12)` |
| 13 | **Total Revenue** | `=C11+C12` | `=O11+O12` |
| 14 | *(spacer — height 6pt)* | | |
| 15 | **Cost of Goods Sold** | `=XAVI.TYPEBALANCE("COGS",C$9,C$9,$B$3,$B$4,$B$5,$B$6)` | `=SUM(C15:N15)` |
| 16 | **Gross Profit** | `=C13-C15` | `=O13-O15` |
| 17 | *(spacer)* | | |
| 18 | **Operating Expenses** | `=XAVI.TYPEBALANCE("Expense",C$9,C$9,$B$3,$B$4,$B$5,$B$6)` | `=SUM(C18:N18)` |
| 19 | **Operating Income** | `=C16-C18` | `=O16-O18` |
| 20 | *(spacer)* | | |
| 21 | **Other Expenses** | `=XAVI.TYPEBALANCE("OthExpense",C$9,C$9,$B$3,$B$4,$B$5,$B$6)` | `=SUM(C21:N21)` |
| 22 | **Net Income** | `=C19-C21` | `=O19-O21` |

### Formatting flags
- Row 13 (Total Revenue): bold, top border
- Row 16 (Gross Profit): bold, top border
- Row 19 (Operating Income): bold, top border
- Row 22 (Net Income): bold, **double bottom border**

### Note on sign conventions
XAVI formulas handle sign conventions automatically — numbers will display correctly for
financial statement presentation without any manual adjustments.


### Revenue chart (always add for CFO Flash / high-level income statement)

After the report data is complete and all XAVI formulas have resolved, always add a monthly
revenue line chart below the report. Build it via Office.js.

**Chart specification:**
- **Type:** Create as `Excel.ChartType.line`, then set `series.smooth = true` and marker
  properties on the series after the chart exists. Do NOT use `lineMarkersSmoothed` —
  it throws `InvalidArgument` on some builds (including Mac Excel).
- **`charts.add` call:** Pass type and data range only — no third `seriesBy` argument.
  `charts.add(type, range, Excel.ChartSeriesBy.rows)` throws `InvalidArgument` here.
- **Data series:** ONE series only — the 12 monthly revenue values (C11:N11).
  Do NOT include the month header row (C9:N9) as a series — set it as category labels
  via `setCategoryNames()` to prevent the date row being picked up as a second series.
- **Series color:** Use `brand.headerColor` if branding was specified in Step 2; otherwise
  use `#09235C` (Deep Dive). Revenue must never be red, even when positive.
  Set via `series.format.line.color` and marker color properties.
- **Data labels:** Visible, position `Excel.ChartDataLabelPosition.top` (NOT `.above` —
  `.above` is only valid for bar/column charts and throws `InvalidArgument` on line series).
  Format as `#,##0` — no currency symbol, no decimals.
- **Y-axis and gridlines:** Run in a separate `context.sync()` block after the chart exists.
  Set `valueAxis.visible = false`, hide major and minor gridlines on both axes. Isolating
  this guarantees axis/gridline cleanup applies even if an earlier styling line is rejected.
- **Legend:** Hidden (single series).
- **Placement:** Below the last report row, left-aligned with column B.

**Office.js implementation pattern (two-sync approach):**
```javascript
await Excel.run(async (context) => {
  const sheet = context.workbook.worksheets.getActiveWorksheet();

  // --- Sync 1: create chart, position, title, categories, series styling ---

  // Create as plain line — NOT lineMarkersSmoothed (throws InvalidArgument on Mac + some builds)
  // Do NOT pass seriesBy argument — throws InvalidArgument
  const dataRange = sheet.getRange("C11:N11");
  const chart = sheet.charts.add(Excel.ChartType.line, dataRange);

  // Position below report
  chart.left   = sheet.getRange("B26").left;
  chart.top    = sheet.getRange("B28").top;
  chart.width  = 700;
  chart.height = 220;

  // Title
  chart.title.text    = "Monthly Revenue";
  chart.title.visible = true;

  // X-axis categories: month header row as labels only, not data
  const categoryRange = sheet.getRange("C9:N9");
  chart.axes.getItem(Excel.ChartAxisType.category).setCategoryNames(categoryRange);

  // Series: smooth line + circle markers + brand color
  const series = chart.series.getItemAt(0);
  series.smooth = true;                                        // smoothed line without using lineMarkersSmoothed type
  series.format.line.color = "#09235C";                       // default; replace with brand.headerColor if specified
  series.markerStyle           = Excel.ChartMarkerStyle.circle;
  series.markerForegroundColor = "#09235C";                   // same — use brand.headerColor if specified
  series.markerBackgroundColor = "#09235C";
  series.markerSize            = 6;

  // Data labels: use .top for line charts (NOT .above — throws InvalidArgument on line series)
  series.hasDataLabels                  = true;
  series.dataLabels.position            = Excel.ChartDataLabelPosition.top;
  series.dataLabels.numberFormat        = "#,##0";  // no currency symbol, no decimals
  series.dataLabels.showValue           = true;

  // Hide legend
  chart.legend.visible = false;

  // Remove chart border/background
  chart.format.fill.clear();
  chart.plotArea.format.fill.clear();

  // Read revenue values to compute y-axis floor
  dataRange.load("values");
  await context.sync();  // Sync 1

  // --- Sync 2: axis visibility + gridlines (isolated so styling failures don't block this) ---
  await Excel.run(async (context2) => {
    const sheet2  = context2.workbook.worksheets.getActiveWorksheet();
    const chart2  = sheet2.charts.getItemAt(sheet2.charts.getCount() - 1);

    const valueAxis = chart2.axes.getItem(Excel.ChartAxisType.value);
    const catAxis   = chart2.axes.getItem(Excel.ChartAxisType.category);

    // Compute y-axis minimum from revenue data
    // (dataRange.values loaded in Sync 1 — use the values already read above)
    // Note: if called from within the same Excel.run, pass revenueValues through closure
    valueAxis.visible              = false;
    valueAxis.maximumScaleIsAuto   = true;
    valueAxis.minimumScaleIsAuto   = false;

    // Hide all gridlines
    valueAxis.majorGridlines.visible = false;
    valueAxis.minorGridlines.visible = false;
    catAxis.majorGridlines.visible   = false;
    catAxis.minorGridlines.visible   = false;

    await context2.sync();  // Sync 2
  });
});

// After Sync 1 completes, set y-axis floor using read revenue values:
// const revenueValues = dataRange.values[0].filter(v => typeof v === "number" && v > 0);
// const minRevenue = Math.min(...revenueValues);
// valueAxis.minimumScale = minRevenue * 0.90;  // 10% below lowest point
// (include this inside the Sync 2 block when refactoring into a single Excel.run)
```

> **⚠️ Mac Excel note:** `lineMarkersSmoothed`, the `seriesBy` argument, and
> `ChartDataLabelPosition.above` all throw `InvalidArgument` on Mac Excel (and some browser
> builds). The pattern above avoids all three. If axis hiding still fails on Mac, wrap the
> Sync 2 block in a try/catch and log the error — the chart will still display correctly
> without it.

After placing the chart, tell the user:
> "I've added a monthly revenue chart below the report. The line uses your brand color
> and the y-axis is scaled to the data range so the trend is easy to read. You can
> resize or move it in Excel at any time."
### Performance: batch fill pattern (when execute_office_js is available)

When Claude has `execute_office_js` access, always follow the four-phase build sequence
defined in `SKILL.md` Step 3. Full implementation below.

**⚠️ CRITICAL: Do NOT use `autoFill` on XAVI formula cells.**
Research confirms a known Office.js crash when `autoFill` is called on a range containing
async Promise-based custom functions (which is exactly what XAVI formulas are — they fetch
from NetSuite asynchronously). Instead, write all XAVI formula strings directly via
`.formulas` on the full target range in a single `context.sync()`. This is safe, fast, and
produces identical results. `autoFill` IS safe for plain arithmetic rows (calculated rows
like Total Revenue, Gross Profit) — only avoid it for cells containing XAVI formulas.

No artificial delays are needed. XAVI's batch optimization is triggered by the formula
pattern in the cells, not by timing or user gesture simulation.

---

**Phase 1 — Structure (single fast Office.js pass)**

ONE `Excel.run`, ONE `context.sync()`. `showGridlines = false` is the FIRST line.
All writes are bulk range assignments — never cell-by-cell, never `autoFill`.

```javascript
await Excel.run(async (context) => {
  const sheet = context.workbook.worksheets.getActiveWorksheet();
  sheet.showGridlines = false;                              // FIRST LINE — always
  context.application.suspendScreenUpdatingUntilNextSync(); // batch render

  // Filter block labels (bulk) — B3:B6 left empty for user to fill via XAVI task pane
  sheet.getRange("A2:A9").values = [
    ["Year"],["Subsidiary"],["Department"],["Location"],["Class"],[""],[""],["FY Start Month"]
  ];
  sheet.getRange("A2:A9").format.font.bold = true;
  sheet.getRange("A2:A9").format.horizontalAlignment = "Right";
  // Known values (year + FY start collected upfront)
  sheet.getRange("B2").values = [[year]];          // e.g. 2025
  sheet.getRange("B9").values = [[fyStartMonth]];  // e.g. 1
  sheet.getRange("B2:B9").format.fill.color = "#EBF3FF";

  // Title + subtitle
  sheet.getRange("B1").values = [[reportTitle]];   // actual brand title
  sheet.getRange("B1").format.font.bold = true;
  sheet.getRange("B1").format.font.size = 14;
  sheet.getRange("B1").format.font.color = titleColor; // brand.titleColor

  // Month headers (row 9) — ONE bulk formula write, not a loop
  // Uses FY start so non-Jan fiscal years work
  const headerFormulas = [];
  for (let m = 0; m < 12; m++) {
    headerFormulas.push(
      `=DATE(IF(MOD($B$9+${m}-1,12)+1>=$B$9,$B$2,$B$2+1),MOD($B$9+${m}-1,12)+1,1)`
    );
  }
  sheet.getRange("C9:N9").formulas = [headerFormulas];
  sheet.getRange("C9:N9").numberFormat = Array(1).fill(Array(12).fill("mmm-yyyy"));
  sheet.getRange("O9").values = [["Full Year"]];
  sheet.getRange("C9:O9").format.font.bold = true;

  // Row labels — ONE bulk write
  sheet.getRange("B11:B22").values = [
    ["Revenue"],["Other Income"],["Total Revenue"],[""],
    ["Cost of Goods Sold"],["Gross Profit"],[""],
    ["Operating Expenses"],["Operating Income"],[""],
    ["Other Expenses"],["Net Income"]
  ];

  // Calculated rows — write the full C:N arithmetic as 2D arrays (NO autoFill)
  // Total Revenue (row 13), Gross Profit (16), Operating Income (19), Net Income (22)
  const cols = ["C","D","E","F","G","H","I","J","K","L","M","N"];
  sheet.getRange("C13:N13").formulas = [cols.map(c => `=${c}11+${c}12`)];
  sheet.getRange("C16:N16").formulas = [cols.map(c => `=${c}13-${c}15`)];
  sheet.getRange("C19:N19").formulas = [cols.map(c => `=${c}16-${c}18`)];
  sheet.getRange("C22:N22").formulas = [cols.map(c => `=${c}19-${c}21`)];

  // Full Year column O (bulk) for XAVI data rows + subtotal rows
  sheet.getRange("O11:O22").formulas = [
    ["=SUM(C11:N11)"],["=SUM(C12:N12)"],["=O11+O12"],[""],
    ["=SUM(C15:N15)"],["=O13-O15"],[""],
    ["=SUM(C18:N18)"],["=O16-O18"],[""],
    ["=SUM(C21:N21)"],["=O19-O21"]
  ];

  // Number format — no currency, no decimals (one bulk write)
  sheet.getRange("C11:O22").numberFormat =
    Array(12).fill(Array(13).fill('#,##0_);(#,##0);"-"'));

  // Column widths — preset XAVI data columns (never col A/B)
  sheet.getRange("C:O").format.columnWidth = 90;
  sheet.getRange("A:A").format.autofitColumns();

  await context.sync(); // single sync — sheet appears complete in one frame
});
```

After Phase 1, immediately proceed to Phase 2 (seed C11) — do NOT prompt for filters yet.
The XAVI task pane filter selector requires a live formula on the sheet to work.

---

**Phase 2 — Seed formula (C11 only, direct `.formulas` write)**

Write inside the existing context — do NOT wrap in a new `Excel.run`. If already inside an
`Excel.run`, use the existing `context` and `sheet` directly:

```javascript
// Already inside Excel.run — use existing context, do NOT nest another Excel.run
sheet.getRange("C11").formulas =
  [['=XAVI.TYPEBALANCE("Income",C$9,C$9,$B$3,$B$4,$B$5,$B$6)']];
await context.sync();
// Read C11 back to confirm it resolved (not #VALUE!)
const seedCell = sheet.getRange("C11");
seedCell.load("values");
await context.sync();
const seedValue = seedCell.values[0][0];
// If seedValue === "#VALUE!", re-enter: write same formula string back, context.sync()
```

If calling from a separate execution context, open a new `Excel.run` for this step only —
never nest `Excel.run` inside another `Excel.run`.

After C11 resolves: show the filter prompt as a **▶ Continue** button panel
(see `SKILL.md` Step 3 Phase 3). Do not proceed until the button is clicked.

---

**Phase 4a — Fill this row (direct `.formulas` write across C11:N11)**

Build the 12 formula strings by incrementing the column reference, write the full row in
one `.formulas` assignment. Use the existing context — do NOT nest a new `Excel.run`:

```javascript
// Use existing context and sheet — do NOT wrap in a new Excel.run
const cols = ["C","D","E","F","G","H","I","J","K","L","M","N"];
const row11formulas = cols.map(col =>
  `=XAVI.TYPEBALANCE("Income",${col}$9,${col}$9,$B$3,$B$4,$B$5,$B$6)`
);
sheet.getRange("C11:N11").formulas = [row11formulas];
await context.sync();
```
Then return to the fill-scope prompt for the next XAVI row.

---

**Phase 4b — Fill the whole report (all XAVI rows, one pass)**

C11 is already written — skip it, start from C12. Use the existing context:

```javascript
// Use existing context and sheet — do NOT wrap in a new Excel.run
const cols = ["C","D","E","F","G","H","I","J","K","L","M","N"];

const xaviRows = [
  // C11 already seeded — skip
  { row: 12, type: "OthIncome" },
  { row: 15, type: "COGS"      },
  { row: 18, type: "Expense"   },
  { row: 21, type: "OthExpense"},
];

xaviRows.forEach(({ row, type }) => {
  const formulas = cols.map(col =>
    `=XAVI.TYPEBALANCE("${type}",${col}$9,${col}$9,$B$3,$B$4,$B$5,$B$6)`
  );
  sheet.getRange(`C${row}:N${row}`).formulas = [formulas];
});

await context.sync();
```

---

## Template 1B — CFO Flash Year-over-Year Comparison

Use this template when a user asks to compare two years on a high-level income statement
(e.g. "compare 2024 to 2025", "show me YoY", "2024 vs 2025 P&L").

### Setup questions — ask all at once before building

> "A few quick questions before I build the comparison:
>
> 1. **Granularity** — Monthly (12 columns per year) or Quarterly (Q1–Q4 per year)?
> 2. **Variance display** — Dollar change only, percent change only, or both?
> 3. **Years** — You mentioned [year A] vs [year B]. I'll show the newer year on the left.
>    Does that work, or would you prefer a different order?"

### Filter block layout

```
A2: Year (Current)   B2: 2025   ← drives current-year month/quarter headers
A3: Year (Prior)     C2: 2024   ← drives prior-year month/quarter headers
A4: Subsidiary       B4: [value or blank]
A5: Department       B5: [value or blank]
A6: Location         B6: [value or blank]
A7: Class            B7: [value or blank]
```

Both B2 and C2 are editable — the user can compare any two years, not just consecutive ones.
Always shade B2, C2, and B4:B7 with `#EBF3FF` to signal they are editable.

---

### Layout — Monthly granularity

**Column structure:**

```
Col B:  Row labels
Cols C–N:   Current year months (Jan–Dec, driven by $B$2)
Col O:      Current year Full Year total
[blank col P — visual separator]
Cols Q–AB:  Prior year months (Jan–Dec, driven by $C$2)
Col AC:     Prior year Full Year total
[blank col AD — visual separator]
Col AE:     $ Change  (Full Year current − Full Year prior)
Col AF:     % Change  ($ Change ÷ |Prior Year|)   ← show only if user requested
```

Show only the columns the user asked for ($ only, % only, or both AE and AF).

**Header rows:**

```
Row 1:  Report title — merged full width, brand.titleColor
Row 2:  Subtitle
Row 5:  "← [Current Year] →"  merged over C5:O5, centered, bold, brand.titleColor light tint
Row 6:  "← [Prior Year] →"    merged over Q5:AC5, centered, bold, lighter tint
Row 9:  Month headers for current year: =DATE($B$2,1,n) in C9:N9, format mmm-yyyy
        "Full Year" in O9
        Month headers for prior year:   =DATE($C$2,1,n) in Q9:AB9, format mmm-yyyy
        "Full Year" in AC9
        "$ Change" in AE9 (if requested), "% Change" in AF9 (if requested)
```

**Formula table (current year — cols C:O):**

| Row | Label | Current year formula (col C, repeat C→N) | Full Year (col O) |
|-----|-------|------------------------------------------|-------------------|
| 11 | Revenue | `=XAVI.TYPEBALANCE("Income",C$9,C$9,$B$4,$B$5,$B$6,$B$7)` | `=SUM(C11:N11)` |
| 12 | Other Income | `=XAVI.TYPEBALANCE("OthIncome",C$9,C$9,$B$4,$B$5,$B$6,$B$7)` | `=SUM(C12:N12)` |
| 13 | **Total Revenue** | `=C11+C12` | `=O11+O12` |
| 14 | *(spacer)* | | |
| 15 | Cost of Goods Sold | `=XAVI.TYPEBALANCE("COGS",C$9,C$9,$B$4,$B$5,$B$6,$B$7)` | `=SUM(C15:N15)` |
| 16 | **Gross Profit** | `=C13-C15` | `=O13-O15` |
| 17 | *(spacer)* | | |
| 18 | Operating Expenses | `=XAVI.TYPEBALANCE("Expense",C$9,C$9,$B$4,$B$5,$B$6,$B$7)` | `=SUM(C18:N18)` |
| 19 | **Operating Income** | `=C16-C18` | `=O16-O18` |
| 20 | *(spacer)* | | |
| 21 | Other Expenses | `=XAVI.TYPEBALANCE("OthExpense",C$9,C$9,$B$4,$B$5,$B$6,$B$7)` | `=SUM(C21:N21)` |
| 22 | **Net Income** | `=C19-C21` | `=O19-O21` |

**Prior year formulas (cols Q:AC):** identical pattern, month headers reference `$C$2`:
```
Q9:  =DATE($C$2,1,1)   R9: =DATE($C$2,2,1)  ... AB9: =DATE($C$2,12,1)
Q11: =XAVI.TYPEBALANCE("Income",Q$9,Q$9,$B$4,$B$5,$B$6,$B$7)
```
(Same rows, same TYPEBALANCE types, same filter cells — only the header row reference changes.)

**Variance columns (Full Year only — cols AE and/or AF):**

| Row | $ Change (col AE) | % Change (col AF) |
|-----|-------------------|-------------------|
| 11 | `=O11-AC11` | `=IF(AC11=0,"N/A",AE11/ABS(AC11))` |
| 12 | `=O12-AC12` | `=IF(AC12=0,"N/A",AE12/ABS(AC12))` |
| 13 | `=O13-AC13` | `=IF(AC13=0,"N/A",AE13/ABS(AC13))` |
| 15 | `=O15-AC15` | `=IF(AC15=0,"N/A",AE15/ABS(AC15))` |
| 16 | `=O16-AC16` | `=IF(AC16=0,"N/A",AE16/ABS(AC16))` |
| 18 | `=O18-AC18` | `=IF(AC18=0,"N/A",AE18/ABS(AC18))` |
| 19 | `=O19-AC19` | `=IF(AC19=0,"N/A",AE19/ABS(AC19))` |
| 21 | `=O21-AC21` | `=IF(AC21=0,"N/A",AE21/ABS(AC21))` |
| 22 | `=O22-AC22` | `=IF(AC22=0,"N/A",AE22/ABS(AC22))` |

Number format for % Change column: `0%;(0%)` — no decimal places, parentheses for negative.
Number format for $ Change column: same as all other number columns — `#,##0_);(#,##0);"-"`.
Variance colors: neutral — no red/green. Black text throughout.

---

### Layout — Quarterly granularity

**Column structure:**

```
Col B:  Row labels
Cols C–F:   Current year Q1–Q4  (each = sum of 3 TYPEBALANCE months)
Col G:      Current year Full Year
[blank col H]
Cols I–L:   Prior year Q1–Q4
Col M:      Prior year Full Year
[blank col N]
Col O:      $ Change  (if requested)
Col P:      % Change  (if requested)
```

**Quarter headers (row 9):**
```
C9: "Q1 [current year]"  = "Q1 "&$B$2
D9: "Q2 [current year]"  = "Q2 "&$B$2
E9: "Q3 [current year]"  = "Q3 "&$B$2
F9: "Q4 [current year]"  = "Q4 "&$B$2
G9: "Full Year"
I9: "Q1 [prior year]"    = "Q1 "&$C$2
... etc.
```

**Quarter formulas:** Before writing any XAVI formulas, write 8 quarter helper cells to the
**col D-E helper block** (rows 3-10, visible alongside the filter block — never far-right
columns). Labels go in col D, DATE formulas in col E. `D2` holds the "── Helpers ──" label.

```javascript
// Phase 1 addition — write quarter date helpers (before any XAVI formula strings):
// D2 = section header; D3:E10 = Q1-Q4 start/end date serials
sheet.getRange("D2").values = [["── Helpers ──"]];
sheet.getRange("D2").format.font.bold = true;
sheet.getRange("D2").format.font.color = "#09235C";

const qHelpers = [
  ["Q1 Start", `=DATE($B$2,$B$9,1)`],                      // D3 / E3
  ["Q1 End",   `=DATE($B$2,MOD($B$9+1,12)+1,1)`],          // D4 / E4  (end of month 3 of FY)
  ["Q2 Start", `=DATE($B$2,MOD($B$9+2,12)+1,1)`],          // D5 / E5
  ["Q2 End",   `=DATE($B$2,MOD($B$9+4,12)+1,1)`],          // D6 / E6
  ["Q3 Start", `=DATE($B$2,MOD($B$9+5,12)+1,1)`],          // D7 / E7
  ["Q3 End",   `=DATE($B$2,MOD($B$9+7,12)+1,1)`],          // D8 / E8
  ["Q4 Start", `=DATE($B$2,MOD($B$9+8,12)+1,1)`],          // D9 / E9
  ["Q4 End",   `=DATE($B$2,MOD($B$9+10,12)+1,1)`],         // D10 / E10
];
sheet.getRange("D3:D10").values = qHelpers.map(r => [r[0]]);
sheet.getRange("E3:E10").formulas = qHelpers.map(r => [r[1]]);
sheet.getRange("D3:E10").format.fill.color = "#EBF3FF";
await context.sync();
```

**Quarter formulas — reference the helper cells, never inline `DATE(...)`:**
```
Q1 current Revenue (E3=Q1 start, E4=Q1 end):
=XAVI.TYPEBALANCE("Income",$E$3,$E$4,$B$4,$B$5,$B$6,$B$7)

Q2 current Revenue:
=XAVI.TYPEBALANCE("Income",$E$5,$E$6,$B$4,$B$5,$B$6,$B$7)

Q3 current Revenue:
=XAVI.TYPEBALANCE("Income",$E$7,$E$8,$B$4,$B$5,$B$6,$B$7)

Q4 current Revenue:
=XAVI.TYPEBALANCE("Income",$E$9,$E$10,$B$4,$B$5,$B$6,$B$7)

Full Year current Revenue (sum Q1–Q4 cells already on the sheet — no XAVI call):
=C11+D11+E11+F11
```

> **Full Year column note:** For quarterly layouts, always compute Full Year as the sum of
> the four quarter cells already on the sheet — never a separate XAVI call with year-range
> dates. This eliminates the need for any full-year period helper cells.

(Prior year: identical pattern — add a matching set of prior-year quarter helpers in cols D-E
using a second set of rows (e.g. D11:E18) with `$C$2` instead of `$B$2`, then reference those
`$E$` cells in prior-year formula strings.)
Variance columns: same formulas as monthly, referencing Full Year columns G and M.

---

### Formatting

- **Year band headers** (rows 5–6 above month/quarter headers): merged, centered, bold.
  Current year band: `brand.titleColor` at ~15% opacity background fill.
  Prior year band: `#A8B1CE` (Chrome) at ~15% opacity.
- **Blank separator columns** (P and AD for monthly, H and N for quarterly): width ~4,
  no borders, no fill — acts as visual breathing room between the two year blocks.
- **Variance column headers**: bold, right-aligned. `brand.titleColor` text.
- All other formatting rules from `_conventions.md` (Essential formatting) apply (gridlines off,
  subtotals bold + top border, Net Income double bottom border, `#EBF3FF` input cells,
  0 decimal places).

---

### Multi-year revenue chart

When building this template, always update the revenue chart to show both years.

**Two-line chart spec:**
- One line per year — current year and prior year on the same chart
- X-axis: 12 months (Jan–Dec) using month names only (not year-specific dates), so both
  lines align on the same axis
- Current year line: full `brand.headerColor` (fallback `#09235C`), solid, markers on
- Prior year line: same color at ~50% opacity — achieve by using a lighter hex variant
  (e.g. `#8094AE` for a muted version of `#09235C`), dashed line, markers off
- Data labels: on for current year only; off for prior year (avoids clutter)
- Legend: visible (two series need labels) — position bottom, no border
- All other chart properties (no gridlines, y-axis hidden with dynamic floor,
  `ChartType.line` + `series.smooth`, no `seriesBy` arg, `.top` for label position)
  same as Template 1 single-year chart

**Office.js — add second series:**
```javascript
// After chart is created with current year data range (C11:N11):
const priorRevenueRange = sheet.getRange("Q11:AB11");  // prior year revenue row
chart.series.add();
const priorSeries = chart.series.getItemAt(1);
priorSeries.setValues(priorRevenueRange);
priorSeries.name = String(C2value);        // prior year label e.g. "2024"
priorSeries.smooth = true;
priorSeries.format.line.color = "#8094AE"; // muted blue — prior year
priorSeries.format.line.lineStyle = Excel.ChartLineStyle.dash;
priorSeries.markerStyle = Excel.ChartMarkerStyle.none;
priorSeries.hasDataLabels = false;

// Current year series (already exists at index 0):
const currentSeries = chart.series.getItemAt(0);
currentSeries.name = String(B2value);      // current year label e.g. "2025"
// (color, markers, labels already set per Template 1 chart spec)

// Show legend for two-series chart
chart.legend.visible = true;
chart.legend.position = Excel.ChartLegendPosition.bottom;
chart.legend.format.border.lineStyle = Excel.ChartLineStyle.none;
```

---

### Build sequence

**Phase 1 — Shell (single `Excel.run`, one `context.sync()`):**
- `sheet.showGridlines = false;` — absolute first line, no exceptions
- `context.application.suspendScreenUpdatingUntilNextSync();` — second line
- Filter block A2:C9 (note: two year cells, B2 current + C2 prior), bulk write
- Year band headers (rows 5–6), column headers (row 9) for both year blocks
- All row labels (column B) in one bulk write
- Calculated subtotal rows and Full Year totals as plain arithmetic
- Variance columns (plain arithmetic — no XAVI)
- Number formats, borders, shading, column widths
- One `context.sync()` at the end

**Phase 2 — Seed:** write first current-year XAVI cell, re-enter to clear #VALUE! (2 syncs).

**Phase 3 — Filter prompt:** standard B3:B7 prompt with ▶ Continue button.

**Phase 4 — Bulk fill (single `Excel.run`):**
- `sheet.showGridlines = false;` — first line here too
- Fill current year XAVI columns, then prior year XAVI columns
- Variance columns already written in Phase 1 (arithmetic)
- Format enforcement pass: re-apply `#,##0_);(#,##0);"-"` across all value cells
- One `context.sync()` at the end

After Phase 4, create/update the README (see SKILL.md). Column widths are preset in Phase 1 — no autofit round-trip; the user can adjust manually.
Every `Excel.run` that touches the sheet sets `showGridlines = false` as its first line.


---

## Template 2 — Detailed Income Statement (Pre-Built)

**Do not generate formulas for this template.** Direct the user to the task pane:

> 1. Open the XAVI task pane → Quick Start → **Build Income Statement**
> 2. Select year → **Build**
>
> After it builds, offer to:
> - Apply the Essential formatting rules from `_conventions.md`
> - Add a filter row (subsidiary/dept/class) that references existing formulas
> - Add a Full Year total column: `=SUM(C{row}:N{row})`
> - Add Budget vs. Actual columns

### Alternative — build from a GL account list (when the task pane is not used)

If the user can provide their chart of accounts, build a detailed formula-driven income
statement directly using these rules:

**1. Load the COA onto a dedicated sheet first using XAVI's Bulk Add feature.**
Direct the user to do the following in the XAVI add-in:

> 1. Navigate to (or create) a blank sheet to hold the account list — e.g. "COA"
> 2. Open the XAVI add-in task pane
> 3. In the **GL Account** entry box, type `*`
> 4. Click **Bulk Add GL Accounts**
>
> XAVI will populate the sheet with every GL account in NetSuite, including account type,
> account number, parent, and account name. This is the authoritative source — read this
> sheet to learn the actual account structure before writing any formulas.

**2. Derive groupings from the real account numbers — never from assumed prefixes.**
Revenue and expense numbering is frequently a mix of 4- and 5-digit accounts (e.g. `4000`,
`42000`, `43100`). A top-level wildcard like `XAVI.BALANCE("4*", ...)` for all revenue is
reliable, but category-level wildcards like `"40*"` or `"45*"` will silently miss most of the
balance unless the COA confirms those prefixes are exhaustive. Always inspect the COA before
choosing category wildcards.

**3. Anchor each subtotal to its type total — never to a sum of category lines.**
Set:
- Total Revenue = `XAVI.TYPEBALANCE("Income", ...)`
- Total COGS = `XAVI.TYPEBALANCE("COGS", ...)`
- Total OpEx = `XAVI.TYPEBALANCE("Expense", ...)`
- Total Other Income = `XAVI.TYPEBALANCE("OthIncome", ...)` + `XAVI.TYPEBALANCE("OthExpense", ...)`

Category breakout lines sum toward the type total. Add a balancing "Other [category]" line
computed as `type total − SUM(category lines)`. This guarantees the statement can never
silently under-report even if a category wildcard misses an account.

**4. Verify the tie-out before delivering.**
Confirm Total Revenue, Total COGS, and Net Income each equal the corresponding
`XAVI.TYPEBALANCE` / `XAVI.NETINCOME` value. Note: intercompany and allocation accounts often
appear as a large positive in COGS offset by a large negative in Operating Expense Allocations —
these net to zero and are expected behavior, not an error.

**5. Layout.**
Standard monthly columns C–N driven by `=DATE($B$2,month,1)` headers in row 9 (same as all
other templates), plus a Full Year column O = `=SUM(C{row}:N{row})`. Group in this order:

```
Revenue (by category)
Total Revenue          ← XAVI.TYPEBALANCE("Income", ...) — top border, bold
[spacer]
Cost of Sales (by category)
Total COGS             ← XAVI.TYPEBALANCE("COGS", ...) — top border, bold
[spacer]
Gross Profit           ← Total Revenue − Total COGS — top border, bold
[spacer]
Operating Expenses (by category)
Total Operating Expenses ← XAVI.TYPEBALANCE("Expense", ...) — top border, bold
[spacer]
Operating Income       ← Gross Profit − Total OpEx — top border, bold
[spacer]
Other Income / (Expense) (by category)
[spacer]
Net Income             ← XAVI.NETINCOME(...) — double bottom border, bold
```

---

