# Module Reference

## `src/index.ts`

**Layer:** Public API
**Purpose:** Barrel — sole entry point exposed via `package.json` `main` / `types`.

### Exports

Re-exports `extractVariables`, `analyzeNestedStructures` from `./variableAnalyzer`, and `extractVariableName` from `./diagnosticMessage`.

### Dependencies

- Internal: `./variableAnalyzer`, `./diagnosticMessage`
- External: none

---

## `src/variableAnalyzer.ts`

**Layer:** Analyzers
**Purpose:** Regex-based extraction of used and set variables from a Jinja2 template string; flat-stack walker for nested control structures.

### Exports

| Name | Signature | Description |
| ------ | ---------- | ------------- |
| `extractVariables` | `(text: string) => { usedVariables: string[]; setVariables: string[] }` | Scans `{{ var }}` (used), `{% set var = %}` and `{% for var in %}` (set). Dotted access is reduced to the root identifier. Both arrays are de-duplicated |
| `analyzeNestedStructures` | `(text: string) => string[]` | Walks `{% for | if | set %}` opens and `{% endfor | endif %}` closes; collects identifiers introduced by `for` and `set`. Returns the flat list (no scope info) |

### Regex Reference

| Regex | Captures |
| ------ | -------- |
| `/\{\{\s*(\w+(?:\.\w+)*)\s*\}\}/g` | Variable usage with optional dotted access |
| `/\{%\s*set\s+(\w+)\s*=/g` | `{% set name = ... %}` |
| `/\{%\s*for\s+(\w+)\s+in\s+/g` | `{% for name in ... %}` |
| `/\{%\s*(for|if|set)\s+(\w+)|\{%\s*end(for|if)/g` | Open/close blocks for nesting walk |

### Dependencies

- None — pure functions

### Known Limitations

- Filters and bracket access inside `{{ }}` are not parsed
- `{% if %}` does not introduce variables; tracked only for stack balance
- No association between a defined variable and the block that introduced it

---

## `src/diagnosticMessage.ts`

**Layer:** Helpers
**Purpose:** Extracts a single-quoted variable name out of a diagnostic message string. Used by code-action providers to recover the variable from a `vscode.Diagnostic.message`.

### Exports

| Name | Signature | Description |
| ------ | ---------- | ------------- |
| `extractVariableName` | `(diagnosticMessage: string) => string \| null` | Returns the first `'…'` quoted token, or `null` if absent |

### Dependencies

- None — pure function
