# XAVI Report Templates — Index

This file is an index. Template specs are split across focused files so each loads
quickly and completely. **Always read `_conventions.md` first** (shared filter block,
fiscal year formulas, formatting, Notes/Reconciliation block), then read the specific
template file for the report you are building.

## Which file to read

| Report type | File to read |
|-------------|-------------|
| CFO Flash / High-Level P&L | `templates-income-statement.md` |
| Year-over-Year Comparison | `templates-income-statement.md` |
| Detailed Income Statement | `templates-income-statement.md` |
| Balance Sheet | `templates-balance-sheet.md` |
| Trial Balance | `templates-balance-sheet.md` |
| Cash Flow Statement | `templates-cashflow.md` |
| Budget vs. Actual | `templates-budget.md` |
| Subsidiary Comparison | `templates-dashboard.md` |
| Executive Dashboard | `templates-dashboard.md` |

Read only the file(s) needed for the report at hand — never load all of them.

**Always also read** `_conventions.md` (shared layout, fiscal year, Notes block) and,
before any chart or platform-specific code, `office-js-notes.md` (platform safety,
graceful degradation when Excel.run is blocked).

## Choosing the Right Template

| User says... | Template |
|--------------|----------|
| "CFO flash", "quick P&L", "board summary", "high-level" | Template 1 — CFO Flash |
| "compare years", "YoY", "year over year", "2024 vs 2025", "compare [year] to [year]" on a high-level P&L | Template 1B — CFO Flash Year-over-Year Comparison |
| "detailed income statement", "all accounts", "by GL account" | Template 2 — two paths: (1) task-pane Build Income Statement, or (2) GL-account-list approach if the user supplies their chart of accounts |
| "balance sheet", "assets and liabilities" | Template 3 — Balance Sheet |
| "budget vs actual", "variance report", "BvA", "how are we tracking vs budget" | Template 4 — Budget vs. Actual |
| "by subsidiary", "compare subsidiaries", "side by side" | Template 5 — Subsidiary Comparison |
| "department P&L", "by department" | Template 1 or 2, with Department filter populated |
| "cash flow", "statement of cash flows", "operating cash" | Template 6 — Cash Flow Statement |
| "executive dashboard", "KPI dashboard", "management report", "weekly report", "board pack" | Template 8 — Executive Dashboard |
| "trial balance", "TB", "all accounts", "every GL account" | Template 7 — Trial Balance |

---

