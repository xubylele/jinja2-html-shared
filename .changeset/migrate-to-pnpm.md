---
"@xubylele/jinja2-enhanced-shared": patch
---

Migrated from npm to pnpm@11.0.8 across the whole workspace for improved supply-chain security. npm's dependency-resolution model has been a recurring attack vector — most recently demonstrated by the [TanStack npm supply-chain compromise](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem) (May 2026), where malicious lifecycle scripts smuggled via npm install harvested credentials and self-propagated across 42 packages. pnpm's strict content-addressable store, symlinked node_modules, and build-scripts-blocked-by-default (`ERR_PNPM_IGNORED_BUILDS`) provide stronger guarantees against this class of attack.

All npm scripts, CI workflows, and changeset-version hooks updated accordingly. No functional changes.
