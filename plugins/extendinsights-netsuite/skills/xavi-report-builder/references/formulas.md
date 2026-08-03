# XAVI Formula Reference

All formulas begin with `XAVI.` and pull live data from the user's connected NetSuite account.

---

## XAVI.TYPEBALANCE

**The primary formula for all summary-level reports.** Returns the total balance for all
accounts of a given NetSuite account type. Works regardless of the customer's chart of accounts
numbering — never requires an account number.

### Syntax
```
=XAVI.TYPEBALANCE(accountType, fromPeriod, toPeriod, [subsidiary], [department], [location], [class], [accountingBook])
```

### Valid Account Type Strings

**Balance Sheet — Assets**
| String | Category |
|--------|----------|
| `"Bank"` | Bank / Cash accounts |
| `"AcctRec"` | Accounts Receivable |
| `"OthCurrAsset"` | Other Current Assets |
| `"FixedAsset"` | Fixed Assets |
| `"OthAsset"` | Other Assets |
| `"DeferExpense"` | Deferred Expenses / Prepaid |

**Balance Sheet — Liabilities**
| String | Category |
|--------|----------|
| `"AcctPay"` | Accounts Payable |
| `"CredCard"` | Credit Card |
| `"OthCurrLiab"` | Other Current Liabilities |
| `"DeferRevenue"` | Deferred Revenue |
| `"LongTermLiab"` | Long-Term Liabilities |

**Balance Sheet — Equity**
| String | Category |
|--------|----------|
| `"Equity"` | Equity accounts |

**Income Statement**
| String | Category |
|--------|----------|
| `"Income"` | Revenue |
| `"OthIncome"` | Other Income |
| `"COGS"` | Cost of Goods Sold |
| `"Expense"` | Operating Expenses |
| `"OthExpense"` | Other Expenses |

### Examples
```
Revenue for Jan 2025 — month header cell C9 holds the DATE serial (compliant ✅):
=XAVI.TYPEBALANCE("Income", C$9, C$9, $P$5, $Q$5, $R$5, $S$5)

Total Expenses for full year 2025 — write helper cells first, then reference them (✅):
(B10 = =DATE($B$3,1,1) "FY Start",  B11 = =DATE($B$3,12,1) "FY End")
=XAVI.TYPEBALANCE("Expense", $B$10, $B$11, $P$5, $Q$5, $R$5, $S$5)

Accounts Receivable as of end of March 2025 — use helper cell for toPeriod (✅):
(C9 = =DATE($B$3,3,1) "As Of")
=XAVI.TYPEBALANCE("AcctRec",, $C$9, $P$5, $Q$5, $R$5, $S$5)
```

> ⚠️ **Never pass `DATE(...)`, `TEXT(...)`, `EOMONTH(...)`, `&` concatenation, or arithmetic
> as a XAVI argument.** Refresh All cannot evaluate nested Excel functions inside XAVI
> arguments — it reads the literal cell value and skips any cell where the argument is
> an expression rather than a cell reference. Always compute date values in a helper cell
> first (`=DATE($B$2,12,1)` in cell B10), then pass that cell reference (`$B$10`).

⚠️ **Balance Sheet types** (all Asset, Liability, and Equity types): omit `fromPeriod` using
`,,` — they accumulate from inception, not from a start date.

---

## XAVI.BALANCE

Returns the GL balance for a specific account number or wildcard pattern. Use only when the
user explicitly provides account numbers, or for Budget vs. Actual wildcard patterns.

### Syntax
```
Income / Expense accounts:
=XAVI.BALANCE(account, fromPeriod, toPeriod, [subsidiary], [department], [location], [class], [accountingBook])

Balance Sheet accounts (fromPeriod omitted):
=XAVI.BALANCE(account,, toPeriod, [subsidiary], [department], [location], [class], [accountingBook])
```

### Wildcard patterns (safe to use without knowing exact accounts)
| Pattern | Typical use |
|---------|-------------|
| `"4*"` | All Revenue accounts |
| `"5*"` | All COGS accounts |
| `"6*"` | All Operating Expense accounts |
| `"7*"` | Other Operating |
| `"8*"` | Other Income/Expense |

### Examples
```
User-supplied account, single month — header cell is the helper (✅):
=XAVI.BALANCE("4010", C$9, C$9, $P$5, $Q$5, $R$5, $S$5)

Wildcard — all expenses, full year — write helper cells, then reference (✅):
(B10 = =DATE($B$3,1,1),  B11 = =DATE($B$3,12,1))
=XAVI.BALANCE("6*", $B$10, $B$11, $P$5, $Q$5, $R$5, $S$5)
```

