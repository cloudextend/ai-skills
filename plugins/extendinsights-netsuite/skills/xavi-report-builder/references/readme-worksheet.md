# README Worksheet — Build Spec


After every report build, create or update a worksheet named **"README"**.

**If README does not exist:** create it.
**If it already exists** (user built a previous report): append a new section at the bottom separated by a divider row — never overwrite existing content.

### README content per report section

**1. Report header**
- Report name and date built
- Which sheet the report lives on
- Filter cells: Year in B2, Subsidiary in B3, Department in B4, Location in B5, Class in B6

**2. Formulas used — table, one row per formula type actually used**

| Formula | What it does | Parameters |
|---------|-------------|------------|
| `XAVI.TYPEBALANCE(type, from, to, sub, dept, loc, class)` | Totals all GL accounts of a given NetSuite account type. No account numbers needed — works universally. BS types omit fromPeriod. | type: "Income" "COGS" "Expense" "OthExpense" "OthIncome" "Bank" "AcctRec" "Equity" etc. |
| `XAVI.NETINCOME(from, to, sub, dept, loc, class)` | NetSuite's dynamic net income calculation. Not a GL account — both from and to required. | fromPeriod, toPeriod required |
| `XAVI.RETAINEDEARNINGS(asOf, sub, ...)` | Cumulative RE as of a period. Matches NetSuite's UI — not the GL RE account balance. | asOfPeriod only |
| `XAVI.BALANCE(acct, from, to, sub, ...)` | Balance of a specific account or wildcard. Reference the account cell ($A11) not a literal. | acct = cell ref or wildcard like "4*" |
| `XAVI.BUDGET(acct, period, period, sub, ..., budgetCategory)` | Budget amount for a single period. **Known bug: date ranges do not work** — pass the same single period cell reference for both args (e.g., `C$9` the month-header cell). Never use `DATE(...)` or `TEXT(...)` directly inside XAVI — Refresh All will skip it. Sum single-month calls (each referencing a header cell) for quarter/year totals. | Both period args identical cell refs. Never inline DATE(). Sum header cells for Q/FY. |
| `XAVI.CTA(asOf, sub, ...)` | Cumulative Translation Adjustment for multi-currency. Equity section only. | asOfPeriod |

Only include rows for formulas actually used. Add report-specific notes (e.g. for Cash Flow: indirect method, FX residual line; for Balance Sheet: RE exclusion pattern).

---

### Balance Sheet notes block (Balance Sheet reports only)

When the report is a **Balance Sheet**, write a notes block **between the report header and the
formula table** — before section 2, not after. This placement ensures any reviewer who opens
README sees the limitations first, before the formula reference. Use a thick top border on the
section heading to make it visually stand out from the rest of the README content.

**Heading row** — bold, 12pt, `#09235C`, thick top border (`mediumDashDot` or `medium`):
> `Notes and Limitations — Cash Flow Statement Methodology`

**Four subsections** — bold lead phrase on its own row (`#09235C`), body text on the next row
(`wrapText = true`, normal weight, 11pt):

| Heading | Body |
|---------|------|
| `Basis of preparation.` | This cash flow statement is prepared using the indirect method. Operating, investing, and financing activity lines are derived from the change in consolidated period-end account balances between the opening and closing periods, translated into the reporting currency using BUILTIN.CONSOLIDATE at closing exchange rates. |
| `Investing activity line differences vs. NetSuite UI.` | The NetSuite native cash flow report translates each transaction at the exchange rate in effect on the transaction date. The balance-delta method used here translates period-end snapshots at the closing rate. For non-monetary assets (fixed assets, long-term assets, right-of-use assets), which carry large balances that turn over infrequently, this difference can be material on a per-line basis. |
| `This is not an error.` | The per-line differences represent the foreign currency translation adjustment on non-monetary asset balances — the same amount that would appear in other comprehensive income under ASC 830. These amounts are captured in aggregate on the Effect of Exchange Rate on Cash line. Total net change in cash and ending cash balance tie exactly to NetSuite. |
| `Single-currency entities.` | For subsidiaries that transact solely in their functional currency, all investing lines will agree exactly to the NetSuite UI. Differences only arise where foreign-currency activity has been posted to fixed asset or long-term asset accounts. |

**Office.js write pattern** (insert into the README build after the report header rows, before the
formula table rows — adjust `startRow` to reflect rows already written by the header block):

