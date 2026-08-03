# XAVI Templates — Balance Sheet & Trial Balance

> Shared conventions and the Notes/Reconciliation block are in `_conventions.md`.

## FAST-PATH RECIPE (read this, then act — do not re-derive the layout)

This file holds **Balance Sheet** and **Trial Balance**. Pick by the user's request.

Balance Sheet flow:
1. **Batch 1 question:** company name · report title · brand colors (one `ask_user_input`).
2. **Batch 2 question:** year/as-of period · FY start month (one `ask_user_input`).
   Ask the user for their Retained Earnings GL account number (needed for the RE exclusion).
3. **Phase 1 (one `Excel.run`):** filter block (+ B10 RE account, B12 FY Start Mo, B11 FY
   Start date), title, "As Of" label, all section headers and labels, plain-math subtotal/total
   rows, balance-check row, number formats, borders, gridlines off.
4. **Phase 2:** seed the first asset cell, re-enter once.
5. **Phase 3:** ▶ Continue filter prompt for B3–B6.
6. **Phase 4 (one `Excel.run`):** loop-generate and bulk-write the XAVI type lines; RE excluded
   from TYPEBALANCE("Equity") and added back via the current-year RE calc; format pass last.
7. **README (with balance sheet notes):** write the standard README, with methodology notes
   inserted prominently before the formula table (see `readme-worksheet.md`).

Balance Sheet rules: fromPeriod always omitted (`,,`); RE calculated for the CURRENT year-end;
exclude the GL Retained Earnings account (B10) from the Equity total. Detail below confirms it.

---

## Template 3 — Balance Sheet

Uses `XAVI.TYPEBALANCE` with Balance Sheet type strings. **fromPeriod is always omitted** (,,).
Single date column — no monthly layout.

### Layout — As of [Date]

Column layout:
```
B: Labels
B9: "As Of"            ← right-aligned, normal weight — label for the date cell
C9: =DATE($B$2,12,1)   ← "As of" date; format as "mmm-yyyy" (e.g. Dec-2025)
                          User can change $B$2 to update the entire Balance Sheet at once
```

| Row | Label | Formula (col C) |
|-----|-------|----------------|
| 1 | **[brand.companyName] Balance Sheet** | title, bold 14pt `brand.titleColor`, merged |
| 2 | **As of Dec-[Year]** | subtitle — use `="As of "&TEXT(DATE($B$2,12,1),"mmm-yyyy")` |
| 9 | `"As Of"` in **B9** (right-aligned) | `=DATE($B$2,12,1)` in **C9**, formatted as `mmm-yyyy` |
| 11 | **ASSETS** | label, bold, no formula |
| 12 | **Current Assets** | label, bold |
| 13 | ` Cash and Bank` | `=XAVI.TYPEBALANCE("Bank",,$C$9,$B$3,$B$4,$B$5,$B$6)` |
| 14 | ` Accounts Receivable` | `=XAVI.TYPEBALANCE("AcctRec",,$C$9,$B$3,$B$4,$B$5,$B$6)` |
| 15 | ` Other Current Assets` | `=XAVI.TYPEBALANCE("OthCurrAsset",,$C$9,$B$3,$B$4,$B$5,$B$6)` |
| 16 | ` Deferred Expenses` | `=XAVI.TYPEBALANCE("DeferExpense",,$C$9,$B$3,$B$4,$B$5,$B$6)` |
| 17 | **Total Current Assets** | `=SUM(C13:C16)` |
| 18 | *(spacer)* | |
| 19 | **Non-Current Assets** | label, bold |
| 20 | ` Fixed Assets` | `=XAVI.TYPEBALANCE("FixedAsset",,$C$9,$B$3,$B$4,$B$5,$B$6)` |
| 21 | ` Other Assets` | `=XAVI.TYPEBALANCE("OthAsset",,$C$9,$B$3,$B$4,$B$5,$B$6)` |
| 22 | **Total Non-Current Assets** | `=SUM(C20:C21)` |
| 23 | *(spacer)* | |
| 24 | **Total Assets** | `=C17+C22` |
| 25 | *(spacer)* | |
| 26 | **LIABILITIES** | label, bold |
| 27 | **Current Liabilities** | label, bold |
| 28 | ` Accounts Payable` | `=XAVI.TYPEBALANCE("AcctPay",,$C$9,$B$3,$B$4,$B$5,$B$6)` |
| 29 | ` Credit Cards` | `=XAVI.TYPEBALANCE("CredCard",,$C$9,$B$3,$B$4,$B$5,$B$6)` |
| 30 | ` Other Current Liabilities` | `=XAVI.TYPEBALANCE("OthCurrLiab",,$C$9,$B$3,$B$4,$B$5,$B$6)` |
| 31 | ` Deferred Revenue` | `=XAVI.TYPEBALANCE("DeferRevenue",,$C$9,$B$3,$B$4,$B$5,$B$6)` |
| 32 | **Total Current Liabilities** | `=SUM(C28:C31)` |
| 33 | *(spacer)* | |
| 34 | **Non-Current Liabilities** | label, bold |
| 35 | ` Long-Term Liabilities` | `=XAVI.TYPEBALANCE("LongTermLiab",,$C$9,$B$3,$B$4,$B$5,$B$6)` |
| 36 | **Total Non-Current Liabilities** | `=C35` |
| 37 | *(spacer)* | |
| 38 | **Total Liabilities** | `=C32+C36` |
| 39 | *(spacer)* | |
| 40 | **EQUITY** | label, bold |

