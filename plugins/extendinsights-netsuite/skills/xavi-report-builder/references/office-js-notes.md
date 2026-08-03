# Office.js Notes — Platform Safety & Chart APIs

Read this before writing any chart or platform-specific Office.js code.

## Platform detection — run once, at the top of Phase 1

```javascript
await Excel.run(async (context) => {
  const platform = Office.context.diagnostics.platform;
  const version  = Office.context.diagnostics.version;
  const host     = Office.context.diagnostics.host;
  // platform: "PC", "Mac", "OfficeOnline", "iOS", "Android", "Universal"
  console.log("Platform:", platform, "| Version:", version, "| Host:", host);
  await context.sync();
});
```

Detect **once**, store in a session variable, reuse for all subsequent calls. Never
re-detect on every call — it adds latency. Never ask the user what platform they are on.

## Platform differences relevant to this skill

| API / Feature | Mac (`"Mac"`) | Windows (`"PC"`) | Browser (`"OfficeOnline"`) |
|---|---|---|---|
| `ChartType.lineMarkersSmoothed` | ❌ InvalidArgument | ✅ | varies |
| `charts.add(type, range, seriesBy)` | ❌ InvalidArgument (line) | ✅ | varies |
| `ChartDataLabelPosition.above` on line | ❌ InvalidArgument | ✅ | use `.top` |
| `autoFill` on async custom functions | ❌ crash risk | ❌ crash risk | ❌ crash risk |
| `suspendScreenUpdating` | ✅ | ✅ | limited |

## Apply Mac-safe defaults unconditionally

The Mac-safe path works on all platforms, so always use it rather than branching:
- Always use `ChartType.line` + `series.smooth = true` for line charts (works everywhere)
- For line charts, omit the `seriesBy` argument from `charts.add` (works everywhere)
- Always use `ChartDataLabelPosition.top` for line chart labels (works everywhere)
- Never `autoFill` async XAVI custom-function cells on any platform — write `.formulas`
  directly across the target range instead

**Exception — clustered column charts (Budget vs. Actual):** these DO take an explicit
`Excel.ChartSeriesBy.columns` argument and it is required for correct category/series
mapping. See `templates-budget.md`. The "omit seriesBy" rule applies to LINE charts only.

## Diagnosing InvalidArgument

If an error occurs and platform is `"Mac"`, a chart API is almost always the cause —
check the table above before assuming bad data. Use the detected platform only for
edge-case branches, logging, or diagnosing errors the user reports.

---

## Capability detection — probe before falling back

**Never infer Office.js unavailability from a chart failure, worksheet failure,
formatting error, or gridline operation.** Those are feature-level errors, not
runtime-level errors. Always test the runtime directly with the probe below.

### Capability object

Define this at session start, before Phase 1. All features read from it.

```javascript
const capabilities = {
  officeJsAvailable:     false,   // Office global exists + onReady() succeeded + host is Excel
  excelRunAvailable:     false,   // Excel.run() + context.sync() completed without error
  worksheetApiAvailable: false,   // worksheets collection is readable
  chartApiAvailable:     false,   // sheet.charts collection is accessible
  gridlineControlAvailable: false,// sheet.showGridlines property is readable/writable
  fallbackReason:        null     // set only when a probe fails; describes the exact failure
};
```

### Execution report object

Define alongside the capability object. Updated throughout the build; printed at the end.

```javascript
const executionReport = {
  mode:                 null,   // 'office-js' or 'fallback' — set after detectCapabilities()
  capabilitiesDetected: {},     // shallow copy of capabilities after probing
  featuresCompleted:    [],     // names of features that ran successfully
  featuresSkipped:      [],     // names of features that were skipped due to unavailability
  errorsEncountered:    []      // "featureName: error.message" strings
};
```

### probeOfficeJs() — single probe attempt

Returns `true` if the runtime is available and the host is Excel. On any failure, sets
`capabilities.fallbackReason` with the exact reason string and returns `false`.

