# XAVI Templates — Subsidiary Comparison & Executive Dashboard

> Shared conventions and the Notes/Reconciliation block are in `_conventions.md`.

## FAST-PATH RECIPE (read this, then act — do not re-derive the layout)

This file holds **Subsidiary Comparison** and **Executive Dashboard**. Pick by request.

Executive Dashboard flow (the richer of the two):
1. **Batch 1 question:** company name · report title · brand colors (one `ask_user_input`).
2. **Batch 2 question:** year · last closed period (free text like "April 2026", normalize
   the month to 3-letter abbrev) (one `ask_user_input`).
3. **Phase 1 (one `Excel.run`):** filter block with B8 `="Apr-"&$B$2` and B9
   `=LEFT($B$8,3)&"-"&($B$2-1)` BOTH in General format (never text/`@`); the 7 highlight
   cards (merged cells, fills, labels); the detail table labels/headers; the hidden chart
   helper range (cols R–T); number formats; gridlines off.
4. **Phase 2:** seed the first card value (Revenue current month), re-enter once.
5. **Phase 3:** ▶ Continue filter prompt for B3–B6.
6. **Phase 4 (one `Excel.run`):** **(4a)** write all Detail table XAVI formulas first —
   these are the single source of truth; **(4b)** write card value cells as references to
   the Detail table (e.g. `=$C$24`); **(4c)** write the 12-month helper series, format
   pass, then build the dual-axis chart.

Dashboard rules: all period args are text strings (sheet mixes IS + BS types); B8/B9 stay
General format; cards use light fill `#F0F4FF`. Detail below confirms it.

---

## Template 5 — Subsidiary Comparison

Side-by-side columns, one per subsidiary. No monthly breakdown — typically single period or YTD.

### Column structure:
```
B: Label
C: [Sub 1 name]  — header in C6
D: [Sub 2 name]  — header in D6
E: [Sub 3 name]  — header in E6 (if applicable)
F: Total         — header in F6 (sum of C:E or use Consolidated subsidiary)
```

Each cell is a `XAVI.TYPEBALANCE` formula with the subsidiary hardcoded (or in a header row
cell reference). Period args must come from helper cells — never `DATE(...)` inline:

> ⚠️ Add FY period helper cells to the filter block before building:
> ```
> B10: =DATE($B$2,1,1)   ← FY Start (label A10: "FY Start")
> B11: =DATE($B$2,12,1)  ← FY End   (label A11: "FY End")
> ```
> Then reference `$B$10` and `$B$11` in all XAVI period arguments.

```
C8: =XAVI.TYPEBALANCE("Income",$B$10,$B$11,C$9,"","","")
D8: =XAVI.TYPEBALANCE("Income",$B$10,$B$11,D$9,"","","")
```
Where C9 and D9 contain the subsidiary names as text.

This way dragging the formula across columns automatically picks up each subsidiary name from
the header row.


---

## Template 8 — Executive Dashboard (Weekly Management Report)

A hybrid layout: highlight cards at the top for instant visibility, a detail table below
for precision, and a dual-axis trend chart at the bottom. Designed for weekly management
reporting using last closed NetSuite periods.

### Setup questions — ask upfront using `ask_user_input`

**Question 1 — Last closed period:**
> "What is your last fully closed accounting period? (e.g. April 2026)"

Accept a free-text month + year together. **Normalize the month** to its 3-letter
abbreviation — accept full names ("April"), abbreviations ("Apr"), or numbers ("4"),
case-insensitive, and convert to `Apr`. Parse the year (e.g. 2026) into `$B$2`.

Then build the period cells as **formulas**, not hardcoded strings, so they stay in
sync when the user changes the year in `$B$2`:
- `$B$8` (Last Closed): `="Apr-"&$B$2` → resolves to `Apr-2026`
- `$B$9` (PY Same Period): `=LEFT($B$8,3)&"-"&($B$2-1)` → resolves to `Apr-2025`

**Leave both B8 and B9 as General format — do NOT set text format (`@`).** Because they
are now formulas, a text format makes Excel display the formula literally instead of
evaluating it. General format lets the concatenation resolve to the period string.