> ⚠️ **Before building the equity section, ask the user for their Retained Earnings account
> number** — see "Retained Earnings account — why it must be excluded" below.

| 41 | ` Equity Accounts (excl. GL Retained Earnings)` | `=XAVI.TYPEBALANCE("Equity",,$C$9,$B$3,$B$4,$B$5,$B$6)-XAVI.BALANCE($B$10,,$C$9,$B$3,$B$4,$B$5,$B$6)` |
|    |   | *(B10 = RE account number cell — see setup instructions below)* |
| 42 | ` Retained Earnings (calculated)` | `=XAVI.RETAINEDEARNINGS($C$9)` ← `$C$9` already holds `=DATE($B$2,12,1)` |
| 43 | ` Net Income (YTD)` | `=XAVI.NETINCOME($B$11,$C$9)` ← `$B$11` = FY start date (derived from B12 month); `$C$9` = as-of date |
| 44 | ` CTA` | `=XAVI.CTA($C$9)` *(omit if single-currency company)* |
| 45 | **Total Equity** | `=SUM(C41:C44)` |
| 46 | *(spacer)* | |
| 47 | **Total Liabilities and Equity** | `=C38+C45` |

> ⚠️ **FY Start helper cells — required for row 43 Net Income.**
> `$C$9` already holds `=DATE($B$2,12,1)` (the "as of" date — the toPeriod for `XAVI.NETINCOME`
> and all TYPEBALANCE args). Two helper cells drive the fromPeriod:
>
> - **B12 (FY Start Mo):** the FY start month number captured from the user in Batch 2
>   (1 = Jan, 7 = Jul, 10 = Oct, etc.). Written as a plain numeric value — shaded input cell,
>   no formula.
> - **B11 (FY Start):** the computed FY start date, derived from B2 (fiscal year) and B12
>   (start month). The year adjusts automatically: a January FY starts in the same calendar
>   year as `$B$2`; any other start month started in the prior calendar year.
>
> ```javascript
> // FY start month — plain value from Batch 2 answer (e.g. 1, 7, or 10)
> sheet.getRange("A12").values = [["FY Start Mo"]];
> sheet.getRange("B12").values = [[fyStartMonth]];  // numeric month from user
> sheet.getRange("B12").numberFormat = [["0"]];
> sheet.getRange("B12").format.fill.color = "#EBF3FF";
>
> // FY start date — computed; year shifts back by 1 for any non-January start
> sheet.getRange("A11").values = [["FY Start"]];
> sheet.getRange("B11").formulas = [["=DATE(IF($B$12=1,$B$2,$B$2-1),$B$12,1)"]];
> sheet.getRange("B11").format.fill.color = "#EBF3FF";
> ```
>
> Row 43 references `$B$11` as fromPeriod and `$C$9` as toPeriod. Never write `DATE(...)`
> inline inside a XAVI argument — always pass a cell reference.

