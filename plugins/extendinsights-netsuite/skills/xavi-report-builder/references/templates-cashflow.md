# Cash flow draft — indirect method

A balance-delta worksheet is a starting point, not a complete cash flow statement.
Account balances alone cannot distinguish cash movements from depreciation,
noncash acquisitions, disposals, reclassifications or FX. Ask whether the user has
NetSuite cash-flow details or adjustment schedules to reconcile those items.
Do not promise that balance deltas match cash flows even in single-currency entities.

Use shared B2 fiscal start year and B9 FY month; annual D3:O3 dates. Add helpers in
the reserved D13:E16 block: E13 = O3 (FY end), E14 = D3 (FY start),
E15 = EDATE(E14,-1) (prior FY end). These occupy no report-label cells.
For partial-year reports obtain explicit boundaries and label them accordingly.

B labels, C amounts; header row 30. Seed Net Income C31:
`=XAVI.NETINCOME($E$14,$E$13,$B$3,$B$4,$B$5,$B$6,$B$8)`.
For each balance movement, end uses E13 and beginning E15, omitting fromPeriod:
`XAVI.TYPEBALANCE("AcctRec",,$E$13,$B$3,$B$4,$B$5,$B$6,$B$8)`.
An asset increase contributes a negative change; liability increases positive.

| Rows | Section |
|---|---|
| 31 | Net income |
| 32 | Verified noncash operating adjustments (with schedule references) |
| 33–39 | Movements: AcctRec, OthCurrAsset, DeferExpense, AcctPay, CredCard, DeferRevenue, OthCurrLiab |
| 40 | Operating cash draft = SUM(C31:C39) |
| 42–43 | FixedAsset / OthAsset negative deltas, adjusted for noncash movements |
| 44 | Investing cash draft = SUM(C42:C43) |
| 46–47 | LongTermLiab / Equity deltas, adjusted to actual cash financing transactions |
| 48 | Financing cash draft = SUM(C46:C47) |
| 50 | Verified FX effect on cash from source schedule, if applicable |
| 51 | Explained net cash change = C40+C44+C48+C50 |
| 53 | Beginning Bank balance (E15) |
| 54 | Explained ending cash = C53+C51 |
| 55 | Actual ending Bank balance (E13) |
| 56 | Unreconciled difference = C55-C54 |

Leave missing required adjustments clearly marked pending, not silently zero.
Do not label row 56 FX: it may reflect missing accounts, noncash movements or errors.
Do not add that residual into row 51 or 54 to force a zero check. For verified
no-FX scope, row 50 may be zero with the assumption documented.

Equity delta alone is not proof of cash financing. Separate contributions,
distributions, retained earnings and translation movements using source details.
CTA measures net-asset translation and cannot substitute for FX on cash.
Reconcile category coverage and cash totals to NetSuite, using consistent filters
and book for every call. Format row 56 red if nonzero. Document the draft status,
adjustments, unresolved differences and source verification in README and notes.