---

## XAVI.BALANCECURRENCY

Same as XAVI.BALANCE but adds an explicit currency parameter for multi-currency consolidation.
Note: `currency` is in position 5, between `subsidiary` and `department`.

### Syntax
```
=XAVI.BALANCECURRENCY(account, fromPeriod, toPeriod, subsidiary, currency, [department], [location], [class], [accountingBook])
```

### Example
```
India subsidiary balance reported in USD:
=XAVI.BALANCECURRENCY("60010", C$6, C$6, $P$5, "USD", $Q$5, $R$5, $S$5)
```

⚠️ Invalid subsidiary/currency combinations return `INV_SUB_CUR` (balance = 0). Use the XAVI
task pane to look up valid currency options for a subsidiary.

---

## XAVI.BUDGET

Returns the budget amount for a single period. Supports the same account and wildcard
patterns as XAVI.BALANCE, plus an optional `budgetCategory` parameter.

### Syntax
```
=XAVI.BUDGET(account, fromPeriod, toPeriod, [subsidiary], [department], [location], [class], [accountingBook], [budgetCategory])
```

### ⚠️ Known bug — period range does not work

`XAVI.BUDGET` only returns a correct value when `fromPeriod` and `toPeriod` are the
**same single period**. Passing a date range (e.g. Jan to Mar for a quarter) returns
incorrect results or 0.

**Pass real date serials via cell references — NOT `TEXT(...,"mmm-yyyy")` strings.** The string form
resolves to 0. For monthly layouts, pass the month header cell (`C$9`). For quarterly layouts,
pass a helper cell written in Phase 1. Never embed `DATE(...)` inside the XAVI formula string.

**Workaround — sum individual single-month calls, each referencing a helper cell:**
To get a quarterly or full-year budget total, sum one `XAVI.BUDGET` call per month,
passing the pre-written helper cell for each month's date:

```
Monthly — month header cell is the helper (✅):
=XAVI.BUDGET($A11, C$9, C$9, $B$3,$B$4,$B$5,$B$6,$B$7)

Q1 budget using 12-month helper row (row 10 hidden, C10=month 1, D10=month 2, E10=month 3):
=XAVI.BUDGET($A11,$C$10,$C$10,$B$3,$B$4,$B$5,$B$6,$B$7)
+XAVI.BUDGET($A11,$D$10,$D$10,$B$3,$B$4,$B$5,$B$6,$B$7)
+XAVI.BUDGET($A11,$E$10,$E$10,$B$3,$B$4,$B$5,$B$6,$B$7)

Full-year budget (sum 12 monthly calls, each referencing its month helper cell):
=XAVI.BUDGET($A11,$C$10,$C$10,$B$3,$B$4,$B$5,$B$6,$B$7)
+XAVI.BUDGET($A11,$D$10,$D$10,$B$3,$B$4,$B$5,$B$6,$B$7)
+...
+XAVI.BUDGET($A11,$N$10,$N$10,$B$3,$B$4,$B$5,$B$6,$B$7)
```

When a month header cell already holds the `DATE` serial (e.g. `C$9`), pass it directly:
```
Monthly budget for column C:
=XAVI.BUDGET($A11,C$9,C$9,$B$3,$B$4,$B$5,$B$6,$B$7)
```

This bug applies to all account types and wildcards. Always use single-month `DATE(...)`
serials and sum them for quarter/year totals. Never wrap the date in `TEXT(...)`.

### Single-month example (always correct — pass the header/helper cell)
```
Jan budget, single account via cell ref — month header cell is the helper (✅):
=XAVI.BUDGET($A11, C$9, C$9, $B$3,$B$4,$B$5,$B$6,$B$7)

Budget vs. Actual variance for Jan:
=XAVI.BALANCE($A11,C$9,C$9,$B$3,$B$4,$B$5,$B$6)
-XAVI.BUDGET($A11,C$9,C$9,$B$3,$B$4,$B$5,$B$6,$B$7)
```

---

## Special Formulas

These calculate values NetSuite computes dynamically — they have no GL account equivalent.

### XAVI.NETINCOME
Returns net income for a period range. **Always supply both fromPeriod and toPeriod** — a
single period returns only that month's P&L, not YTD. Both args must be helper-cell references.