Where `$B$10` holds the GL Retained Earnings account number — see setup instructions
below. A cell reference makes the formula auditable and the account number visible.

### Retained Earnings account — why it must be excluded

**Why NetSuite excludes the GL Retained Earnings account from its balance sheet UI:**

NetSuite never posts closing entries to Retained Earnings via journal entry. Instead,
NetSuite's standard reporting dynamically reflects the appropriate Retained Earnings
balance based on the period of the report, so prior-period income statements are never
zeroed out and remain viewable. The Retained Earnings account is a system-generated
account calculated dynamically when financial reports run — it is not a posting account
and derives its value from accumulated net income.

Because of this, the GL Retained Earnings account holds only a partial balance — typically
just the opening balance entry from implementation or year-end close entries — not the true
cumulative retained earnings figure. NetSuite's balance sheet uses the retained earnings
account plus net income from prior years together to make up the cumulative beginning
Retained Earnings balance at any specified point in time.

`XAVI.TYPEBALANCE("Equity")` includes the GL RE account balance. If you then add
`XAVI.RETAINEDEARNINGS()` as a separate line without subtracting the GL RE account,
you double-count it and the balance sheet will not tie. The fix is to subtract the GL
RE account balance from the Equity type total, then show calculated RE separately via
`XAVI.RETAINEDEARNINGS()` — exactly matching NetSuite's own UI presentation.

### Getting the Retained Earnings account number

Ask the user upfront — before building the equity section. Use the `ask_user_input`
tool to render a native input box rather than asking as a prose question. Store the answer
in session memory as `reAccountNumber` and write it to a labeled cell on the sheet.

Present a brief one-line explanation followed by the input box:

> "To match NetSuite's balance sheet I need to exclude your GL Retained Earnings account
> from the Equity total — otherwise it's double-counted. What's your RE account number?"

Input box label: **"Retained Earnings GL Account #"**
Placeholder text: `e.g. 3900`
Also offer a **"I'm not sure"** option — if selected, follow the COA lookup path below.

**If the user knows the account number:** Store it in session memory as `reAccountNumber`.
In Phase 1 (structure pass), write it to a dedicated cell on the sheet:

```javascript
// Write RE account number to sheet with label and explanatory comment
sheet.getRange("A10").values = [["RE Account #"]];
sheet.getRange("A10").format.font.bold = true;
sheet.getRange("B10").values = [[reAccountNumber]];
sheet.getRange("B10").numberFormat = [["@"]];  // text format — prevent numeric coercion
sheet.getRange("B10").format.fill.color = "#EBF3FF";  // shaded — editable input cell

// Add cell comment explaining why this cell exists
const comment = sheet.comments.add(
  sheet.getRange("B10"),
  "This is the GL Retained Earnings account number. " +
  "NetSuite calculates Retained Earnings dynamically and never posts closing entries " +
  "to this account via journal entry — so it must be excluded from the Equity type " +
  "total to avoid double-counting. The Equity Accounts formula (row 41) subtracts this " +
  "account's balance from XAVI.TYPEBALANCE('Equity'). " +
  "To use a different account, update this cell and all formulas referencing $B$10 will refresh."
);

await context.sync();
```

The equity formula references `$B$10` directly:
```
=XAVI.TYPEBALANCE("Equity",,$C$9,$B$3,$B$4,$B$5,$B$6)-XAVI.BALANCE($B$10,,$C$9,$B$3,$B$4,$B$5,$B$6)
```

Tell the user:
> "I've added your RE account number to cell B10 with a note explaining why it's there.
> If the account number ever changes, just update B10 and the formula refreshes automatically."

**If the user is unsure:** Instruct them to use XAVI's Bulk Add GL Accounts to load
their COA, then use INDEX/MATCH on the Spec Acct Type column to find it automatically:

> "No problem — here's how to find it:
> 1. Create a new sheet called 'COA'
> 2. Open the XAVI task pane, type `*` in the GL Account box, click **Bulk Add GL Accounts**
> 3. Once it populates, come back here and I'll look it up for you automatically."

