# Subsidiary comparison and executive dashboard

## Subsidiary comparison

Use annual helpers D3/O3 or an explicitly selected period range. Headers row 30;
subsidiary names in C30 onward. Each column's formula references that header as its
subsidiary argument, with B4:B6 for other segments and B8 for the accounting book:
`=XAVI.TYPEBALANCE("Income",$D$3,$O$3,C$30,$B$4,$B$5,$B$6,$B$8)`.
Use income-statement rows/calculations from templates-income-statement.md.
A sum of subsidiaries is not necessarily consolidated reporting: eliminations and
currency treatment may differ. Label a simple sum explicitly or fetch the actual
consolidated scope separately. Never silently use B3 instead of the column header.

## Executive dashboard

Ask for last fully closed month/year (B12) and FY start month (B9). Normalize the
answer into a date; confirm ambiguous dates. Use E13:E16 and text equivalents
H13:H16 from shared conventions. YTD start is the fiscal start at or before the
last-closed month: January 2026 with April FY starts April 2025. Do not take the
last-closed calendar year as the fiscal start year.

Cards occupy rows 30–41, with four cards on the first row and three below.
Detail header row 45; B labels, C current month, D YTD, E prior same month,
F percent change. Cards reference detail cells; they do not duplicate XAVI queries.

| Row | Metric | Source |
|---|---|---|
| 46 | Revenue | TYPEBALANCE Income |
| 47 | COGS | TYPEBALANCE COGS |
| 48 | Gross profit | row 46 − row 47 |
| 49 | Gross margin | IF(revenue=0,"N/A",grossProfit/revenue) |
| 50 | Operating expenses | TYPEBALANCE Expense |
| 51 | Operating income | row 48 − row 50 |
| 52 | Other income/(expense) | TYPEBALANCE OthIncome − TYPEBALANCE OthExpense |
| 53 | Net income | NETINCOME |
| 55 | Cash | TYPEBALANCE Bank |
| 56 | Receivables | TYPEBALANCE AcctRec |
| 57 | Deferred revenue | TYPEBALANCE DeferRevenue |

For P&L current use H13/H13; YTD H14/H13; prior same month H16/H16. Every call
passes B3:B6 and B8. For point-in-time rows 55–57 omit fromPeriod and leave YTD
blank. Percent change uses IF(prior=0,"N/A",(current-prior)/ABS(prior)). Compare net
income to operating income plus net other income; surface a difference.
Seed C46, then fill detail and link cards: Revenue C46/D46/E46; Gross profit row48;
Gross margin49; Operating income51; Net income53; Cash55; Receivables56.

Put the 12-month trend staging block at B65:D77 (headers row65). B66:B77 are months
from EDATE(E13,-11) through E13, oldest first; C/D Revenue/Net Income reference those
period helper cells. If text periods are needed, compute text in B directly using
TEXT(EDATE(...),"mmm-yyyy") and leave General format. Never embed it in XAVI.
Build chart from exactly B65:D77 and put it below row80; notes start below the chart.
No chart staging data belongs in the cards or input/helper ranges.

Use Revenue columns and Net Income line on a secondary axis only if supported and
clearly labeled. Read resolved numeric data before calculating scales; use automatic
scales if data is empty or incomplete. Do not derive infinity/NaN bounds or a zero
major unit. If the host rejects styling, retain the usable chart and disclose the
omitted feature; rebuilding is appropriate only when needed, not a mandatory ritual.
