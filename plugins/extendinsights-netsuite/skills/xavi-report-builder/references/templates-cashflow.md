# XAVI Templates — Cash Flow Statement

> Shared conventions and the Notes/Reconciliation block are in `_conventions.md`.

## FAST-PATH RECIPE (read this, then act — do not re-derive the layout)

A Cash Flow Statement is a fixed single-column annual layout. Execute, don't deliberate:
1. **Batch 1 question:** company name · report title · brand colors (one `ask_user_input`).
2. **Batch 2 question:** year (one `ask_user_input`; FY assumed Dec year-end unless the
   user says otherwise — cash flow uses calendar year-end balance snapshots).
3. **Phase 1 (one `Excel.run`):** filter block A2:B6, title row 1, subtitle row 2, all
   section headers and row labels (rows 10–41 per the Formula layout table), the plain-math
   subtotal/total rows (21, 26, 31, 33, 35, 38, 41), number formats, borders, gridlines off.
   No XAVI yet on the working-capital lines.
4. **Phase 2:** seed the Net Income cell (C11), re-enter once to clear `#VALUE!`.
5. **Phase 3:** filter prompt (▶ Continue) so the user sets B3–B6.
6. **Phase 4 (one `Excel.run`):** write all XAVI working-capital + total lines (rows 14–20,
   24–25, 29–30, 34, 37, 40). Each is a beginning-vs-ending TYPEBALANCE delta — generate
   them from the row/type map with a JS loop, do not hand-type 20 near-identical formulas.
7. **Step A:** wait until all cells resolve (many `#CALC!` while fetching — normal).
8. **Step B (LAST):** format-enforcement pass; conditional-format the tie-out row 41 red if `<>0`.
9. README, closing recap.

Single column: **C** holds every annual amount. No monthly/quarterly breakdown.
Key correctness rules live below — equity line is TYPEBALANCE only (no CTA), FX-on-cash is
the row-34 residual, tie-out row 41 must equal 0. Act on the recipe; the detail confirms it.

---

## Template 6 — Cash Flow Statement (Indirect Method)

Single annual column. Year cell `$B$2` drives both the beginning and ending period references,
so changing the year updates the entire statement at once.

**Period definitions — write these to helper cells in Phase 1 (never inline inside XAVI):**
```
A10: FY End       B10: =DATE($B$2,12,1)     ← current year-end; drives all ending balances
A11: Prior FY End B11: =DATE($B$2-1,12,1)   ← prior year-end; drives all beginning balances
A12: FY Start     B12: =DATE($B$2,1,1)      ← Jan 1 of year; drives Net Income fromPeriod
```
Shade B10:B12 `#EBF3FF` — they are computed (not typed), but must be visible so auditors
can verify the dates. All XAVI period arguments reference `$B$10`, `$B$11`, or `$B$12`.
No `DATE(...)` expression may appear inside any XAVI formula string.

### Setup questions (ask upfront, batched — see SKILL.md Step 1)
Cash Flow needs only the standard branding batch plus the year. There is no granularity
choice (it is always a single annual column) and no budget source. Two `ask_user_input`
calls total: (1) company/title/colors, (2) year. Then build.

### Filter Setup
Same A2:B6 block as all other templates. Year in B2 is especially critical here — it controls
both the P&L period and the two balance sheet snapshots used for working-capital deltas.

### Build sequence (four phases — same discipline as other templates)
- **Phase 1 (one `Excel.run`, one `context.sync()`):** `showGridlines=false` first line;
  filter block (A2:B6 standard) **plus period helper cells** B10:B12 per the Period
  definitions above (write both the A-column labels and the B-column DATE formulas;
  shade B10:B12 `#EBF3FF`); title/subtitle, all section headers and labels (rows 14–41),
  and the plain-arithmetic subtotal/total rows (21, 26, 31, 33, 35, 38, 41). Number formats
  and borders applied to the full column C range now. No XAVI on working-capital lines yet.
