# Architecture

`jinja2-enhanced-shared` is a pure-TypeScript utility package. It owns the **language-level analyzers** (regex extraction, scope walking, message parsing) that both the free and Pro extensions need to agree on.

The architectural goal is simple: the same Jinja2 input must produce the same `usedVariables` / `setVariables` answer in every consumer. So the analyzers live here, behind a stable API, with no environment-specific imports.

## Package Lifecycle

- **No runtime activation.** This is a library; consumers `import` from `jinja2-enhanced-shared`
- **Build trigger**: `prepare` (npm lifecycle) — runs on `npm install` for git consumers
  - `npm run clean` removes `dist/`
  - `npm run build` runs `tsc` per `tsconfig.json` → emits JS, `.d.ts`, source maps, declaration maps
- **Distribution**: only `dist/` is published (`files: ["dist"]`). `src/` is not shipped
- **Versioning**: git tags (`v0.1.0`, `v0.1.1`, …). Consumers pin via `#vX.Y.Z` in their `package.json` git URL

## Layer Map

| Layer      | Files                      | Responsibility                                                                           |
| ---------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| Public API | `src/index.ts`             | Barrel — re-exports `extractVariables`, `analyzeNestedStructures`, `extractVariableName` |
| Analyzers  | `src/variableAnalyzer.ts`  | Regex extraction of used/set variables; nested structure walker                          |
| Helpers    | `src/diagnosticMessage.ts` | Pure string parser for diagnostic messages                                               |

## Data Flow

```makefile
Consumer (free or Pro extension)
  └─ imports { extractVariables, ... } from 'jinja2-enhanced-shared'
       └─ passes a raw template string (the document text)
            └─ extractVariables(text)
                 └─ runs 3 regex passes ({{ }}, {% set %}, {% for %})
                 └─ returns { usedVariables, setVariables } as plain string[]
            └─ analyzeNestedStructures(text)
                 └─ scans {% for | if | set %} / {% endfor | endif %} pairs
                 └─ returns string[] of variables defined inside any block
            └─ extractVariableName(message)
                 └─ regex /'([^']+)'/ → first quoted token or null
```

No state crosses calls. Every export is a pure function `string → value`.

## Boundaries

| Allowed in this package            | Forbidden                                                |
| ---------------------------------- | -------------------------------------------------------- |
| String inputs, plain return values | `vscode` API (would break Pro consumer's bundle)         |
| Pure regex / string ops            | File I/O, network, child processes                       |
| `Set`, `Map`, regex, `matchAll`    | Runtime npm dependencies — keep `dependencies: {}` empty |
| Adding new exports                 | Changing existing export signatures (versioning instead) |

## Why This Package Exists

1. **Single source of truth.** A regex tweak here lands in both extensions on next bump. No drift.
2. **Pro can extend it.** Pro adds backend intelligence, cross-file resolution, etc. — but reuses the primitive analyzers from here.
3. **Testable in isolation.** Pure functions; no vscode mock, no fixtures with extension hosts.
4. **Free extension stays MIT.** This package is intentionally minimal. Larger logic that gates Pro features lives in the Pro repo, not here.

## Known Constraints / Tech Debt

1. **`extractVariables` only handles dotted access at the root** (`user.name` → `user`). Computed access (`items[0]`) and filters inside `{{ }}` are not parsed
2. **`analyzeNestedStructures` uses a flat stack** — does not associate a defined variable with its enclosing block. Callers cannot ask "which variables are defined in this `for`?"
3. **No `{% block %}` / `{% extends %}` awareness** — cross-file template inheritance is intentionally a Pro concern (see pro repo)
4. **No tests in this package yet.** Tests currently live in the consumer (`jinja2-html-enhancer/test/`) — should be moved here so the package can be validated independently