Remind the user:
> "Tip: use the XAVI task pane → Bulk Add GL and Periods to see your exact period names."

**Question 2 — Subsidiary (optional):**
Use the standard Phase 3 filter prompt. The dashboard pulls entity-level KPIs so subsidiary
is especially important here.

### Filter block layout

```
A2:  Year              B2:  [year]           ← drives FY start calculations
A3:  Subsidiary        B3:  [value or blank]
A4:  Department        B4:  [value or blank]
A5:  Location          B5:  [value or blank]
A6:  Class             B6:  [value or blank]
A7:  FY Start Month    B7:  [1-12]           ← drives YTD from-period
A8:  Last Closed       B8:  ="Apr-"&$B$2        ← formula, General format, drives current month
A9:  PY Same Period    B9:  =LEFT($B$8,3)&"-"&($B$2-1)  ← formula, General format
A10: YTD From          B10: =TEXT(DATE($B$2,$B$7,1),"mmm-yyyy")  ← helper cell; drives all YTD fromPeriod args
```

> ⚠️ **B10 (YTD From) is a required helper cell.** All YTD XAVI calls use `$B$10` as the
> fromPeriod argument. Never write `TEXT(DATE($B$2,$B$7,1),"mmm-yyyy")` inline inside a
> XAVI arg — Refresh All cannot parse it. B10 must be written in Phase 1 before any XAVI
> formula strings are generated. Format B10 as General (not text/`@`), shade `#EBF3FF`.
```
B8: ="Apr-"&$B$2              → Apr-2026  (month abbrev from user, year from B2)
B9: =LEFT($B$8,3)&"-"&($B$2-1) → Apr-2025  (same month, prior year)
```
Both are formulas in **General format** (never text/`@`, or Excel shows the formula
literally instead of the resolved period string). B8's month abbreviation comes from
normalizing the user's answer; the year always references `$B$2` so changing B2 updates
both period cells automatically.

Do NOT use a `DATEVALUE` or `DATE(...)` approach for B9 — `DATEVALUE($B$8&" 1")` does not
parse reliably across locales. The `LEFT($B$8,3)&"-"&($B$2-1)` string concatenation is
simpler and locale-independent.

**FY start period (YTD from-date) — stored in helper cell `$B$10`, not computed inline:**
```
B10: =TEXT(DATE($B$2, $B$7, 1), "mmm-yyyy")   ← written in Phase 1; all YTD formulas reference $B$10
```
Never write `TEXT(DATE($B$2,$B$7,1),"mmm-yyyy")` inside a XAVI argument directly.

### Layout — Highlight Card Grid (rows 9–20)

Cards are visual blocks, not a standard table. Build using cell merges, fills, and large
font sizes. Each card occupies a merged cell block approximately 3 columns × 5 rows.

**Card grid (4 cards top row, 3 cards bottom row):**
```
Row 9:   Section header: "KEY METRICS" — bold, brand.titleColor, merged full width
Rows 10-14: Card row 1 — Revenue | Gross Profit | Gross Margin % | Operating Income
Rows 15-19: Card row 2 — Net Income | Cash & Bank | Accounts Receivable
```

**Each card structure (using Revenue as example, cols C-E, rows 10-14):**
```
Row 10: [Metric name] — "Revenue" — small, bold, brand.headerColor, left-aligned
Row 11: [Current month value] — large (16pt bold), no currency symbol, #,##0 format
Row 12: [Period label] — "May-2025" — small italic gray #595959, references $B$8
Row 13: [YTD value] — "YTD: [value]" — medium 11pt
Row 14: [PY comparison] — "PY: [value]  ▲/▼ [var%]" — small, variance colored by sign:
         positive variance (current > PY) → brand.titleColor (#004FB6)
         negative variance → #C0392B (muted red — only place color is used)
```

**Card background fill:** very light tint `#F0F4FF` (light blue-gray). No borders on card
interior — a subtle fill is enough to delineate. 4px gap rows between cards (row height 4pt).

**Card column widths:** each card block = ~3 columns at ~70px each.