```
YTD Net Income through March 2025 — write helper cells B10/B11 first (✅):
(B10 = =DATE($B$3,1,1) "FY Start",  B11 = =DATE($B$3,3,1) "Through")
=XAVI.NETINCOME($B$10, $B$11)

Full-year Net Income — helper cells for full-year range (✅):
(B10 = =DATE($B$3,1,1),  B11 = =DATE($B$3,12,1))
=XAVI.NETINCOME($B$10, $B$11)
```

### XAVI.RETAINEDEARNINGS
Returns cumulative P&L through prior year-end. Used on the Balance Sheet.

```
Pass the "as of" date helper cell (e.g. C9 = =DATE($B$2,12,1)) (✅):
=XAVI.RETAINEDEARNINGS($C$9)
```

### XAVI.CTA
Returns Cumulative Translation Adjustment. Used on the Balance Sheet equity section for
multi-currency companies.

```
Pass the "as of" date helper cell (✅):
=XAVI.CTA($C$9)
```

---

## Lookup Formulas

| Formula | Purpose | Example |
|---------|---------|---------|
| `XAVI.NAME(account)` | Returns account name | `=XAVI.NAME("4010")` → "Product Revenue" |
| `XAVI.TYPE(account)` | Returns account type string | `=XAVI.TYPE("4010")` → "Income" |
| `XAVI.PARENT(account)` | Returns parent account number | `=XAVI.PARENT("4010-1")` → "4010" |

### ⚠️ Retained Earnings — no valid TYPEBALANCE type string

The GL Retained Earnings account is classified under `"Equity"` by XAVI.TYPEBALANCE.
There is no separate type string for it:
- `"RetEarnings"` → returns `#VALUE!`
- `"RetainedEarnings"` → returns `0`
- `XAVI.TYPE(<RE account>)` → returns `"Equity"` (not `"RetEarnings"`)
- There is no `XAVI.SPECTYPE` or `XAVI.SPECACCTTYPE` function

The only reliable way to isolate the GL Retained Earnings account is via its **Spec Acct
Type** metadata (`"RetEarnings"`) on a loaded COA sheet. Use INDEX/MATCH against the
Spec Acct Type column (col B from Bulk Add output):
```excel
=INDEX(COA!$C:$C, MATCH("RetEarnings", COA!$B:$B, 0))
```
This returns the account number, which can then be passed to `XAVI.BALANCE` to subtract
it from `XAVI.TYPEBALANCE("Equity")`. See Template 3 — Balance Sheet for full details.

---

## Date / Period Rules

### How XAVI resolves periods

When you pass a period argument to any XAVI formula, XAVI converts it to a NetSuite
accounting period by looking up the period table in NetSuite. This means:

- A date serial (e.g. an Excel `=DATE(2025,1,1)` cell) is matched to the NetSuite period
  that contains that date — typically "Jan 2025".
- A text string in `MMM-YYYY` format (e.g. `"Jan-2025"`) is matched directly to the
  NetSuite period name.
- A **NetSuite period internal ID** (e.g. `"142"`) can also be passed as a text string
  and will be resolved directly — useful when you know the exact ID.

**To see your actual NetSuite period names and IDs:**
Use the XAVI task pane → **Bulk Add GL and Periods** feature. Enter `*` in the period
box and click **Bulk Add Periods** to populate a sheet with your full period list,
including internal IDs, period names, and dates. Use this as your reference when periods
don't resolve as expected or when building Trial Balance filter cells.

### Core rules

> ⛔ **Never pass `DATE(...)`, `TEXT(...)`, `EOMONTH(...)`, `&` concatenation, or arithmetic
> expressions as a XAVI argument.** Refresh All reads the cell's resolved value — it cannot
> evaluate a nested function. Compute the date in a helper cell first; pass that cell
> reference. Monthly header cells (C$9, D$9…) are the standard helper cells for
> single-month columns. For all other periods, add dedicated helper cells per the template.

- **Year is always a filter cell.** Store the year in `$B$2`. FY start month in `$B$9`
  (1–12). All period formulas reference both — never hardcode year or month literals.
- **Month header row:** Build headers using the fiscal year formula pattern (see
  `references/report-templates.md`). Format cells as `mmm-yyyy`. The underlying value
  is a real Excel date serial — XAVI matches it to the correct NetSuite period. When
  `$B$2` or `$B$9` changes, every header and formula refreshes at once.
- **Formula date arguments:** Use the month header cell (e.g. `C$9`) as both fromPeriod
  and toPeriod for single-month columns. For full-year arguments use
  `DATE($B$2,$B$9,1)` as from and the last month of the FY as to.
