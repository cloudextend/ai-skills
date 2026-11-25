# Report formatting

Use the reserved layout in _conventions.md; formatting never relocates inputs or
helpers. Brand title color defaults to #004FB6, headers/body to #09235C. White data
background, shaded editable inputs #EBF3FF. Dashboard cards may use #F0F4FF; budget
input columns may use a light gray fill to distinguish editable values.

- Title bold 14pt; headers bold 11pt; ordinary text 11pt, default workbook font.
- Subtotals bold with a single top border; final totals double bottom border.
- Values `#,##0_);(#,##0);"-"`; percentage values `0%;(0%)`. Percentage rules override
  ordinary-number formatting. No currency symbols or decimals in display formats.
- Dates display mmm-yyyy; typed period/account text is formatted @ before writing;
  formulas that return text stay General.
- Apply formats initially, then after XAVI resolution. Recheck final percentage
  columns and check rows. Do not turn unresolved errors into zeros or blanks.
- Hide gridlines when supported. Preset readable data widths; Excel columnWidth is
  in points, not pixels. Adjust after data lands; avoid an extra confirmation step
  solely for autofit. Wrap long methodology notes rather than creating huge columns.
- Conditional formatting targets the actual check cell and marks nonzero differences.
  Neutral variance colors unless the chosen favorable/unfavorable convention is clear.
- Print landscape, fit one page wide, preserving readable vertical pagination.
  Set the print area to the report and intended notes; do not hide helper rows that
  also contain report content. A user may retain visible inputs for auditability.

Report only styling actually applied. Unsupported chart/formatting features should
be disclosed without discarding successfully built data.