### Card formula table

> **Cards reference the Detail table — no separate staging area.**
> The Detail table (rows 24–35) is the single source of truth for all XAVI calls.
> Each card's value cells are simple references to the corresponding Detail table cells.
> Build order: write Detail table formulas first (Phase 4a), then cards (Phase 4b).
>
> This does not reduce the number of live NetSuite calls — there was never duplication,
> each value was always fetched once. It removes an unnecessary indirection layer so the
> entire dashboard is auditable from one place.

| Card | Metric name | Current month cell | YTD cell | PY same period cell |
|------|------------|-------------------|----------|---------------------|
| Revenue | "Revenue" | `=$C$24` | `="YTD: "&TEXT($D$24,"#,##0")` | `=$E$24` |
| Gross Profit | "Gross Profit" | `=$C$26` | `="YTD: "&TEXT($D$26,"#,##0")` | `=$E$26` |
| Gross Margin % | "Gross Margin %" | `=$C$27` | `="YTD: "&TEXT($D$27,"0%")` | `=$E$27` |
| Operating Income | "Operating Income" | `=$C$29` | `="YTD: "&TEXT($D$29,"#,##0")` | `=$E$29` |
| Net Income | "Net Income" | `=$C$31` | `="YTD: "&TEXT($D$31,"#,##0")` | `=$E$31` |
| Cash & Bank | "Cash & Bank" | `=$C$33` | n/a — show label `="As of "&$B$8` | `=$E$33` |
| Accounts Receivable | "Accounts Receivable" | `=$C$34` | n/a — show label `="As of "&$B$8` | `=$E$34` |

**Variance formula (current vs PY, used in card row 14):**
```
=IF([PY cell]=0,"N/A",([Current cell]-[PY cell])/ABS([PY cell]))
```
e.g. for Revenue: `=IF($E$24=0,"N/A",($C$24-$E$24)/ABS($E$24))`

Format: `0%;(0%)` — positive shows in `brand.titleColor`, negative in `#C0392B`.
Use conditional formatting on the variance cell: `>0` → font color `#004FB6`, `<0` → `#C0392B`.

### Layout — Detail Table (rows 22–35)

The Detail table is the **single source of truth** for all XAVI metric calls. Cards reference
these cells — there is no separate staging helper block. Build this table first (Phase 4a),
then wire the cards (Phase 4b).

A clean tabular view of all metrics with four columns. Sits below the card grid with a
section header separator.

```
Row 21: [blank spacer]
Row 22: Section header "DETAIL" — bold, brand.titleColor, merged
Row 23: Column headers: Metric | Current Month | YTD | PY Same Period | YoY Var %
Row 24: Revenue
Row 25: Cost of Goods Sold
Row 26: Gross Profit          ← =C24-C25 (Excel math — no XAVI call)
Row 27: Gross Margin %        ← =C26/C24 (Excel math — no XAVI call)
Row 28: Operating Expenses
Row 29: Operating Income      ← =C26-C28 (Excel math — no XAVI call)
Row 30: Other Income / (Expense)
Row 31: Net Income
Row 32: [spacer]
Row 33: Cash & Bank (as of last closed)
Row 34: Accounts Receivable (as of last closed)
Row 35: Deferred Revenue (as of last closed)
```

**Column layout:**
```
Col B: Metric label
Col C: Current Month  ← =B8 period
Col D: YTD            ← FY start through B8
Col E: PY Same Period ← =B9 period
Col F: YoY Var %      ← (C-E)/ABS(E), format 0%;(0%)
```

**XAVI formulas — live calls live here, not in a staging area:**