```javascript
async function probeOfficeJs() {
  // Step 1 — Office global must exist
  if (typeof Office === 'undefined') {
    capabilities.fallbackReason = 'Office is undefined';
    return false;
  }

  // Step 2 — Office.onReady() must resolve within 5 seconds
  let readyInfo;
  try {
    readyInfo = await Promise.race([
      Office.onReady(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Office.onReady timed out')), 5000)
      )
    ]);
  } catch (err) {
    capabilities.fallbackReason = err.message;  // e.g. 'Office.onReady timed out'
    return false;
  }

  // Step 3 — Host must be Excel
  if (readyInfo.host !== Office.HostType.Excel) {
    capabilities.fallbackReason =
      `Host is not Excel (host: ${readyInfo.host ?? 'undefined'})`;
    return false;
  }

  capabilities.officeJsAvailable = true;

  // Step 4 — Minimal Excel.run + context.sync
  try {
    await Excel.run(async (context) => {
      context.workbook.load('name');
      await context.sync();
    });
  } catch (err) {
    capabilities.fallbackReason = `Excel.run failed: ${err.message}`;
    capabilities.officeJsAvailable = false;   // roll back; run failed
    return false;
  }

  capabilities.excelRunAvailable = true;
  return true;
}
```

### detectCapabilities() — probe with one retry, then check individual features

Call this **once**, at the very top of Phase 1, before writing any cells.

```javascript
async function detectCapabilities() {
  // --- First probe attempt ---
  const firstAttempt = await probeOfficeJs();

  if (!firstAttempt) {
    const firstReason = capabilities.fallbackReason;

    // --- Retry after 2.5 s (handles transient init delays) ---
    await new Promise(res => setTimeout(res, 2500));

    // Reset flags for a clean second attempt
    capabilities.officeJsAvailable  = false;
    capabilities.excelRunAvailable  = false;
    capabilities.fallbackReason     = null;

    const secondAttempt = await probeOfficeJs();

    if (!secondAttempt) {
      // Both probes failed — keep whichever reason was set last, fall back to first
      capabilities.fallbackReason =
        capabilities.fallbackReason || firstReason;
      // All feature flags remain false; caller uses fallback path
      return;
    }
  }

  // Probe succeeded — check individual feature availability independently.
  // A failure here does NOT roll back excelRunAvailable.
  // Each check is non-destructive (read-only load + sync).

  // Worksheet API
  try {
    await Excel.run(async (context) => {
      context.workbook.worksheets.load('items/name');
      await context.sync();
    });
    capabilities.worksheetApiAvailable = true;
  } catch (err) {
    console.warn('[capability probe] Worksheet API unavailable:', err.message);
  }

  // Chart API
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      sheet.charts.load('count');
      await context.sync();
    });
    capabilities.chartApiAvailable = true;
  } catch (err) {
    console.warn('[capability probe] Chart API unavailable:', err.message);
  }

  // Gridline control
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      sheet.load('showGridlines');
      await context.sync();
    });
    capabilities.gridlineControlAvailable = true;
  } catch (err) {
    console.warn('[capability probe] Gridline control unavailable:', err.message);
  }
}
```

### tryFeature() — per-feature independent execution

Wrap every advanced feature call in `tryFeature()` so a chart failure does not prevent
worksheet creation, formatting, gridline changes, or formulas from running.

```javascript
async function tryFeature(featureName, fn) {
  try {
    await fn();
    executionReport.featuresCompleted.push(featureName);
  } catch (err) {
    executionReport.featuresSkipped.push(featureName);
    executionReport.errorsEncountered.push(`${featureName}: ${err.message}`);
    console.warn(`[feature skipped] "${featureName}":`, err.message);
  }
}
```

**Usage pattern — each feature runs independently:**

```javascript
// Phase 1 — structure
await tryFeature('gridlines-off', async () => {
  await Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    sheet.showGridlines = false;
    await context.sync();
  });
});

await tryFeature('write-structure', async () => {
  await Excel.run(async (context) => {
    // ... filter block, headers, row labels, number formats, borders ...
    await context.sync();
  });
});

// Phase 4 — chart (independent; does not gate the rest)
if (capabilities.chartApiAvailable) {
  await tryFeature('revenue-chart', async () => {
    await Excel.run(async (context) => {
      // ... charts.add, series config, axis config ...
      await context.sync();
    });
  });
}

// Phase 4 — README tab (independent)
if (capabilities.worksheetApiAvailable) {
  await tryFeature('readme-worksheet', async () => {
    await Excel.run(async (context) => {
      // ... worksheets.add("README"), content, formatting ...
      await context.sync();
    });
  });
} else {
  await tryFeature('readme-inline', async () => {
    // Write README content inline below the report as a fallback
  });
}
```

### Feature guard table

Use `capabilities.*` to gate features before attempting them. The two-probe fallback
means these flags are trustworthy — they were not set from a single transient error.

