# AGENTS.md

## Commands

- `npm run build` — Compile TypeScript to `dist/` via `tsc`
- `npm test` — Run tests with `jest --runInBand` (serial execution required)
- `npm run test:ci` — CI test runner with `--ci` flag
- No lint or typecheck commands — build fails fast on type errors

## Publishing

- Published to npmjs.com: `@xubylele/jinja2-enhanced-shared`
- Uses [Changesets](https://github.com/changesets/changesets) for versioning
- Consumers install via npm: `npm install @xubylele/jinja2-enhanced-shared`
- GitHub Actions publish to npmjs.com on tag push (OIDC Trusted Publisher)

## Structure

- Single package, CommonJS output (`"type": "commonjs"` in package.json)
- Source: `src/**/*.ts` → Build output: `dist/`
- Tests: `test/**/*.test.ts` (uses `babel-jest` transform, not `ts-jest`)
- Entry point: `dist/index.js` / `dist/index.d.ts`

## Notes

- `prepare` script runs automatically on `npm install` — cleans and rebuilds `dist/`
- No ESLint, Prettier, or separate typecheck step configured
- Backend scanner logic (pro-only) moved to `jinja2-html-enhancer-pro/src/intelligence/`
