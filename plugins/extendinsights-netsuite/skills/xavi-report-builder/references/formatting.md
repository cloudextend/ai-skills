# Board-Ready Formatting Standards for XAVI Reports

These formatting rules produce presentation-quality financial statements — the kind a controller
would hand to a board or CFO without further cleanup.

---

## Step Zero — Remove Gridlines

**Always remove gridlines automatically in Phase 1 via Office.js:**
```javascript
sheet.showGridlines = false;  // mandatory — every report, no exceptions
```
Never ask the user to do this manually. Never omit it. If gridlines reappear
(e.g. after a sheet refresh), re-run `sheet.showGridlines = false` and `context.sync()`.

This is the single biggest improvement from a stock spreadsheet to a polished report.

---

## Sheet Structure

```
Row 1:  Report title (merged A1:N1 or full width)
Row 2:  Subtitle / company name / "As of" or period description
Row 3:  [blank spacer]
Row 4:  Filter labels:  Subsidiary | Department | Location | Class   (cols P–S)
Row 5:  Filter values:  [user values]                                 (cells P5–S5)
Row 6:  Column headers: blank | blank | Jan-2025 | Feb-2025 | ...    (months in C–N)
Row 7:  [blank spacer before data]
Row 8+: Data rows
```

For Balance Sheet (single date column), columns are simpler:
```
Row 6: blank | Label | [Date]
```

---

## Typography

| Element | Formatting |
|---------|-----------|
| Report title | Bold, 14pt, `brand.titleColor` (fallback `#004FB6`), merged across report width |
| Subtitle / period | Normal weight, 11pt, `brand.headerColor` (fallback `#09235C`) |
| Filter labels (row 4) | Bold, 10pt, bottom border only |
| Filter / input value cells (B2:B6, B7:B8 for TB) | Light blue fill `#EBF3FF`, no border — signals "editable" to the user |
| Column headers (month names) | Bold, centered, bottom border, 11pt |
| Section headers (Revenue, COGS, etc.) | Bold, 11pt, `brand.headerColor` (fallback `#09235C`), no fill |
| Account / line item rows | Normal weight, 11pt, indented (use two leading spaces in label) |
| Subtotal rows (Gross Profit, Operating Income) | Bold, single top border (`───`) |
| Final total (Net Income, Total Assets, etc.) | Bold, **double bottom border** (`═══`) |
| Year-to-date or Total column header | Bold, right-aligned |

Font: **Calibri 11pt** (Excel default). Do not change font family.
Color: Never use colored text on data rows. Brand colors apply to titles, subtitles, and
section headers only. If the user supplied brand colors in Step 2, use them. If not, fall
back to CloudExtend defaults: title `#004FB6` (Blue Light), headers `#09235C` (Deep Dive).

---

## Borders — The Accounting Convention

Financial statements use borders (not fills) to signal hierarchy:

| Border type | When to use | How to apply |
|-------------|-------------|--------------|
| **Bottom border, thin** | Column header row; filter label row | Format Cells → Border → Bottom |
| **Top border, thin** | Subtotal rows (Gross Profit, Operating Income, Total Assets, etc.) | Format Cells → Border → Top |
| **Double bottom border** | Final totals (Net Income, Total Equity + Liabilities) | Format Cells → Border → Bottom, choose double line style |
| No border | All other rows | Default |

**Never use top+bottom on the same row.** Use only top for subtotals.

---

## Number Formatting

Apply to all XAVI formula cells and calculated total cells:

- **Format:** Plain number — no currency symbols (`$`, `£`, `€`, etc.) anywhere in any report.
  Never use the Accounting or Currency format categories — both add a currency symbol.
  Use a custom number format string instead (see below).
- **Decimal places: always 0. No exceptions. Universal rule.**
  Every numeric data cell in every report — balances, totals, variances, chart labels —
  must display zero decimal places. Never use 1 or 2 decimal places anywhere.
