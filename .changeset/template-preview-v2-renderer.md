---
"@xubylele/jinja2-enhanced-shared": minor
---

New: `findUsedVariables` helper and `placeholderMode` option on `renderTemplate` (`inline` / `badge` / `hidden`). `RenderResult` now also returns `usedVariables`, and missing-variable spans carry `data-var` + `data-mode` for richer webview rendering. Fully backward-compatible with the legacy `highlightMissing` flag.
