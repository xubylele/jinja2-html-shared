# What This Is

Pure utility package — regex helpers over Jinja2 template strings — consumed by the **Jinja2 Enhance** free extension and its **Pro** counterpart. Distributed over git+ssh; not on npm.

> ⚠️ **Private code.** This repository is the canonical home for logic shared between the free and Pro extensions. Source for new shared analyzers lands here first; the free extension consumes this package as a dependency.

## Stack

- Language: TypeScript 6.0 (strict: true, target ES2022, module Node16)
- Runtime: pure JS — no `vscode`, no Node `fs`/`path`, no I/O
- Build: `tsc` → `dist/` (declarations + source maps)
- Lifecycle: `prepare` script runs `clean && build` on install — git consumers get compiled output automatically

## Layer Model

| Layer | Files | Rule |
| ------- | ------- | ------ |
| Public API | `src/index.ts` | Barrel exports only — no logic |
| Analyzers | `src/variableAnalyzer.ts` | Pure regex extraction over template strings |
| Helpers | `src/diagnosticMessage.ts` | Pure string parsers |

## Non-Negotiables

- **No `vscode` import anywhere.** This package is pulled into the Pro extension build too — a vscode import would break it
- **No I/O.** No `fs`, no `path`, no network, no async file work. Inputs are strings; outputs are plain values
- **No new runtime deps.** Keep the install graph empty so the `prepare` build cannot fail in a consumer's `node_modules`
- **Backwards-compatible API.** The free extension and Pro extension can be on different shared versions — never break an existing export signature; add new exports instead

## Public Exports

| Export | Purpose |
| ------ | ------- |
| `extractVariables(text)` | Returns `{ usedVariables, setVariables }` from a Jinja2 template string |
| `analyzeNestedStructures(text)` | Walks `{% for %}` / `{% if %}` / `{% set %}` blocks and returns variables defined inside |
| `extractVariableName(diagnosticMessage)` | Pulls a `'name'` quoted token out of a diagnostic message string |

## Releasing

Versioning is automated via [Changesets](https://github.com/changesets/changesets) — same flow as the free and Pro repos.

```bash
# 1. While developing, record the change
npm run changeset           # interactive: pick bump (patch/minor/major) + summary
                            # writes .changeset/<random>.md (commit it)

# 2. When ready to cut a release
npm run version             # consumes pending changesets → bumps package.json + CHANGELOG.md
git commit -am "🔧 release"
git tag v$(node -p "require('./package.json').version") && git push --tags
```

`npm run changeset:check` fails CI when a PR has no pending changeset.

Consumers update via `npm install git+ssh://git@github.com/xubylele/jinja2-html-shared.git#v<new-tag>`.

## Commit Convention

- ✨ feature | 🐛 fix | ♻️ refactor | 🧪 tests | 📝 docs | 🔧 config