| Feature | Guard condition | Fallback if unavailable |
|---------|----------------|------------------------|
| Worksheet creation (README tab, new sheets) | `capabilities.worksheetApiAvailable` | Write README inline below the report |
| Charts | `capabilities.chartApiAvailable` | Leave totals row; tell user to chart manually |
| Gridline visibility | `capabilities.gridlineControlAvailable` | Skip `showGridlines = false`; report it |
| Freeze panes | `capabilities.excelRunAvailable` | Skip; mention in report |
| Tables (`sheet.tables.add`) | `capabilities.worksheetApiAvailable` | Use plain formatting only |
| Formatting + borders | `capabilities.excelRunAvailable` | Skip; formulas and data still land |
| Column autofit | `capabilities.excelRunAvailable` | Skip; preset widths from Phase 1 apply |
| Named ranges | `capabilities.excelRunAvailable` | Omit; use cell references throughout |

---

## Graceful degradation — per-feature fallback

### Calling sequence at the top of Phase 1

```javascript
await detectCapabilities();

executionReport.mode = capabilities.excelRunAvailable ? 'office-js' : 'fallback';
executionReport.capabilitiesDetected = { ...capabilities };

if (!capabilities.excelRunAvailable) {
  // Tell the user ONCE — only after both probes actually failed
  console.log(
    `⚠️ Fallback mode active — reason: ${capabilities.fallbackReason}. ` +
    `Building report with direct cell writes. Worksheet creation, charts, ` +
    `gridlines, and advanced formatting will be skipped.`
  );
  // Proceed with direct cell writes for formulas and data.
  // Do NOT exit. Build as much as possible.
}
```

**Do not tell the user "this session can't run the chart/worksheet APIs" unless
`capabilities.excelRunAvailable` is `false` after both probes.** A chart
`InvalidArgument` error, a single `Excel.run` timeout, or a gridline write failure
during a build is **not** evidence that Office.js is unavailable — these are
feature-level errors, handled by `tryFeature()`, not a reason to enter fallback mode.

### Fallback mode behaviour

When `capabilities.excelRunAvailable === false` after both probes:

- **Formulas and data**: Build all formulas and data tables via direct cell writes —
  these do not require `Excel.run` and are not affected.
- **README**: Write inline below the last report row instead of on a separate tab.
- **Charts**: Skip entirely. Leave the totals row in place and note it in the report.
- **Gridlines**: Cannot be hidden. Note it in the report.
- **Formatting**: Skip Excel-side formatting (borders, bold, colors). Formulas are unaffected.

### Execution report — print at the end of every build

Call `buildExecutionReport()` after all phases complete and present the result to the
user as the final message of the session.

```javascript
function buildExecutionReport() {
  const modeLabel =
    executionReport.mode === 'office-js'
      ? '✅ Office.js mode'
      : `⚠️ Fallback mode (${capabilities.fallbackReason})`;

  const completedLine = executionReport.featuresCompleted.length
    ? `Features completed: ${executionReport.featuresCompleted.join(', ')}`
    : 'Features completed: (none)';

  const skippedLine = executionReport.featuresSkipped.length
    ? `Features skipped:   ${executionReport.featuresSkipped.join(', ')}`
    : '';

  const errorLine = executionReport.errorsEncountered.length
    ? `Errors encountered:\n  - ${executionReport.errorsEncountered.join('\n  - ')}`
    : '';

  const capLine = [
    `  officeJs:     ${capabilities.officeJsAvailable}`,
    `  excelRun:     ${capabilities.excelRunAvailable}`,
    `  worksheetApi: ${capabilities.worksheetApiAvailable}`,
    `  chartApi:     ${capabilities.chartApiAvailable}`,
    `  gridlines:    ${capabilities.gridlineControlAvailable}`,
  ].join('\n');

  return [
    `=== Build Report ===`,
    `Mode: ${modeLabel}`,
    `Capabilities detected:\n${capLine}`,
    completedLine,
    skippedLine,
    errorLine,
  ].filter(Boolean).join('\n');
}
```

Present the output of `buildExecutionReport()` to the user in a task-pane message after
all phases are complete. Always show it — in Office.js mode it confirms what ran; in
fallback mode it explains exactly what was skipped and why.

### What NOT to do

- ❌ Do not enter fallback mode after a single `Excel.run` throw — retry first.
- ❌ Do not enter fallback mode because a chart operation returned `InvalidArgument` —
  that is a Mac platform issue, not an Office.js availability issue. See the platform
  differences table above.
- ❌ Do not skip worksheet creation, charts, or gridlines based on an earlier failure
  in the same session unless `capabilities.*` explicitly says the API is unavailable.
- ❌ Do not narrate recovery steps or probe attempts to the user. Run the probe silently.
  The only user-facing message is the final `buildExecutionReport()` output.