- **Phase 2:** seed C11 (Net Income), re-enter once in the same `Excel.run` to clear `#VALUE!`.
- **Phase 3:** ▶ Continue filter prompt for B3–B6.
- **Phase 4 (one `Excel.run`):** write all XAVI delta lines. Build them with a JS loop from a
  row→accountType map (see below) rather than hand-typing 20 formulas. Then the format pass
  as the final step, including the row-41 red conditional format.

**Phase 4 loop pattern — references `$B$10`/`$B$11` helper cells, never inline `DATE(...)`:**
```javascript
// B10 = =DATE($B$2,12,1)   (FY End — written in Phase 1)
// B11 = =DATE($B$2-1,12,1) (Prior FY End — written in Phase 1)
// ✅ Formula strings reference helper cells — no DATE() expressions inside XAVI args
// row -> [accountType, isAsset]  (assets get a leading minus: increase = use of cash)
const lines = {
  14:["AcctRec",true], 15:["OthCurrAsset",true], 16:["DeferExpense",true],
  17:["AcctPay",false], 18:["CredCard",false], 19:["DeferRevenue",false],
  20:["OthCurrLiab",false], 24:["FixedAsset",true], 25:["OthAsset",true],
  29:["LongTermLiab",false], 30:["Equity",false]
};
for (const [row, [t, isAsset]] of Object.entries(lines)) {
  const end = `XAVI.TYPEBALANCE("${t}",,$B$10,$B$3,$B$4,$B$5,$B$6)`;
  const beg = `XAVI.TYPEBALANCE("${t}",,$B$11,$B$3,$B$4,$B$5,$B$6)`;
  const delta = `${end}-${beg}`;
  sheet.getRange(`C${row}`).formulas = [[isAsset ? `=-(${delta})` : `=${delta}`]];
}
// Net Income (C11), Beginning Cash (C37), Ending Cash NetSuite (C40), FX residual (C34)
// are written explicitly per the formula table — they are not part of the delta loop.
```

### Column layout
```
B: Labels
C: Annual amount  ← single value column; no monthly breakdown
```

### Formula layout

| Row | Label | Formula (col C) |
|-----|-------|----------------|
> ⚠️ **Every formula in this template includes filter arguments `$B$3,$B$4,$B$5,$B$6`.**
> When writing these via Office.js, always verify the generated formula string
> contains all four cell references before `context.sync()`. A missing filter arg
> is the most common cause of formulas that ignore the subsidiary selection.

