// Pure template-path resolution. No fs, no path module — string ops only.
// Returns a list of candidate absolute paths in priority order; the caller
// (Pro extension) probes the filesystem to pick the first that exists.

import { normalizeTemplateKey } from './backendScanner';

/**
 * Compute candidate absolute paths for a template path written in
 * `{% extends %}` / `{% include %}` / `{% import %}` / `{% from %}`.
 *
 * Order:
 *   1. Each configured root joined with the normalized relative path.
 *   2. Relative to the directory of `fromTemplateAbs` when provided.
 *
 * No deduplication beyond exact-string equality; the caller may probe each.
 *
 * Inputs are treated as POSIX-style paths. Backslashes in roots or
 * `fromTemplateAbs` are normalized to forward slashes for consistency.
 */
export function resolveTemplatePath(
  templateRel: string,
  fromTemplateAbs: string | null,
  roots: string[],
): string[] {
  const rel = normalizeTemplateKey(templateRel);
  if (rel.length === 0) { return []; }

  const candidates: string[] = [];
  const seen = new Set<string>();
  const push = (p: string) => {
    if (!seen.has(p)) {
      seen.add(p);
      candidates.push(p);
    }
  };

  for (const root of roots) {
    const base = stripTrailingSlash(toPosix(root));
    if (base.length === 0) { continue; }
    push(`${base}/${rel}`);
  }

  if (fromTemplateAbs) {
    const dir = posixDirname(toPosix(fromTemplateAbs));
    if (dir.length > 0) {
      push(`${stripTrailingSlash(dir)}/${rel}`);
    }
  }

  return candidates;
}

function toPosix(p: string): string {
  return p.replace(/\\/g, '/');
}

function stripTrailingSlash(p: string): string {
  let end = p.length;
  while (end > 1 && p[end - 1] === '/') { end--; }
  return p.slice(0, end);
}

function posixDirname(p: string): string {
  const idx = p.lastIndexOf('/');
  if (idx < 0) { return ''; }
  if (idx === 0) { return '/'; }
  return p.slice(0, idx);
}