```javascript
// Balance Sheet notes block — written after report header, before formula table
// notesStart = startRow offset after the report header rows have been written
const notesStart = startRow + headerRowsWritten;

// Section heading — bold, thick top border
const heading = readme.getRange(`A${notesStart}`);
heading.values = [['Notes and Limitations \u2014 Cash Flow Statement Methodology']];
heading.format.font.bold = true;
heading.format.font.size = 12;
heading.format.font.color = '#09235C';
heading.format.borders.getItem('EdgeTop').style = 'Medium';
heading.format.borders.getItem('EdgeTop').color = '#09235C';

// Helper to write one bold-lead + body pair
function writeNoteSection(sheet, row, lead, body) {
  const leadCell = sheet.getRange(`A${row}`);
  leadCell.values = [[lead]];
  leadCell.format.font.bold = true;
  leadCell.format.font.color = '#09235C';
  const bodyCell = sheet.getRange(`A${row + 1}`);
  bodyCell.values = [[body]];
  bodyCell.format.wrapText = true;
}

writeNoteSection(readme, notesStart + 2,
  'Basis of preparation.',
  'This cash flow statement is prepared using the indirect method. Operating, investing, ' +
  'and financing activity lines are derived from the change in consolidated period-end ' +
  'account balances between the opening and closing periods, translated into the reporting ' +
  'currency using BUILTIN.CONSOLIDATE at closing exchange rates.'
);
writeNoteSection(readme, notesStart + 5,
  'Investing activity line differences vs. NetSuite UI.',
  'The NetSuite native cash flow report translates each transaction at the exchange rate ' +
  'in effect on the transaction date. The balance-delta method used here translates ' +
  'period-end snapshots at the closing rate. For non-monetary assets (fixed assets, ' +
  'long-term assets, right-of-use assets), which carry large balances that turn over ' +
  'infrequently, this difference can be material on a per-line basis.'
);
writeNoteSection(readme, notesStart + 8,
  'This is not an error.',
  'The per-line differences represent the foreign currency translation adjustment on ' +
  'non-monetary asset balances \u2014 the same amount that would appear in other comprehensive ' +
  'income under ASC 830. These amounts are captured in aggregate on the Effect of Exchange ' +
  'Rate on Cash line. Total net change in cash and ending cash balance tie exactly to NetSuite.'
);
writeNoteSection(readme, notesStart + 11,
  'Single-currency entities.',
  'For subsidiaries that transact solely in their functional currency, all investing lines ' +
  'will agree exactly to the NetSuite UI. Differences only arise where foreign-currency ' +
  'activity has been posted to fixed asset or long-term asset accounts.'
);

// Blank spacer before the formula table
// startRow for formula table = notesStart + 14
```

After writing the notes block, continue with section 2 (formula table), section 3, and section 4
at `notesStart + 14` onward. The notes column uses the same wide autofit as the rest of README.

---

**3. How to update the report**
- Change B2 to update the year — every formula and header refreshes automatically
- Use the XAVI task pane filter selector on B3–B6 to filter by subsidiary, department, location, or class
- All XAVI formulas recalculate on Refresh in the XAVI task pane

**4. Tips for extending**
- Add a row: insert a row, write `=XAVI.BALANCE($A{row}, ...)` with an account number in col A
- Add Budget vs. Actual: use `=XAVI.BUDGET(...)` with same parameters as XAVI.BALANCE
- Compare two years: duplicate formula columns and point to a second year cell

### README formatting
- Tab color: light blue (`#BDD7EE`)
- No gridlines (`sheet.showGridlines = false`)
- Section headers: bold, 12pt, `brand.titleColor` (fallback `#004FB6`)
- Table headers: bold, bottom border; body: 11pt normal weight
- Autofit columns when done

### Office.js pattern

The README create-or-append logic must handle a brand-new empty sheet safely.
`getUsedRange()` THROWS on an empty sheet — never call it without a guard. Use
`getUsedRangeOrNullObject()` which returns a null object instead of throwing.

```javascript
await Excel.run(async (context) => {
  const sheets = context.workbook.worksheets;

  // Step 1: check if README exists (getItemOrNullObject never throws)
  let readme = sheets.getItemOrNullObject("README");
  readme.load("isNullObject");
  await context.sync();

  let startRow = 1;
  let isNew = false;

  if (readme.isNullObject) {
    // Create it
    readme = sheets.add("README");
    readme.tabColor = "#BDD7EE";
    isNew = true;
    startRow = 1;
  } else {
    // Exists — find last used row safely
    const used = readme.getUsedRangeOrNullObject();
    used.load("rowCount, isNullObject");
    await context.sync();
    startRow = used.isNullObject ? 1 : used.rowCount + 2;
    if (startRow > 1) {
      readme.getRange(`A${startRow}`).values = [["────────────────────────────────"]];
      startRow += 1;
    }
  }

  // CRITICAL: showGridlines must be set on every write to README, new or existing
  readme.showGridlines = false;

  // Write section content starting at startRow (bulk writes)
  // ... title, formula table, update tips, extend tips ...

  await context.sync();

  // Autofit AFTER content is written and synced — never on an empty sheet
  const finalUsed = readme.getUsedRangeOrNullObject();
  finalUsed.load("isNullObject");
  await context.sync();
  if (!finalUsed.isNullObject) {
    finalUsed.format.autofitColumns();
    await context.sync();
  }
});
```

Key points that prevent the "README could not be created" error:
- `getItemOrNullObject` + `load("isNullObject")` — never throws if sheet is absent
- `getUsedRangeOrNullObject` — never throws on an empty sheet
- `showGridlines = false` set explicitly whether the sheet is new or existing
- autofit only runs after content exists and is synced

---