| 1 | **[brand.companyName] Cash Flow Statement** | title, merged, bold 14pt `brand.titleColor` |
| 2 | **Year Ended December 31, [Year]** | `="Year Ended December 31, "&$B$2` |
| 9 | *(spacer)* | |
| 10 | **OPERATING ACTIVITIES** | bold, no formula |
| 11 | ` Net Income` | `=XAVI.NETINCOME($B$12,$B$10,$B$3,$B$4,$B$5,$B$6)` |
| 12 | *(spacer — height 6pt)* | |
| 13 | ` Adjustments to reconcile net income:` | italic label, no formula |
| 14 | ` (Increase) Decrease in Accounts Receivable` | `=-(XAVI.TYPEBALANCE("AcctRec",,$B$10,$B$3,$B$4,$B$5,$B$6)-XAVI.TYPEBALANCE("AcctRec",,$B$11,$B$3,$B$4,$B$5,$B$6))` |
| 15 | ` (Increase) Decrease in Other Current Assets` | `=-(XAVI.TYPEBALANCE("OthCurrAsset",,$B$10,$B$3,$B$4,$B$5,$B$6)-XAVI.TYPEBALANCE("OthCurrAsset",,$B$11,$B$3,$B$4,$B$5,$B$6))` |
| 16 | ` (Increase) Decrease in Deferred Expenses` | `=-(XAVI.TYPEBALANCE("DeferExpense",,$B$10,$B$3,$B$4,$B$5,$B$6)-XAVI.TYPEBALANCE("DeferExpense",,$B$11,$B$3,$B$4,$B$5,$B$6))` |
| 17 | ` Increase (Decrease) in Accounts Payable` | `=XAVI.TYPEBALANCE("AcctPay",,$B$10,$B$3,$B$4,$B$5,$B$6)-XAVI.TYPEBALANCE("AcctPay",,$B$11,$B$3,$B$4,$B$5,$B$6)` |
| 18 | ` Increase (Decrease) in Credit Cards` | `=XAVI.TYPEBALANCE("CredCard",,$B$10,$B$3,$B$4,$B$5,$B$6)-XAVI.TYPEBALANCE("CredCard",,$B$11,$B$3,$B$4,$B$5,$B$6)` |
| 19 | ` Increase (Decrease) in Deferred Revenue` | `=XAVI.TYPEBALANCE("DeferRevenue",,$B$10,$B$3,$B$4,$B$5,$B$6)-XAVI.TYPEBALANCE("DeferRevenue",,$B$11,$B$3,$B$4,$B$5,$B$6)` |
| 20 | ` Increase (Decrease) in Other Current Liabilities` | `=XAVI.TYPEBALANCE("OthCurrLiab",,$B$10,$B$3,$B$4,$B$5,$B$6)-XAVI.TYPEBALANCE("OthCurrLiab",,$B$11,$B$3,$B$4,$B$5,$B$6)` |
| 21 | **Net Cash from Operating Activities** | `=SUM(C11,C14:C20)` |
| 22 | *(spacer)* | |
| 23 | **INVESTING ACTIVITIES** | bold, no formula |
| 24 | ` (Increase) Decrease in Fixed Assets` | `=-(XAVI.TYPEBALANCE("FixedAsset",,$B$10,$B$3,$B$4,$B$5,$B$6)-XAVI.TYPEBALANCE("FixedAsset",,$B$11,$B$3,$B$4,$B$5,$B$6))` |
| 25 | ` (Increase) Decrease in Other Assets` | `=-(XAVI.TYPEBALANCE("OthAsset",,$B$10,$B$3,$B$4,$B$5,$B$6)-XAVI.TYPEBALANCE("OthAsset",,$B$11,$B$3,$B$4,$B$5,$B$6))` |
| 26 | **Net Cash from Investing Activities** | `=SUM(C24:C25)` |
| 27 | *(spacer)* | |
| 28 | **FINANCING ACTIVITIES** | bold, no formula |
| 29 | ` Increase (Decrease) in Long-Term Liabilities` | `=XAVI.TYPEBALANCE("LongTermLiab",,$B$10,$B$3,$B$4,$B$5,$B$6)-XAVI.TYPEBALANCE("LongTermLiab",,$B$11,$B$3,$B$4,$B$5,$B$6)` |
| 30 | ` Increase (Decrease) in Equity` | `=XAVI.TYPEBALANCE("Equity",,$B$10,$B$3,$B$4,$B$5,$B$6)-XAVI.TYPEBALANCE("Equity",,$B$11,$B$3,$B$4,$B$5,$B$6)` |
| 31 | **Net Cash from Financing Activities** | `=SUM(C29:C30)` |
| 32 | *(spacer)* | |
| 33 | **Net Change Before FX** | `=C21+C26+C31` |
| 34 | ` Effect of Exchange Rate on Cash` | `=(XAVI.TYPEBALANCE("Bank",,$B$10,$B$3,$B$4,$B$5,$B$6)-XAVI.TYPEBALANCE("Bank",,$B$11,$B$3,$B$4,$B$5,$B$6))-C33` |
| 35 | **NET CHANGE IN CASH** | `=C33+C34` |
| 36 | *(spacer — height 6pt)* | |
| 37 | ` Beginning Cash` | `=XAVI.TYPEBALANCE("Bank",,$B$11,$B$3,$B$4,$B$5,$B$6)` |
| 38 | **Ending Cash (Computed)** | `=C35+C37` |
| 39 | *(spacer)* | |
| 40 | **Ending Cash (NetSuite)** | `=XAVI.TYPEBALANCE("Bank",,$B$10,$B$3,$B$4,$B$5,$B$6)` |
| 41 | **Tie-Out Check** | `=C38-C40` ← **must equal 0; format red if non-zero** |