Once the COA sheet is available, read the Spec Acct Type column to find the RE account
number, store it as `reAccountNumber`, and write it to `$B$10` with the comment above.
The INDEX/MATCH formula for reference (not written to the sheet — read and store result):
```
=INDEX(COA!$C:$C, MATCH("RetEarnings", COA!$B:$B, 0))
```
Where COA column B = Spec Acct Type, COA column C = Account Number.

**If the user cannot provide it and COA is unavailable:** Warn them:
> "Without excluding the GL Retained Earnings account, the equity section and balance
> check will not tie to NetSuite's UI. Tell me the account number at any time and
> I'll write it to cell B10 and the formula will update automatically."
Then build with plain `XAVI.TYPEBALANCE("Equity")` for now, leaving B10 blank.

### Formatting flags
- Rows 17, 22: bold, top border (current/non-current asset subtotals)
- Row 24: bold, top border (Total Assets)
- Rows 32, 36: bold, top border
- Row 38: bold, top border (Total Liabilities)
- Row 45: bold, top border (Total Equity)
- Row 47: bold, **double bottom border** (Total Liabilities and Equity)

### Balance check
Add a check row:
```
Row 49: "Balance Check"  |  =C24-C47   [should be 0; format red if non-zero]
```
Conditional formatting on C46: if `<>0`, fill red.

### Balance Sheet Notes — written into the README

The methodology notes for this report go into the **README** worksheet, not a separate tab.
They are written prominently at the top of the balance sheet README section — immediately after
the report header, before the formula table — so any reviewer opening README sees them first.

Full content spec, formatting, and Office.js write pattern are in `references/readme-worksheet.md`
under "Balance Sheet notes block."

---

## Template 7 — Trial Balance

A full account-level trial balance pulling every GL account with activity for a given period.
Uses `XAVI.BALANCE` for each account row, with IS and BS accounts treated differently.
Typically built on a dedicated sheet (e.g. "Trial Balance") separate from other reports.

### Setup questions — ask upfront before building

Ask both questions at once:

> "Two quick questions before I build the trial balance:
> 1. **Period range** — what is the From period and To / As of period?
>    Format: `MMM-YYYY` (e.g. `Jan-2025` to `Dec-2025`). I'll store these as text cells
>    so changing them repoints the entire TB. If you type a date and Excel auto-converts,
>    IS rows will silently return 0 — I'll detect and fix this automatically.
> 2. **Zero-row handling** — remove accounts with $0 activity when done? (Recommended —
>    a typical COA has 400+ accounts and 200–300 may have no activity in the period.)"

### Filter block layout

```
A2: "Year"          B2: [year, e.g. 2025]      ← standard year filter
A7: "P&L To / As of"  B7: Dec-2025             ← TEXT format (@), not date serial
A8: "P&L From"        B8: Jan-2025             ← TEXT format (@), not date serial
```

Always set `numberFormat = [["@"]]` on B7 and B8 BEFORE writing their values.
Do NOT use `=DATE(...)` formulas in B7 or B8 — date serials break IS account formulas.

### COA sheet prerequisite

Before building formulas, the user must run **Bulk Add GL Accounts** (enter `*` in the GL
Account box, click "Bulk Add GL Accounts") to populate a "COA" sheet with columns:
AcctType | AcctNumber | Parent | AcctName.
Read this sheet to get the actual account list before writing any formulas.

### Formula pattern by account type

The first argument must always reference the account-number cell on the same row (`$A{row}`),
never embed a literal account string. Use `$A` (column-locked, row-relative) so the formula
is draggable — when written to E11 and filled down, `$A11` becomes `$A12`, `$A13`, etc.

**Income Statement accounts** (Income, OthIncome, COGS, Expense, OthExpense):
```
=XAVI.BALANCE($A11, $B$8, $B$7, $B$3, $B$4, $B$5, $B$6)
```
Both fromPeriod (`$B$8`) and toPeriod (`$B$7`) are required. These cells must be TEXT
strings in `MMM-YYYY` format — not date serials (period rules are in `_conventions.md`;
load `formulas.md` only if you need the full period-resolution reference).