| Row | Metric | Col C (Current) | Col D (YTD) | Col E (PY) |
|-----|--------|----------------|-------------|------------|
| 24 | Revenue | `=XAVI.TYPEBALANCE("Income",$B$8,$B$8,$B$3,$B$4,$B$5,$B$6)` | `=XAVI.TYPEBALANCE("Income",$B$10,$B$8,$B$3,$B$4,$B$5,$B$6)` | `=XAVI.TYPEBALANCE("Income",$B$9,$B$9,$B$3,$B$4,$B$5,$B$6)` |
| 25 | Cost of Goods Sold | `=XAVI.TYPEBALANCE("COGS",$B$8,$B$8,$B$3,$B$4,$B$5,$B$6)` | `=XAVI.TYPEBALANCE("COGS",$B$10,$B$8,$B$3,$B$4,$B$5,$B$6)` | `=XAVI.TYPEBALANCE("COGS",$B$9,$B$9,$B$3,$B$4,$B$5,$B$6)` |
| 26 | Gross Profit | `=C24-C25` | `=D24-D25` | `=E24-E25` |
| 27 | Gross Margin % | `=C26/C24` | `=D26/D24` | `=E26/E24` |
| 28 | Operating Expenses | `=XAVI.TYPEBALANCE("Expense",$B$8,$B$8,$B$3,$B$4,$B$5,$B$6)` | `=XAVI.TYPEBALANCE("Expense",$B$10,$B$8,$B$3,$B$4,$B$5,$B$6)` | `=XAVI.TYPEBALANCE("Expense",$B$9,$B$9,$B$3,$B$4,$B$5,$B$6)` |
| 29 | Operating Income | `=C26-C28` | `=D26-D28` | `=E26-E28` |
| 30 | Other Income/(Expense) | `=XAVI.TYPEBALANCE("OthIncome",$B$8,$B$8,$B$3,$B$4,$B$5,$B$6)` | `=XAVI.TYPEBALANCE("OthIncome",$B$10,$B$8,$B$3,$B$4,$B$5,$B$6)` | `=XAVI.TYPEBALANCE("OthIncome",$B$9,$B$9,$B$3,$B$4,$B$5,$B$6)` |
| 31 | Net Income | `=XAVI.NETINCOME($B$8,$B$8,$B$3,$B$4,$B$5,$B$6)` | `=XAVI.NETINCOME($B$10,$B$8,$B$3,$B$4,$B$5,$B$6)` | `=XAVI.NETINCOME($B$9,$B$9,$B$3,$B$4,$B$5,$B$6)` |
| 33 | Cash & Bank | `=XAVI.TYPEBALANCE("Bank",,$B$8,$B$3,$B$4,$B$5,$B$6)` | n/a — omit (BS point-in-time) | `=XAVI.TYPEBALANCE("Bank",,$B$9,$B$3,$B$4,$B$5,$B$6)` |
| 34 | Accounts Receivable | `=XAVI.TYPEBALANCE("AcctRec",,$B$8,$B$3,$B$4,$B$5,$B$6)` | n/a — omit (BS point-in-time) | `=XAVI.TYPEBALANCE("AcctRec",,$B$9,$B$3,$B$4,$B$5,$B$6)` |
| 35 | Deferred Revenue | `=XAVI.TYPEBALANCE("DeferRev",,$B$8,$B$3,$B$4,$B$5,$B$6)` | n/a — omit (BS point-in-time) | `=XAVI.TYPEBALANCE("DeferRev",,$B$9,$B$3,$B$4,$B$5,$B$6)` |

Note: Cash & Bank, Accounts Receivable, and Deferred Revenue are balance sheet accounts —
omit fromPeriod (leave blank as `,,`). YTD column (D) should show an empty cell or the
label "As of [B8]" rather than a formula for these rows.

**Formatting:**
- Row 23 headers: bold, bottom border, `brand.headerColor` text
- Row 27 (Gross Margin %): format `0%;(0%)`
- Row 31 (Net Income): bold, double bottom border
- Rows 33-35 (BS items): italic label, single top border separator above row 33
- Col F (YoY Var %): conditional format — positive `#004FB6`, negative `#C0392B`
- All value cells: `#,##0_);(#,##0);"-"` except % rows

### Revenue + Net Income trend chart (dual axis)

Two series on one chart. Revenue on the primary (left) axis, Net Income on the secondary
(right) axis. This allows them to share a time axis without Net Income being invisible
when revenue is much larger.

