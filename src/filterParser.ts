// Pure parser: locate the Jinja2 filter identifier at a given offset inside a template string.
// No vscode imports — operates on raw text only.

export interface IdentifierMatch {
  name: string;
  offset: number;
  length: number;
}

/**
 * Returns the identifier at `offset` only if the cursor is inside a Jinja2
 * `{{ ... }}` or `{% ... %}` expression. Returns null otherwise.
 */
export function identifierAtOffset(text: string, offset: number): IdentifierMatch | null {
  if (offset < 0 || offset > text.length) { return null; }
  if (!isInsideJinjaExpr(text, offset)) { return null; }

  const isIdent = (ch: string) => /[A-Za-z0-9_]/.test(ch);
  let start = offset;
  while (start > 0 && isIdent(text[start - 1])) { start--; }
  let end = offset;
  while (end < text.length && isIdent(text[end])) { end++; }
  if (start === end) { return null; }
  if (!/[A-Za-z_]/.test(text[start])) { return null; }
  return { name: text.slice(start, end), offset: start, length: end - start };
}

/**
 * Returns the filter identifier at `offset` (preceded by `|` in the same expression),
 * or null if the cursor is not on a filter name.
 */
export function filterAtOffset(text: string, offset: number): IdentifierMatch | null {
  const ident = identifierAtOffset(text, offset);
  if (!ident) { return null; }

  let i = ident.offset - 1;
  while (i >= 0 && /\s/.test(text[i])) { i--; }
  if (i < 0 || text[i] !== '|') { return null; }
  // Reject `||` (logical-or in expressions) — a filter pipe is a single `|`.
  if (i > 0 && text[i - 1] === '|') { return null; }

  return ident;
}

function isInsideJinjaExpr(text: string, offset: number): boolean {
  const opens = [
    { tok: '{{', close: '}}' },
    { tok: '{%', close: '%}' },
  ];
  let bestOpen = -1;
  let bestClose = '';
  for (const { tok, close } of opens) {
    const idx = text.lastIndexOf(tok, offset - 1);
    if (idx > bestOpen) {
      bestOpen = idx;
      bestClose = close;
    }
  }
  if (bestOpen < 0) { return false; }
  const closeIdx = text.indexOf(bestClose, bestOpen + 2);
  if (closeIdx < 0) { return false; }
  return offset >= bestOpen + 2 && offset <= closeIdx;
}