**Balance Sheet accounts** (Bank, AcctRec, OthCurrAsset, FixedAsset, OthAsset,
DeferExpense, AcctPay, CredCard, OthCurrLiab, DeferRevenue, LongTermLiab, Equity):
```
=XAVI.BALANCE($A11,, $B$7, $B$3, $B$4, $B$5, $B$6)
```
fromPeriod is omitted (`,,`) — BS accounts accumulate from inception.

- ❌ `=XAVI.BALANCE("4010", $B$8, $B$7, $B$3, $B$4, $B$5, $B$6)`
- ✅ `=XAVI.BALANCE($A11, $B$8, $B$7, $B$3, $B$4, $B$5, $B$6)`

Same rule applies to `XAVI.NAME($A11)`, `XAVI.TYPE($A11)`, `XAVI.PARENT($A11)` anywhere
they appear in the TB layout.

### Layout

```
Col A: Account Number  (cell-referenced by all XAVI.BALANCE formulas on the same row)
Col B: Account Name
Col C: Account Type
Col D: Debit / Credit flag (Assets/Expenses = Debit; Liabilities/Equity/Income = Credit)
Col E: Balance (XAVI.BALANCE formula referencing $A{row})
Col F: Check column — used for the completion-poll row
```

Group rows in this order, with bold section headers and top borders on subtotals:
```
ASSETS
  Current Assets     (Bank, AcctRec, OthCurrAsset, DeferExpense)
  Non-Current Assets (FixedAsset, OthAsset)
  Total Assets       ← XAVI.TYPEBALANCE sum, top border, bold

LIABILITIES
  Current Liabilities   (AcctPay, CredCard, OthCurrLiab, DeferRevenue)
  Non-Current Liabilities (LongTermLiab)
  Total Liabilities      ← XAVI.TYPEBALANCE sum, top border, bold

EQUITY
  Equity Accounts (excl. GL RE)  ← XAVI.TYPEBALANCE("Equity") minus XAVI.BALANCE(RE acct)
  Retained Earnings (calculated) ← XAVI.RETAINEDEARNINGS(...)
  Net Income (YTD)               ← XAVI.NETINCOME(...)
  CTA (if multi-currency)        ← XAVI.CTA(...)
  Total Equity           ← sum of above lines, top border, bold
  (See Template 3 — Balance Sheet for full RE exclusion setup)

Total Liabilities & Equity  ← double bottom border, bold
Balance Check row           ← Total Assets − Total Liabilities & Equity, red if non-zero

INCOME
  Revenue            (Income, OthIncome)
  Cost of Goods Sold (COGS)
  Gross Profit       ← calculated, top border, bold
  Operating Expenses (Expense)
  Operating Income   ← calculated, top border, bold
  Other Expenses     (OthExpense)
  Net Income         ← XAVI.NETINCOME, double bottom border, bold
```

### Four-phase build sequence

Follow the same seed-and-pause pattern as the CFO Flash. Do NOT write all 400+ formulas
at once before XAVI has been activated on the sheet.

> ⚠️ **Always seed E11 first and wait for it to resolve before bulk-writing remaining
> account formulas.** Writing all 400+ XAVI.BALANCE formulas at once before the seed
> resolves causes every cell to stall at `#CALC!` indefinitely — re-entry does not
> recover it. The seed formula primes the XAVI connection; subsequent batch writes
> then fetch normally.

**Phase 1 — Structure (no XAVI formulas yet)**
Write in a single Office.js pass with `suspendScreenUpdatingUntilNextSync()`:
- Filter block A2:B8 (Year, Subsidiary, Dept, Location, Class, P&L To, P&L From)
  — set B7/B8 `numberFormat = [["@"]]` BEFORE writing period string values
- Report title and subtitle
- Column headers row 10: Account Number | Account Name | Type | D/C | Balance
- All account rows from COA: populate A11:D{lastRow} with account number, name, type, D/C flag
- Section headers, subtotal labels, total labels — text only, no formulas yet
- Completion-poll cell (e.g. F{lastRow+2}): `=COUNTA(E11:E{lastRow})`
- Formatting: gridlines off, bold headers, number format on col E

