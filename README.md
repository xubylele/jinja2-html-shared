# @xubylele/jinja2-enhanced-shared

Pure utilities used by the **Jinja2 Enhance** free extension ([`xubylele/jinja2-html-enhancer`](https://github.com/xubylele/jinja2-html-enhancer)).

No `vscode` imports. No I/O. Just regex helpers over template strings.

## Install

```bash
npm install @xubylele/jinja2-enhanced-shared
```

## API

```ts
import {
  // Variable analysis
  extractVariables,
  analyzeNestedStructures,
  findUsedVariables,
  findMissingVariables,
  // Template relations
  scanTemplateRelations,
  extractMacroDefinitions,
  extractBlockDefinitions,
  extractMacroCalls,
  calculateNestingDepth,
  isVariableUsed,
  // Path resolution
  resolveTemplatePath,
  // Rendering
  renderTemplate,
  // Filter docs
  FILTER_DOCS,
  getFilterDoc,
  listFilterNames,
  // Filter/identifier parsing
  filterAtOffset,
  identifierAtOffset,
  // Macro IntelliSense
  formatMacroSignatureLabel,
  formatMacroSnippet,
  parseMacroCallContext,
  isInPrintContext,
  computeActiveParameter,
  // Diagnostics
  extractVariableName,
} from "@xubylele/jinja2-enhanced-shared";
```

### Variable analysis

| Export                                | Purpose                                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| `extractVariables(text)`              | Returns `{ usedVariables, setVariables }` from a Jinja2 template string                       |
| `analyzeNestedStructures(text)`       | Walks `{% for %}` / `{% if %}` / `{% set %}` blocks and returns variables defined inside them |
| `findUsedVariables(text)`             | Returns the top-level variable names referenced in `{{ … }}` expressions                      |
| `findMissingVariables(text, context)` | Returns variable names used in the template but absent from the provided context object       |

### Template relations

| Export                          | Purpose                                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `scanTemplateRelations(text)`   | Parses `{% extends %}`, `{% include %}`, `{% import %}`, `{% macro %}`, `{% block %}` — returns a `TemplateRelations` object |
| `extractMacroDefinitions(text)` | Returns all `{% macro name(params) %}` definitions with parameter metadata                                                   |
| `extractBlockDefinitions(text)` | Returns all `{% block name %}` definitions with offsets                                                                      |
| `extractMacroCalls(text)`       | Returns all macro call sites with argument spans                                                                             |
| `calculateNestingDepth(text)`   | Returns the Jinja2 block nesting depth at the end of `text`                                                                  |
| `isVariableUsed(text, varName)` | Returns `true` if `varName` appears in a `{{ … }}` expression in `text`                                                      |

### Path resolution

| Export                                  | Purpose                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `resolveTemplatePath(rel, from, roots)` | Resolves a relative template path to candidate absolute filesystem paths |

### Rendering

| Export                                   | Purpose                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `renderTemplate(text, context, options)` | Renders a Jinja2 template string via Nunjucks. Returns `{ html, missingVariables, usedVariables }` |

**`RenderOptions`:**

```ts
interface RenderOptions {
  placeholderMode?: "inline" | "badge" | "hidden"; // default: "inline"
  templateRoots?: string[]; // filesystem roots for {% extends %} / {% include %} resolution
}
```

### Filter docs

| Export               | Purpose                                                           |
| -------------------- | ----------------------------------------------------------------- |
| `FILTER_DOCS`        | Record of all built-in Jinja2 filter docs keyed by filter name    |
| `getFilterDoc(name)` | Returns the `FilterDoc` for a filter, or `undefined` if not found |
| `listFilterNames()`  | Returns all documented filter names as a string array             |

### Filter / identifier parsing

| Export                             | Purpose                                                             |
| ---------------------------------- | ------------------------------------------------------------------- |
| `filterAtOffset(text, offset)`     | Returns the filter name at the given character offset, or `null`    |
| `identifierAtOffset(text, offset)` | Returns the identifier (`variable` or `filter`) at the given offset |

### Macro IntelliSense

| Export                                | Purpose                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| `formatMacroSignatureLabel(macro)`    | Builds the VS Code signature label string for a macro definition                      |
| `formatMacroSnippet(macro)`           | Builds a snippet string for macro autocomplete insertion                              |
| `parseMacroCallContext(text, offset)` | Parses the macro call at `offset` and returns active argument index and call metadata |
| `isInPrintContext(text, offset)`      | Returns `true` if `offset` is inside a `{{ … }}` print expression                     |
| `computeActiveParameter(context)`     | Returns the 0-based index of the active parameter given a `MacroCallContext`          |

### Diagnostics

| Export                                   | Purpose                                                              |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `extractVariableName(diagnosticMessage)` | Pulls a `'name'` quoted token out of a JHE diagnostic message string |

## Releasing

This package uses [Changesets](https://github.com/changesets/changesets) for versioning.

```bash
# Create a changeset (run after making changes)
npm run changeset

# Version and publish (maintainers)
# Changesets are consumed and the package is published via GitHub Actions on tag push
git tag v0.4.3
git push origin v0.4.3
```

The package is automatically published to [npmjs.com](https://www.npmjs.com/package/@xubylele/jinja2-enhanced-shared) when a tag is pushed.
