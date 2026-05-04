# AGENTS.md

## Commands

- `npm run build` — Compile TypeScript to `dist/` via `tsc`
- `npm test` — Run tests with `jest --runInBand` (serial execution required)
- `npm run test:ci` — CI test runner with `--ci` flag
- No lint or typecheck commands — build fails fast on type errors

## Publishing

- Published to GitHub Packages (`npm.pkg.github.com`), not npmjs.com
- Requires `NODE_AUTH_TOKEN` env var (see `.npmrc`)
- Consumers install via git SSH URL with tag: `git+ssh://git@github.com/xubylele/jinja2-html-shared.git#v0.1.0`
- Versioning via changesets: `npm run changeset` to create, `npm run version` to apply

## Structure

- Single package, CommonJS output (`"type": "commonjs"` in package.json)
- Source: `src/**/*.ts` → Build output: `dist/`
- Tests: `test/**/*.test.ts` (uses `babel-jest` transform, not `ts-jest`)
- Entry point: `dist/index.js` / `dist/index.d.ts`

## Notes

- `prepare` script runs automatically on `npm install` — cleans and rebuilds `dist/`
- No ESLint, Prettier, or separate typecheck step configured
