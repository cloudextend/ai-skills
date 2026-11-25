# Shared report conventions

## Range ownership

All templates use the same input addresses. Keep helpers on the report worksheet
so XAVI reads ordinary cell references. Use a separate new worksheet for each report.

| Area | Purpose |
|---|---|
| Row 1 | Title; may merge B1:O1 |
| A2:B12 | Labeled inputs; never merge or put a subtitle over these cells |
| D2:O6 | Monthly period helpers |
| D8:G11 | Quarterly period helpers |
| D13:E16 | As-of and fiscal-period helpers |
| Row 28 | Subtitle / period / scope |
| Row 30 | Report column headers |
| Row 31 onward | Report labels, formulas and totals |

Inputs: B2 = fiscal start year for annual reports; B3 = subsidiary; B4 = department;
B5 = location; B6 = class; B7 = budget category; B8 = accounting book (optional);
B9 = FY start month (1–12); B10 = retained earnings account; B11 = prior fiscal
start year for comparisons; B12 = as-of/last-closed month as a date serial.
Only expose applicable inputs. Explain B2's meaning: April FY 2025 means April 2025
through March 2026. For as-of reports, B12 and B9 determine YTD dates; B2 is not a
second independent as-of control. Trial Balance uses B2/B11 as text From/To period
inputs instead; label that exception explicitly in its README.

Helpers have visible labels and date formats, not editable-input shading. Never
extend a helper block into report cells. Put chart staging data on a separate
clearly labeled sheet or below the report and notes, outside every occupied range.
Do not reuse helper cells for a chart, header, or metric card.

## Annual periods

In D2:O2 write labels Month 1–12. Generate D3:O3 current-year month dates and D4:O4
prior-year dates. D5:O5 and D6:O6 are their text equivalents for hosts/calls needing
NetSuite period strings. DATE normalizes months beyond December into the next year.

```javascript
const months = Array.from({length: 12}, (_, i) => `=DATE($B$2,$B$9+${i},1)`);
const priorMonths = Array.from({length: 12}, (_, i) => `=DATE($B$11,$B$9+${i},1)`);
sheet.getRange("D3:O3").formulas = [months];
if (includePriorYear) sheet.getRange("D4:O4").formulas = [priorMonths];
const helperCols = Array.from({length: 12}, (_, i) => String.fromCharCode(68+i));
sheet.getRange("D5:O5").formulas = [helperCols.map(c => `=TEXT(${c}3,"mmm-yyyy")`)];
if (includePriorYear) sheet.getRange("D6:O6").formulas = [helperCols.map(c => `=TEXT(${c}4,"mmm-yyyy")`)];
```

Set `includePriorYear` to true only for a comparison with a valid B11 year.
Otherwise set it to false; do not write prior-year helpers. Text-producing
formulas remain General format, never `@`. Match period names to the user's actual
NetSuite period list; calendar-month templates do not establish support for 4-4-5
or other non-monthly calendars. Ask for the actual periods in those cases.

Quarter helpers: D8:G8 = current starts, D9:G9 = current ends; D10:G10 = prior
starts, D11:G11 = prior ends. These are first-of-month dates selecting inclusive
accounting periods, so quarter end is month offset 2, not offset 3.

```javascript
const quarterStarts = Array.from({length: 4}, (_, q) => `=DATE($B$2,$B$9+${q*3},1)`);
const quarterEnds = Array.from({length: 4}, (_, q) => `=DATE($B$2,$B$9+${q*3+2},1)`);
sheet.getRange("D8:G8").formulas = [quarterStarts];
sheet.getRange("D9:G9").formulas = [quarterEnds];
if (includePriorYear) {
  sheet.getRange("D10:G10").formulas = [quarterStarts.map(f => f.replaceAll('$B$2', '$B$11'))];
  sheet.getRange("D11:G11").formulas = [quarterEnds.map(f => f.replaceAll('$B$2', '$B$11'))];
}
```

For quarterly reports, show the computed four ranges in the confirmation question
itself and wait for confirmation before filling.

## As-of periods

Write labeled helpers D13:E16. B12 is the selected as-of month; B9 is FY start month.

| Cell | Label in D | Formula in E |
|---|---|---|
| E13 | As of | `=DATE(YEAR($B$12),MONTH($B$12),1)` |
| E14 | FY start | `=DATE(YEAR($B$12)-IF(MONTH($B$12)<$B$9,1,0),$B$9,1)` |
| E15 | Prior FY end | `=EDATE($E$14,-1)` |
| E16 | Prior same month | `=EDATE($E$13,-12)` |

For dashboard text-period calls, use H13:H16 as `=TEXT(E13,"mmm-yyyy")` etc.,
with labels in G13:G16. Never put TEXT/DATE expressions directly in XAVI arguments.

## Formats and notes

Values: `#,##0_);(#,##0);"-"`; percentages: `0%;(0%)`. No currency symbols or decimals.
Hide gridlines, shade editable inputs `#EBF3FF`, keep ordinary data cells white.
Subtotals bold with a top border; final totals bold with a double bottom border.
Percentage totals are ratios of aggregated amounts, never sums of percentages.
Allow manual width adjustment after data resolves. See formatting.md for details.

Notes describe methodology, scope and limitations without hardcoded amounts. Use
cell references for any figures. Describe reconciliation honestly: a balancing plug
is not an independent check. See each report's validation requirements.
