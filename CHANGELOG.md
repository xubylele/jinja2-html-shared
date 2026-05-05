# jinja2-enhanced-shared

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
