# @xubylele/jinja2-enhanced-shared

Pure utilities shared between the **Jinja2 Enhance** free extension ([`xubylele/jinja2-html-enhancer`](https://github.com/xubylele/jinja2-html-enhancer)) and its Pro counterpart.

No `vscode` imports. No I/O. Just regex helpers over template strings.

## Install

```bash
npm install @xubylele/jinja2-enhanced-shared
```

## API

```ts
import {
  extractVariables,
  analyzeNestedStructures,
  extractVariableName,
  scanTemplateRelations,
  resolveTemplatePath,
  renderTemplate,
} from '@xubylele/jinja2-enhanced-shared';
```

| Export | Purpose |
| ------ | ------- |
| `extractVariables(text)` | Returns `{ usedVariables, setVariables }` from a Jinja2 template string |
| `analyzeNestedStructures(text)` | Walks `{% for %}` / `{% if %}` / `{% set %}` blocks and returns variables defined inside them |
| `extractVariableName(diagnosticMessage)` | Pulls a `'name'` quoted token out of a diagnostic message string |
| `scanTemplateRelations(text)` | Parses `{% extends %}`, `{% include %}`, `{% import %}`, `{% macro %}`, `{% block %}` |
| `resolveTemplatePath(rel, from, roots)` | Resolves a template path to candidate absolute paths |
| `renderTemplate(content, context)` | Renders a Jinja2 template string with nunjucks |
| `findMissingVariables(content, context)` | Finds variables used in template but missing from context |

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