- **Percentage cells: always `0%;(0%)`. No exceptions. Universal rule.**
  Any cell that represents a percentage — variance %, change %, margin %, or any
  other ratio shown as a percentage — must use the format `0%;(0%)`.
  Zero decimal places. Parentheses for negative. No `%` symbol in labels alongside
  the number — the format handles it. Never use `0.0%`, `0.00%`, or any decimal
  variant. In Office.js: `range.numberFormat = [["0%;(0%)"]];`
- **No currency symbols. Universal rule.**
  Never show `$`, `£`, `€`, or any currency prefix on any cell. This applies to
  number formats, TEXT() formulas, and chart data label formats.
- **Negative numbers:** Parentheses `(1,234)` — not a minus sign
- **Zero:** Show as a dash `–`

The one correct format string for every numeric data cell — no exceptions:
```
#,##0_);(#,##0);"-"
```
In Office.js: `range.numberFormat = [["#,##0_);(#,##0);\"-\""]]`
In TEXT() formulas: `TEXT(value,"#,##0")` — never `TEXT(value,"$#,##0")`
Never use `Excel.NumberFormatCategory.accounting` or `.currency`.

For the label column (A or B), set column width to ~30–35 characters to avoid truncation.
For number columns (monthly), set width to ~12–14 characters.

---

## Row Heights and Spacing

- Data rows: 15pt height (Excel default)
- Section header rows: 18pt height (slightly taller to visually separate sections)
- Blank spacer rows between sections: 6pt height (nearly invisible line break)
- Final total row: 18pt height

---

## Indentation Convention (labels column)

Use two leading spaces in the cell text to simulate indent — do not use Excel's indent button,
as it doesn't print cleanly.

```
Revenue                     ← section header, no indent, bold
  Product Revenue           ← line item, 2-space indent
  Service Revenue           ← line item, 2-space indent
Total Revenue               ← subtotal, no indent, bold, top border
```

---

## Section Spacing Pattern

Between major sections, insert one blank row with height ~6pt. This is the clean way to create
white space without using borders.

**Income Statement section order:**
1. Revenue → Total Revenue (top border, bold)
2. [spacer]
3. Cost of Goods Sold → Gross Profit (top border, bold)
4. [spacer]
5. Operating Expenses → Total Operating Expenses (top border, bold)
6. [spacer]
7. Operating Income (top border, bold)
8. [spacer]
9. Other Income / Other Expense
10. [spacer]
11. **Net Income** (double bottom border, bold)

**Balance Sheet section order:**
1. Current Assets → Total Current Assets
2. Non-Current Assets → Total Non-Current Assets
3. **Total Assets** (double bottom border, bold)
4. [spacer]
5. Current Liabilities → Total Current Liabilities
6. Non-Current Liabilities → Total Non-Current Liabilities
7. Equity section → Total Equity
8. **Total Liabilities and Equity** (double bottom border, bold)

---

## Columns to Hide

After setup, hide the filter columns if they clutter the printable area:
- Hide columns P–S (filter values) if they are to the right of the report data
- Alternatively, place filters on a separate "Parameters" sheet and reference them with
  `=Parameters!$P$5` etc.

---

## Print Setup

- Orientation: **Landscape**
- Fit to: **1 page wide** (let height expand naturally)
- Header: Company name left, Report title center, Date right
- Footer: "Confidential" left, page number right
- Margins: Narrow (0.5" all sides)
- Scale: 85–90% if needed to fit monthly columns

---

## Quick Formatting Checklist (deliver this to users)

```
☐ Remove gridlines (View → Gridlines)
☐ Filter/input cells: fill `#EBF3FF` (light blue)
☐ Report title: bold, 14pt, brand.titleColor (fallback #004FB6), merged
☐ Column headers: bold, bottom border
☐ Section headers: bold, no fill
☐ Line items: 2-space indent in label
☐ Subtotals: bold, top border
☐ Final total: bold, double bottom border
☐ Number format (values): `#,##0_);(#,##0);"-"` — no currency symbol, no decimals, universal
☐ Number format (percentages): `0%;(0%)` — no decimals, parentheses for negative, universal
☐ Label column width: 30–35 chars
☐ Number column widths: 12–14 chars
☐ Blank spacer rows between sections (height 6pt)
☐ Print setup: Landscape, fit 1 page wide
```
