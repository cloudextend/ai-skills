# XAVI formula reference

All formulas pull from the user's connected NetSuite account. This is a bundled
reference, not a runtime API schema. If the installed add-in disagrees, inspect its
available function help or an existing working formula and verify a representative
cell before proceeding. Report a mismatch; do not invent a signature.

## Signatures

```text
XAVI.TYPEBALANCE(type, from, to, subsidiary, department, location, class, [accountingBook])
XAVI.BALANCE(account, from, to, subsidiary, department, location, class, [accountingBook])
XAVI.BALANCECURRENCY(account, from, to, subsidiary, currency, department, location, class, [accountingBook])
XAVI.BUDGET(account, from, to, subsidiary, department, location, class, [accountingBook], [budgetCategory])
XAVI.NETINCOME(from, to, subsidiary, department, location, class, [accountingBook])
XAVI.RETAINEDEARNINGS(asOf, subsidiary, department, location, class, [accountingBook])
XAVI.CTA(asOf, subsidiary, department, location, class, [accountingBook])
XAVI.NAME(account)
XAVI.TYPE(account)
XAVI.PARENT(account)
```

If the host does not support an optional book on a special function, omit that slot
only when no book was selected. A selected book must scope the entire statement;
otherwise disclose the unsupported combination and leave verification incomplete.

Examples use the shared input/helper layout:

```excel
=XAVI.TYPEBALANCE("Income",$D$3,$D$3,$B$3,$B$4,$B$5,$B$6,$B$8)
=XAVI.TYPEBALANCE("Bank",,$E$13,$B$3,$B$4,$B$5,$B$6,$B$8)
=XAVI.BALANCE($A31,$D$3,$D$3,$B$3,$B$4,$B$5,$B$6,$B$8)
=XAVI.BUDGET($A31,$D$3,$D$3,$B$3,$B$4,$B$5,$B$6,$B$8,$B$7)
=XAVI.NETINCOME($E$14,$E$13,$B$3,$B$4,$B$5,$B$6,$B$8)
=XAVI.RETAINEDEARNINGS($E$13,$B$3,$B$4,$B$5,$B$6,$B$8)
=XAVI.CTA($E$13,$B$3,$B$4,$B$5,$B$6,$B$8)
=XAVI.NAME($A31)
```

## Account types

Assets: Bank, AcctRec, OthCurrAsset, FixedAsset, OthAsset, DeferExpense.
Liabilities: AcctPay, CredCard, OthCurrLiab, DeferRevenue, LongTermLiab.
Equity: Equity.
P&L: Income, OthIncome, COGS, Expense, OthExpense.

Use DeferRevenue consistently; do not shorten it to DeferRev. Check the COA for
additional account types before treating a summary as exhaustive. A user-defined
account number or prefix does not establish an account's type.

RETAINEDEARNINGS provides calculated prior-period retained earnings; reconcile its
fiscal boundary and opening balance treatment with NetSuite. The GL RE account is
part of Equity. Do not add both its balance and calculated RE without reconciling
the overlap. CTA is a separate dynamic equity component where applicable; verify
its inclusion against the source statement rather than adding it twice.

## Periods and troubleshooting

Monthly headers/helpers use DATE serials. Trial Balance uses text NetSuite period
names (normally MMM-YYYY) for From/To; format typed text inputs as `@` before writing.
Text-producing formulas stay General. A displayed date does not prove the value is
text. If a particular call returns zero or stalls with serials, inspect known-good
formulas and the period list; do not claim that all calls on a mixed sheet require
text. BUDGET specifically requires single-month serials in the documented workaround.

Use XAVI Bulk Add Periods to inspect actual names/IDs. For non-monthly calendars,
request exact period boundaries rather than fabricating Gregorian months.

| Result | Response |
|---|---|
| INVALIDACCT / NOTFOUND | Check the account input and its type against COA |
| INV_SUB_CUR | Verify subsidiary/currency pairing; do not treat returned zero as verified |
| TIMEOUT | Report incomplete fetch; bounded retry after checking connectivity |
| #BUSY! / transient #CALC! | Wait within the host's execution budget, then report pending |
| #VALUE! | Re-enter once; if persistent, inspect signature, input types, periods and filters |
| Numeric zero | Check account activity, period and scope before deciding it is correct |

A workbook write or successful recalc is not reconciliation. Compare representative
figures and totals to NetSuite for the exact periods, segments and accounting book.
