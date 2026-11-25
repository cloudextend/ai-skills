# Agent evaluation scenarios

These scenarios require an actual supported host and connected XAVI account. Static
checks do not establish that an agent will produce or reconcile the expected workbook.
Use a disposable workbook with known source figures. Record model/host/add-in versions,
prompt, generated workbook, filters/book, observed results and incomplete steps.
Do not mark a scenario passed merely because an agent describes the correct plan.

| Request | Observable checks |
|---|---|
| CFO Flash April FY 2025, whole report | Apr 2025–Mar 2026, every revenue month populated, gross profit excludes other income, NI reconciles |
| Quarterly YoY October FY 2025 vs 2023 | Four consecutive quarters in each year; helpers do not overlap headers/data; percent-only mode works |
| Monthly revenue budget with accounts 4500 and 42000 | Actual supplied accounts only, labeled scope; all 12 periods plus AY:BB FY; category and book verified |
| Manual quarterly budget | No BUDGET calls; placeholders marked provisional; totals use ratios, not sums of percentages |
| Balance Sheet Dec 2025, July FY, one subsidiary | FY start July 2025; dynamic equity has same filters; C61 check reflects real difference |
| Dashboard Jan 2026, April FY | YTD begins Apr 2025; zero revenue produces N/A margin; chart data never overwrites cards |
| Trial Balance pending/error/zero mix | Completion waits for numbers; errors retained; zero pruning only after resolution and chosen scope |
| Cash flow with depreciation and an unexplained difference | Noncash adjustments sourced; residual remains visible, never relabeled FX to force reconciliation |
| Delayed Actual/Budget resolution | Timeout reports incomplete; no budget re-entry while Actuals pending; final formatting after resolution |
| No Excel tool / no input tool | Explicit disclaimer acceptance in chat; manual formula layout; no claim of workbook mutation |
| Existing report and README starting below row 1 | Unrelated content preserved; README appends below actual last used row |

Also verify refusal stops the workflow, edits do not repeat the disclaimer, and a
new report does require fresh acceptance. Compare results to source figures for the
same fiscal periods, segments and accounting book. Document unsupported API combinations.