- **Text period strings:** If using text instead of date serials, write `"Jan-2025"`
  (dash, no space). XAVI matches this directly to the NetSuite period name. You can
  also pass a period internal ID as a text string (e.g. `"142"`).
- **Balance Sheet accounts:** fromPeriod must be omitted (`,,` not `,"",`).
- **Year shorthand:** Passing a year number as both from and to resolves to the full
  year's periods, but always use cell references rather than literals.

### ⚠️ CRITICAL — Trial Balance and period-cell text format

For Trial Balance reports, XAVI parses period arguments as NetSuite accounting period
strings (e.g. `"Dec-2025"`). **Income-statement formula accounts (`XAVI.BALANCE` for IS
account types) require text strings in this format.** Passing a date serial — even one
visually formatted as `mmm-yyyy` — causes IS formulas to return `#CALC!` indefinitely or
silently return `0`. The display format does not change the underlying cell value type.

**Correct period cell construction for Trial Balance filter cells:**

```javascript
// Set format to text BEFORE writing the value — order matters
sheet.getRange("B7").numberFormat = [["@"]];   // @ = text format
sheet.getRange("B7").values        = [["Dec-2025"]];  // P&L To / As of
sheet.getRange("B8").numberFormat = [["@"]];
sheet.getRange("B8").values        = [["Jan-2025"]];  // P&L From
```

- Do NOT use `=DATE(...)` formulas in TB period cells — date serials break IS accounts
- BS accounts may tolerate date serials, but use text strings in both cells for consistency
- Set text format BEFORE writing formulas that reference these cells; if formulas are
  already written and the period cells later get coerced to dates, every IS formula will
  silently return 0 while BS values remain correct

**Diagnosing a date-coercion problem:** Read `numberFormat` on B7/B8. If it is anything
other than `@`, or the `valueType` is `Double` instead of `String`, the cell has been
coerced. Fix: set `numberFormat = [["@"]]`, then prompt the user to retype the period
string with a leading apostrophe (e.g. `'Dec-2025`) or after setting the cell to Text
format via Format Cells.

**When to ask the user:** When building a Trial Balance, always tell the user upfront:
> "I'll add two filter cells: **P&L From** (e.g. `Jan-2025`) and **P&L To / As of**
> (e.g. `Dec-2025`), both stored as TEXT in `MMM-YYYY` format. Changing either cell
> repoints the entire trial balance. If you type a date and Excel auto-converts it,
> IS account rows will return 0 — I'll detect and fix this automatically."

---

## Error Codes & Troubleshooting

| Error | Formula | Meaning | Fix |
|-------|---------|---------|-----|
| `INVALIDACCT` | XAVI.BALANCE | Account is wrong type | Check account number; use XAVI.TYPE to verify |
| `NOTFOUND` | XAVI.BALANCE | Account doesn't exist in NetSuite | Verify the account number |
| `TIMEOUT` | Any | NetSuite query timed out | Wait and recalculate; check connection |
| `INV_SUB_CUR` | XAVI.BALANCECURRENCY | Invalid currency/subsidiary combo | Check valid currencies in task pane |
| `#BUSY` | Any | XAVI is fetching data | Wait; BS accounts take longer (sum from inception) |
| `#CALC!` | TYPEBALANCE (BS types) | Async fetch in progress — **not an error** | Wait for NetSuite to respond; do not diagnose until resolved |
| `#VALUE!` | Any | Formula did not resolve cleanly | **First:** Claude re-enters the formula in place automatically via execute_office_js (read `.formulas`, write the same string back, `context.sync()`) — never instruct the user to do this manually. This clears most transient `#VALUE!` errors immediately. **If it persists after re-entry:** check that the account is in quotes, the period format is correct, and skipped filter arguments use `""` not a missing comma. |
| Returns 0 | Any | No data found | Verify account exists, has activity in period, filters not too restrictive |

**`#CALC!` is normal for balance-sheet TYPEBALANCE calls.** When `fromPeriod` is omitted,
XAVI must sum all transactions from inception — this fetch takes longer than period-scoped
calls. A Cash Flow Statement with 20+ working-capital lines will show `#CALC!` across most
rows for several seconds. This is expected behavior, not a formula problem. Never conclude
a wildcard understates or a formula is wrong while `#CALC!` values are still resolving.

**Sudden all-zeros:** Click **Refresh All** in the task pane. The tunnel URL may have changed.

**Performance tip:** Use wildcards (`"6*"`) or TYPEBALANCE instead of many individual account
formulas. Dragging formulas (rather than typing each) triggers XAVI's batch optimization — up to
60+ formulas in a single API call.