**Phase 2 — Seed formula (E11 only)**
Determine whether row 11 is an IS or BS account type, then write the appropriate formula:
```javascript
// IS account (Income, OthIncome, COGS, Expense, OthExpense):
sheet.getRange("E11").formulas = [['=XAVI.BALANCE($A11,$B$8,$B$7,$B$3,$B$4,$B$5,$B$6)']];
// BS account (all others):
// sheet.getRange("E11").formulas = [['=XAVI.BALANCE($A11,,$B$7,$B$3,$B$4,$B$5,$B$6)']];
await context.sync();
```
Wait for E11 to resolve to a number. If `#VALUE!`, re-enter in place. If `#CALC!` persists
beyond normal fetch time, check that B7/B8 are TEXT format and contain valid `MMM-YYYY` strings.

**Phase 3 — Filter prompt (▶ Continue button panel)**
Show instructions and a **▶ Continue** button — do NOT ask the user to type a reply:
> "The first formula is live. Set your filters using the XAVI task pane:
> 1. Click **B3** (Subsidiary) — use the XAVI filter selector
> 2. Click **B4** (Department), **B5** (Location), **B6** (Class) — leave blank for all
> It is fine to leave all filters blank."

Do not proceed until **▶ Continue** is clicked.

**Phase 4 — Bulk fill, poll, and prune**
After the user confirms:

1. **Write all remaining E-column formulas in one pass.** For each account row, choose IS
   or BS pattern based on the account type in col C:
   ```javascript
   // IS accounts:  =XAVI.BALANCE($A{row},$B$8,$B$7,$B$3,$B$4,$B$5,$B$6)
   // BS accounts:  =XAVI.BALANCE($A{row},,$B$7,$B$3,$B$4,$B$5,$B$6)
   ```
   Write as a batch — build an array of formula strings, assign to `E12:E{lastRow}.formulas`
   in a single `context.sync()`. Do NOT use `autoFill` (unsafe for async custom functions).

2. **Write subtotal and total formulas** (XAVI.TYPEBALANCE for section totals, plain
   arithmetic for Gross Profit / Operating Income / Net Income).

3. **Poll the completion-check cell** until it returns a stable number — all async fetches
   have completed when the count stops changing between reads.

4. **Zero-row pruning** (if user opted in — execute only after poll stabilises):
   - Identify leaf rows where `value` is a Number AND equals 0
   - Delete in **reverse row order** to preserve indices
   - Walk subtotal rows: delete any whose SUM range has no surviving leaves
   - Walk section headers/totals: delete header, total, and spacer if section is empty
   - Rebuild SUM range references in all surviving subtotal and grand-total formulas
   - Offer **Delete** (default) or **Hide** (row height = 0, recoverable)
   - Report: "Removed N zero-activity accounts. M accounts remain."

5. **Apply board-ready formatting** (Essential Formatting in `_conventions.md`):
   - `sheet.showGridlines = false`
   - Section headers: bold, `#09235C` text
   - Account rows: 2-space indent in col B
   - Subtotals: bold, single top border
   - Grand totals: bold, double bottom border
   - Balance check row: conditional format red if `<>0`
   - Col E number format: `#,##0_);(#,##0);"-"` (0 decimal places, no exceptions)

### Formatting (apply after pruning)

- Remove gridlines: `sheet.showGridlines = false`
- Report title: bold, 14pt, `#09235C`, merged
- Section headers: bold, `#09235C` text color, no fill
- Account rows: normal weight, 2-space indent in Account Name
- Subtotal rows: bold, single top border
- Grand totals: bold, double bottom border
- Balance check row: bold; conditional format — fill red if `<>0`
- Number format on all balance cells: `#,##0_);(#,##0);"-"` (0 decimal places, no exceptions)
- Column widths: Account Number ~12, Account Name ~35, Type ~18, D/C ~8, Balance ~16

### ⚠️ Period cell coercion check

After building, always verify B7 and B8 before delivering:
```javascript
const b7 = sheet.getRange("B7");
b7.load(["numberFormat", "valueTypes"]);
await context.sync();
const isText = b7.numberFormat[0][0] === "@" ||
               b7.valueTypes[0][0] === Excel.RangeValueType.text;
// If not text: reformat and prompt user to re-enter the period string
```
If coerced, re-set `numberFormat = [["@"]]` and prompt the user to retype using a
leading apostrophe or after setting the cell to Text format.

---

