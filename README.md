# jinja2-enhanced-shared

Pure utilities shared between the **Jinja2 Enhance** free extension ([`xubylele/jinja2-html-enhancer`](https://github.com/xubylele/jinja2-html-enhancer)) and its Pro counterpart.

No `vscode` imports. No I/O. Just regex helpers over template strings.

## Install

This package is consumed directly from git over SSH — it's not on npm:

```bash
npm install git+ssh://git@github.com/xubylele/jinja2-html-shared.git#v0.1.0
```

The `prepare` lifecycle script compiles TypeScript to `dist/` automatically on install.

## API

```ts
import {
  extractVariables,
  analyzeNestedStructures,
  extractVariableName,
} from 'jinja2-enhanced-shared';
```

| Export | Purpose |
| ------ | ------- |
| `extractVariables(text)` | Returns `{ usedVariables, setVariables }` from a Jinja2 template string |
| `analyzeNestedStructures(text)` | Walks `{% for %}` / `{% if %}` / `{% set %}` blocks and returns variables defined inside them |
| `extractVariableName(diagnosticMessage)` | Pulls a `'name'` quoted token out of a diagnostic message string |

## Releasing a new version

```bash
# bump version in package.json, then
git tag v0.1.1 && git push --tags
```

Consumers update via `npm install git+ssh://...#v0.1.1`.
