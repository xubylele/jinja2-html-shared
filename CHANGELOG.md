# jinja2-enhanced-shared

## 0.5.0

### Minor Changes

- 29d189e: Add `FILTER_DOCS`, `getFilterDoc`, `listFilterNames` for the 51 built-in Jinja2 filters (signature + i18n description key + example), plus pure parsers `filterAtOffset` / `identifierAtOffset` for locating filter identifiers in template text. Consumed by the Filter Docs on Hover feature now graduating from Pro to Free.
- 3f8cba8: Add pure macro IntelliSense helpers (`formatMacroSignatureLabel`, `formatMacroSnippet`, `parseMacroCallContext`, `isInPrintContext`, `computeActiveParameter`) shared by the free single-file macro IntelliSense and Pro's cross-file provider.
- fcf71cf: New: `findUsedVariables` helper and `placeholderMode` option on `renderTemplate` (`inline` / `badge` / `hidden`). `RenderResult` now also returns `usedVariables`, and missing-variable spans carry `data-var` + `data-mode` for richer webview rendering. Fully backward-compatible with the legacy `highlightMissing` flag.

### Patch Changes

- acf48f4: Migrated from npm to pnpm@11.0.8 across the whole workspace for improved supply-chain security. npm's dependency-resolution model has been a recurring attack vector — most recently demonstrated by the [TanStack npm supply-chain compromise](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem) (May 2026), where malicious lifecycle scripts smuggled via npm install harvested credentials and self-propagated across 42 packages. pnpm's strict content-addressable store, symlinked node_modules, and build-scripts-blocked-by-default (`ERR_PNPM_IGNORED_BUILDS`) provide stronger guarantees against this class of attack.

  All npm scripts, CI workflows, and changeset-version hooks updated accordingly. No functional changes.

## 0.4.3

### Patch Changes

- 49c916c: Remove pro-only backendScanner module (moved to pro extension). Migrate from GitHub Packages to public npmjs.com. Update CI workflow with OIDC Trusted Publisher. Update README and AGENTS.md for public npm package. Add publish workflow for automated npm publishing on tag push.

## 0.4.2

### Patch Changes

- d917eff: Remove pro-only backendScanner module from shared package. The backend scanning logic (scanBackendOccurrences, identifierAtOffset, filterAtOffset, normalizeTemplateKey) is now moved to the pro extension's local src/intelligence/ directory. Shared package now only contains utilities used by both free and pro extensions.

## 0.4.1

### Patch Changes

- Fix template renderer: add `now()` helper support, fix `{% set %}` tag processing, and improve error handling in `renderTemplate()`.

## 0.4.0

### Minor Changes

- Add template renderer engine using Nunjucks with Jinja2 compatibility mode. Includes renderTemplate() and findMissingVariables() functions for rendering Jinja2 templates and detecting missing variables.

## 0.3.2

### Patch Changes

- d1ffea9: Add pure parsers for advanced linting rules: extractBlockDefinitions, extractMacroCalls, calculateNestingDepth, isVariableUsed

## 0.3.1

### Patch Changes

- 0d62364: Add `filterAtOffset()` utility function to detect if an identifier at a given offset is a Jinja2 filter name (preceded by `|` pipe character). This reuses the existing `identifierAtOffset()` function and checks for `|` in the same expression. This utility will be used by the Pro extension's upcoming "Filter Docs on Hover" feature to provide hover documentation for Jinja2 built-in filters.

## 0.3.0

### Minor Changes

- ✨ Add template-relation analyzers for Cross-File Variable Tracking
  - `scanTemplateRelations(text)` — extracts `{% extends %}`, `{% include %}`, `{% import … as … %}`, and `{% from … import … %}` occurrences with offsets.
  - `extractMacroDefinitions(text)` — extracts `{% macro name(params) %}` definitions; also feeds the upcoming Macro IntelliSense feature.
  - `resolveTemplatePath(rel, fromAbs, roots)` — pure path resolution returning candidate absolute paths in priority order (no I/O).
  - New types: `TemplateRelations`, `TemplatePathOccurrence`, `TemplateImportOccurrence`, `TemplateImportKind`, `TemplateImportName`, `MacroDefinition`, `MacroParam`.

  🧪 First test suite in the package — covers the new analyzers and `resolveTemplatePath` edge cases (Windows paths, trailing slashes, dedupe, empty inputs). Closes the "no tests yet" gap noted in `docs/architecture.md`.

## 0.2.0

### Minor Changes

- 565de43: Backend-aware analyzer foundation + automated versioning workflow.

  **New exports** (`src/backendScanner.ts` → `src/index.ts`):
  - `scanBackendOccurrences(text, lang)` — pure scan that returns every backend-side variable occurrence (name + offset + length) keyed by normalized template path. Recognizes Flask `render_template`, Django `render`, FastAPI `TemplateResponse`, Jinja2 standalone `env.get_template(...).render(...)`, Express / Nunjucks `.render('...', { ... })`. Replaces what was previously a names-only scan inside the Pro extension.
  - `identifierAtOffset(text, offset)` — returns the identifier under a given offset inside a `{{ … }}` / `{% … %}` expression (returns `null` outside). Used by Pro's hover, code-action, and definition providers to resolve the variable under the cursor.
  - `normalizeTemplateKey(raw)` — exported so consumers can match template paths against the index using the same canonicalization the scanner uses.
  - New types: `BackendLang` (`'py' | 'js'`), `BackendVarOccurrence` (`{ name, offset, length }`).

  **Tooling**
  - Adopt [Changesets](https://github.com/changesets/changesets) for versioning, matching the free and Pro repos. `npm run changeset` records a change; `npm run version` consumes pending changesets and bumps `package.json` + writes `CHANGELOG.md`. `npm run changeset:check` fails when a PR has no pending changeset.
  - `CLAUDE.md` Releasing section rewritten to document the new flow.

  **Internal**
  - Adds the `.claude/skills/jinja2-enhance-shared.skill` Claude skill bundle used by the maintainer's tooling. No runtime impact.