**Data for chart — helper block in col D-F, rows 3-15** (visible alongside the filter block):
```
D2: "── Helpers ──"  (bold header, #09235C)
Col D: Month labels  (last 12 periods, derived from B8 working backward)
Col E: Revenue per month (12 XAVI.TYPEBALANCE("Income") calls, one per month)
Col F: Net Income per month (12 XAVI.NETINCOME calls, one per month)
```

Build month sequence working backward from $B$8:
```
Period n months before B8 (works with the dash format "Apr-2026"):
=TEXT(DATE(VALUE(MID($B$8,5,4)), MATCH(LEFT($B$8,3),
  {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"},0)-n, 1),
  "mmm-yyyy")
```
`MID($B$8,5,4)` extracts the 4-digit year (positions 5–8 of "Apr-2026"). `LEFT($B$8,3)`
gives the month abbreviation. This produces real DATE serials only for the hidden chart
helper range — the visible period cells (B8/B9) stay as concatenated strings.
```
```

**Office.js chart spec:**

> ⚠️ **Build order matters.** Follow the steps below in exact sequence. Deviating — especially
> hiding the primary axis before data labels are confirmed to render — silently breaks labels
> and requires a full chart delete-and-rebuild to fix. If labels disappear after editing a
> chart whose primary axis is already hidden, do not debug in place: delete the chart object
> and rebuild from step 1.

```javascript
// ── STEP 1: Create chart with data range including headers ────────────────
const dataRange = sheet.getRange("R8:T20");   // headers in row 8, data rows 9-20
const chart = sheet.charts.add(Excel.ChartType.columnClustered, dataRange);
chart.left   = sheet.getRange("B38").left;
chart.top    = sheet.getRange("B38").top;
chart.width  = 700;
chart.height = 260;
chart.title.text = "Revenue & Net Income Trend (12 Months)";
chart.title.visible = true;
chart.legend.visible = true;
chart.legend.position = Excel.ChartLegendPosition.bottom;
chart.showAllFieldButtons = false;
await context.sync();

// ── STEP 2: Set Net Income series to line + secondary axis ────────────────
const revSeries = chart.series.getItemAt(0);
revSeries.name = "Revenue";

const niSeries = chart.series.getItemAt(1);
niSeries.name = "Net Income";
niSeries.chartType = Excel.ChartType.line;
niSeries.axisGroup = Excel.ChartAxisGroup.secondary;
niSeries.smooth = true;
niSeries.format.line.color = "#09235C";
niSeries.format.line.lineStyle = Excel.ChartLineStyle.dash;
niSeries.markerStyle = Excel.ChartMarkerStyle.circle;
niSeries.markerForegroundColor = "#09235C";
niSeries.markerSize = 5;
niSeries.hasDataLabels = false;
await context.sync();

// ── STEP 3: Style bar series + enable data labels ─────────────────────────
revSeries.format.fill.setSolidColor("#004FB6");
revSeries.gapWidth = 30;           // narrower bars (Excel default is 150)
revSeries.hasDataLabels = true;
const revLabels = revSeries.dataLabels;
revLabels.position = Excel.ChartDataLabelPosition.outsideEnd;
revLabels.numberFormat = '#,##0,"K"';
await context.sync();

// ── CHECKPOINT ────────────────────────────────────────────────────────────
// At this point the chart should show bars with data labels above each bar
// and a dashed line for Net Income.  Visually confirm labels are rendering
// before proceeding.  If they are missing, stop here and do NOT continue to
// Step 5 — delete the chart and rebuild from Step 1.

// ── STEP 4: X-axis categories ─────────────────────────────────────────────
chart.axes.getItem(Excel.ChartAxisType.category)
  .setCategoryNames(sheet.getRange("R9:R20"));
await context.sync();

// ── STEP 5: Hide primary (left) value axis ────────────────────────────────
// Do NOT use axis.visible = false alone — it does not reliably suppress
// gridlines or tick labels on this host.  Apply all six properties.
const primaryAxis = chart.axes.getItem(
  Excel.ChartAxisType.value, Excel.ChartAxisGroup.primary);
primaryAxis.majorGridlines.visible = false;
primaryAxis.minorGridlines.visible = false;
primaryAxis.majorTickMark = Excel.ChartAxisTickMark.none;
primaryAxis.minorTickMark = Excel.ChartAxisTickMark.none;
primaryAxis.tickLabelPosition = Excel.ChartAxisTickLabelPosition.none;
primaryAxis.title.text = "";
await context.sync();

// ── STEP 6: Configure secondary axis with explicit scale ──────────────────
// Always set min/max/majorUnit explicitly — auto-scale can inherit the
// primary axis range and make the Net Income line look flat near zero.
// Read the actual NI data range to compute appropriate bounds.
const niRange = sheet.getRange("T9:T20");
niRange.load("values");
await context.sync();
const niValues = niRange.values.flat().filter(v => typeof v === "number");
const niMin = Math.min(...niValues);
const niMax = Math.max(...niValues);
const padding = (niMax - niMin) * 0.2 || Math.abs(niMax) * 0.2 || 1000;
const secondaryAxis = chart.axes.getItem(
  Excel.ChartAxisType.value, Excel.ChartAxisGroup.secondary);
secondaryAxis.minimum = niMin - padding;
secondaryAxis.maximum = niMax + padding;
secondaryAxis.majorUnit = Math.round((niMax - niMin + 2 * padding) / 5);
secondaryAxis.title.text = "Net Income";
secondaryAxis.title.visible = true;
secondaryAxis.majorGridlines.visible = false;
secondaryAxis.minorGridlines.visible = false;

chart.format.fill.clear();
chart.plotArea.format.fill.clear();
await context.sync();
```

