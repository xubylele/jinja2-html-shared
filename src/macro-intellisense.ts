// Pure helpers for macro IntelliSense. Shared by the free single-file
// provider and Pro's cross-file provider. No vscode imports.

import type { MacroParam } from './templateRelations';

export interface MacroCallContext {
  macroName: string;
  namespace?: string;
}

/** `name(p, q?, r = …)` — used as completion `detail` and SignatureInformation label. */
export function formatMacroSignatureLabel(name: string, params: MacroParam[]): string {
  const inside = params
    .map((p) => (p.hasDefault ? `${p.name} = …` : p.name))
    .join(', ');
  return `${name}(${inside})`;
}

/** Snippet body: `name(${1:p}, ${2:q})`. */
export function formatMacroSnippet(name: string, params: MacroParam[]): string {
  const inside = params
    .map((p, i) => `\${${i + 1}:${p.name}}`)
    .join(', ');
  return `${name}(${inside})`;
}

/**
 * Detect the enclosing macro call at the cursor. Walks back to the unmatched
 * `(` that opens the current call, then reads the identifier (and optional
 * `ns.`) preceding it. Matches both `foo(` and `ns.foo(`. Returns null if not
 * inside a call.
 */
export function parseMacroCallContext(textBefore: string): MacroCallContext | null {
  let depth = 0;
  let openIndex = -1;
  for (let i = textBefore.length - 1; i >= 0; i--) {
    const ch = textBefore[i];
    if (ch === ')' || ch === ']' || ch === '}') { depth++; continue; }
    if (ch === '(' || ch === '[' || ch === '{') {
      if (depth === 0) {
        if (ch !== '(') { return null; }
        openIndex = i;
        break;
      }
      depth--;
    }
  }
  if (openIndex === -1) { return null; }

  const head = textBefore.slice(0, openIndex).replace(/\s+$/, '');
  const nsMatch = head.match(/([A-Za-z_]\w*)\.([A-Za-z_]\w*)$/);
  if (nsMatch) {
    return { macroName: nsMatch[2], namespace: nsMatch[1] };
  }
  const match = head.match(/([A-Za-z_]\w*)$/);
  if (match) {
    return { macroName: match[1] };
  }
  return null;
}

/**
 * True if `textBefore` is inside an open `{{ … }}` print block on the same line —
 * i.e. last `{{` is not yet closed by `}}` and not interrupted by `{%`.
 */
export function isInPrintContext(textBefore: string): boolean {
  const lastOpen = textBefore.lastIndexOf('{{');
  if (lastOpen === -1) { return false; }
  const between = textBefore.slice(lastOpen + 2);
  return !between.includes('}}') && !between.includes('{%');
}

/**
 * Active parameter index inside `name(` based on commas seen at top depth.
 * Resets to 0 if a nested `(`, `[`, or `{` is open — best-effort, mirrors VS Code's typical behavior.
 */
export function computeActiveParameter(textBefore: string): number {
  const parenStart = textBefore.lastIndexOf('(');
  if (parenStart === -1) { return 0; }
  const between = textBefore.slice(parenStart + 1);
  let count = 0;
  for (const ch of between) {
    if (ch === '(' || ch === '[' || ch === '{') { count = 0; break; }
    if (ch === ',') { count++; }
  }
  return count;
}