### Formatting flags
- Row 21: bold, top border (Net Cash from Operating)
- Row 26: bold, top border (Net Cash from Investing)
- Row 31: bold, top border (Net Cash from Financing)
- Row 33: bold, top border (Net Change Before FX)
- Row 35: bold, top border (Net Change in Cash)
- Row 38: bold, top border (Ending Cash Computed)
- Row 40: bold (Ending Cash NetSuite — the independent check)
- Row 41: bold, **double bottom border**; conditional format: if `<>0` fill red

### Working-capital sign convention
Assets use a leading minus on the delta — an increase in an asset is a use of cash (negative).
Liabilities and equity use no leading minus — an increase is a source of cash (positive).
XAVI handles internal sign conventions; the leading minus on asset deltas is the only manual
sign logic needed and it is already embedded in the formulas above.

### ⚠️ Equity line: TYPEBALANCE only — do NOT add CTA
The equity financing line (row 30) uses `XAVI.TYPEBALANCE("Equity")` movement only.
**Do not add `XAVI.CTA` to this line.** CTA is already captured inside the equity balance;
adding it would double-count and make the equity line disagree with NetSuite. CTA measures
translation on net assets/equity — it is not a cash movement and must not appear in the
financing section.

### ⚠️ Effect of Exchange Rate on Cash (row 34)
This line is computed as the reconciling residual:
```
= (actual ending Bank balance − beginning Bank balance) − (operating + investing + financing)
```
This approach:
- Keeps the equity line correct (TYPEBALANCE only, no CTA)
- Makes the statement tie to actual cash (tie-out row 41 = 0)
- Shows the FX impact explicitly rather than burying it across working-capital lines

For single-currency entities, this line will be 0. For multi-currency entities it will capture
all FX-on-cash that is not attributable to operating, investing, or financing activity.

### ⚠️ Important: #CALC! during recalculation
Every working-capital line calls TYPEBALANCE twice (beginning and ending balance). All of these
fetch asynchronously. The statement will show `#CALC!` across most rows while NetSuite is
responding — this is normal and expected. Wait for all cells to resolve before reading any
values or diagnosing discrepancies.

### ⚠️ Multi-currency entities: known difference vs NetSuite UI
XAVI.TYPEBALANCE returns reported-currency (translated) balances, so individual operating and
financing lines will differ from NetSuite's functional-currency line items. The net difference
is collected on the Effect of Exchange Rate on Cash line (row 34) and the statement ties to
actual cash. This is the correct behaviour — document it in the Notes block rather than
chasing a false per-line tie to the NetSuite UI.

**Never use `XAVI.CTA` as the FX-on-cash plug.** CTA measures translation on net assets/equity,
which is a different population. The residual formula on row 34 is the correct approach.

### Account-typing notes
- `TYPEBALANCE("AcctRec")` returns **net** AR — contra accounts (e.g., Allowance for Doubtful
  Accounts) typed as AcctRec are netted in. The NetSuite UI may show gross AR with the allowance
  on a separate line; the cash impact is identical.
- `TYPEBALANCE("OthCurrLiab")` includes Sales Tax Payable. If the user wants it broken out,
  they must supply the specific account numbers.
- Keep Deferred Revenue (`"DeferRevenue"`) as its own line (row 19) rather than folding it into
  OthCurrLiab — it is typically the dominant working-capital driver for SaaS companies and
  boards expect to see it separately.


---

