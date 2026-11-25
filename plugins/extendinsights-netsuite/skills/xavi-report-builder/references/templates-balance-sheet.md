# Balance Sheet and Trial Balance

Use shared rules and reserved ranges. Inspect the COA for account types and the
retained earnings account; do not assume column positions in Bulk Add output.

## Balance Sheet

Ask for as-of month (B12), FY start month (B9), and RE account (B10). Use E13:E16
helpers. At December 2025 with July FY start, E14 must be July 2025, not July 2024.
A user can change B12 to another as-of month; subtitle references E13.

B holds labels, C values. Header C30 references E13. Rows:

| Row | Label | Type or arithmetic |
|---|---|---|
| 31 | Cash | Bank |
| 32 | Receivables | AcctRec |
| 33 | Other current assets | OthCurrAsset |
| 34 | Deferred expenses | DeferExpense |
| 35 | Total current assets | SUM(C31:C34) |
| 37 | Fixed assets | FixedAsset |
| 38 | Other assets | OthAsset |
| 39 | Total non-current assets | SUM(C37:C38) |
| 41 | Total assets | C35+C39 |
| 43 | Payables | AcctPay |
| 44 | Credit cards | CredCard |
| 45 | Other current liabilities | OthCurrLiab |
| 46 | Deferred revenue | DeferRevenue |
| 47 | Total current liabilities | SUM(C43:C46) |
| 49 | Long-term liabilities | LongTermLiab |
| 51 | Total liabilities | C47+C49 |
| 53 | Equity excluding GL RE | See below |
| 54 | Calculated retained earnings | See below |
| 55 | YTD net income | See below |
| 56 | CTA, where applicable | See below |
| 57 | Total equity | SUM(C53:C56) |
| 59 | Liabilities and equity | C51+C57 |
| 61 | Balance check | C41-C59 |

Type rows use `=XAVI.TYPEBALANCE("Bank",,$E$13,$B$3,$B$4,$B$5,$B$6,$B$8)` with
the relevant type. Seed C31. Check COA for types absent from this list and extend
before declaring totals complete. No fromPeriod on balance-sheet type calls.

```excel
C53: =XAVI.TYPEBALANCE("Equity",,$E$13,$B$3,$B$4,$B$5,$B$6,$B$8)-XAVI.BALANCE($B$10,,$E$13,$B$3,$B$4,$B$5,$B$6,$B$8)
C54: =XAVI.RETAINEDEARNINGS($E$13,$B$3,$B$4,$B$5,$B$6,$B$8)
C55: =XAVI.NETINCOME($E$14,$E$13,$B$3,$B$4,$B$5,$B$6,$B$8)
C56: =XAVI.CTA($E$13,$B$3,$B$4,$B$5,$B$6,$B$8)
```

Omit CTA for single-currency scope; verify multi-currency inclusion and calculated
RE treatment against NetSuite. Do not remove an unexplained difference with a plug.
If the RE account or a required formula is unavailable, leave that component marked
incomplete and do not claim the statement balances. Changing B10 must update C53.
Apply the red nonzero conditional format to C61, the actual check cell.

## Trial Balance

Ask for exact From/To accounting periods and whether zero rows should be hidden or
removed. This template's exceptions: B2 = From period, B11 = To/as-of period, both
text values in the actual NetSuite naming format. Set `@` before writing; inspect
valueTypes as well as numberFormat on both cells. Do not infer text type solely
from a format setting. Do not write annual date helpers for this report.

Load the actual COA; include leaf accounts without double counting summary parents.
Row 30 headers: A account, B name, C type, D normal debit/credit side, E balance.
Rows 31+ contain all included accounts. A is text before account values are written.

Income, OthIncome, COGS, Expense, OthExpense:
`=XAVI.BALANCE($A31,$B$2,$B$11,$B$3,$B$4,$B$5,$B$6,$B$8)`.
Balance-sheet types:
`=XAVI.BALANCE($A31,,$B$11,$B$3,$B$4,$B$5,$B$6,$B$8)`.
Lookups reference A, e.g. `=XAVI.NAME($A31)`.

Seed E31 using its actual type, verify resolution, then fill all remaining account
rows. Count numeric results only for expected account rows; inspect errors separately.
COUNTA or a stable count cannot establish completion.

Keep the account listing separate from a financial-statement reconciliation. If
adding a balance-sheet summary, use the RE exclusion/dynamic equity treatment above
with periods adapted to this template. Do not include calculated YTD income again
in a debit/credit total that already includes P&L accounts. Verify XAVI's sign
presentation before computing debit-minus-credit; the normal-side flag alone does
not prove the returned sign convention. For a mid-year From period, distinguish a
period-activity listing from a full-year trial balance and explain reconciliation limits.

Only prune after every account cell resolves and the user opted in. Hide zero rows
by default so changes to filters/periods can reveal activity; explain hidden rows may
need unhiding. Permanent deletion requires explicit selection, deletes in reverse
order and requires rebuilding/rechecking subtotal references. Numeric zero only;
never remove error/pending cells. Retain a way to regenerate from the full COA.