> **If data labels disappear after any later edit to this chart while the primary axis is
> already hidden**, do not attempt to patch the chart — delete the chart object and rebuild
> following Steps 1–6 in order. Rebuilding has proven more reliable than patching a chart
> already in the "axis hidden" state.

### Four-phase build sequence

**Phase 1 — Shell:**
- `sheet.showGridlines = false` — first line
- `context.application.suspendScreenUpdatingUntilNextSync()` — second line
- Filter block A2:B9 (bulk write; B8 and B9 are formulas in General format, NOT text/`@`)
- Title/subtitle, section headers
- Card grid: cell merges, fills, metric name labels, column widths
- Detail table: all row labels, column headers
- Helper range for chart data (cols R–T): month label formulas
- Number formats, borders, conditional formatting rules
- Column width presets: card columns ~70px, detail columns ~100px

**Phase 2 — Seed:**
- Write Revenue current month formula into the first card value cell
- Re-enter immediately (read/write same string, 2 syncs) to clear #VALUE!

**Phase 3 — Filter prompt:**
- Standard B3:B6 filter prompt via XAVI task pane
- Note: B8 (Last Closed Period) was already set in setup — remind user it can be changed

**Phase 4 — Bulk fill:**

*Phase 4a — Detail table (single source of truth):*
- Write all Detail table XAVI formulas (rows 24–35, cols C/D/E) — live calls go here
- Write derived rows (Gross Profit, Gross Margin %, Operating Income) as plain Excel math referencing the raw rows above (e.g. `=C24-C25`)

*Phase 4b — Cards (reference Detail table):*
- Write card value cells as references to Detail table cells (e.g. Revenue card current = `=$C$24`)
- Write YTD label cells as TEXT formulas (e.g. `="YTD: "&TEXT($D$24,"#,##0")`)
- Write variance formulas referencing Detail table current and PY cells

*Phase 4c — Trend chart data and chart:*
- Write helper range revenue and net income series (24 XAVI calls for 12 months × 2 metrics)
- Add format enforcement pass (numberFormat across all value cells)
- Build chart
- Column widths preset in Phase 1 (no autofit round-trip)

### ⚠️ Period string usage throughout

All period arguments in this template use text strings (`$B$8`, `$B$9`, `$B$10`).
Never write `TEXT(DATE(...), "mmm-yyyy")` or `DATE(...)` inline inside a XAVI arg —
use the pre-written helper cells only. XAVI.TYPEBALANCE and XAVI.NETINCOME
need text period strings when mixing IS and BS account types in the same sheet.


---

