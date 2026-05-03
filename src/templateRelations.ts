// Pure analyzers for Jinja2 template inheritance / inclusion / import / macro
// syntax. No vscode, no I/O — operates on strings only. Consumers convert
// offsets into editor ranges.

export interface TemplatePathOccurrence {
  /** Raw template path as written (e.g. `auth/login.html`). */
  path: string;
  /** Offset where the path string content starts (after the opening quote). */
  pathOffset: number;
  /** Length of the raw path string. */
  pathLength: number;
  /** Offset of the `{%` opening token of the tag. */
  tagOffset: number;
  /** Length of the full `{% ... %}` tag. */
  tagLength: number;
}

export interface TemplateImportName {
  name: string;
  alias?: string;
}

export type TemplateImportKind = 'import' | 'from';

export interface TemplateImportOccurrence extends TemplatePathOccurrence {
  kind: TemplateImportKind;
  /** Bound alias when `kind === 'import'` (e.g. `{% import 'x' as macros %}`). */
  alias?: string;
  /** Imported names when `kind === 'from'`. */
  names?: TemplateImportName[];
}

export interface MacroParam {
  name: string;
  hasDefault: boolean;
}

export interface MacroDefinition {
  name: string;
  params: MacroParam[];
  /** Offset of the macro name identifier within the source text. */
  nameOffset: number;
  /** Length of the macro name. */
  nameLength: number;
}

export interface TemplateRelations {
  /** First `{% extends %}` in the file. Jinja2 only honors one per template. */
  extends: TemplatePathOccurrence | null;
  includes: TemplatePathOccurrence[];
  imports: TemplateImportOccurrence[];
  macros: MacroDefinition[];
}

const EXTENDS_RE = /\{%-?\s*extends\s+(['"])([^'"]+)\1\s*-?%\}/g;
const INCLUDE_RE = /\{%-?\s*include\s+(['"])([^'"]+)\1[^%]*?-?%\}/g;
const IMPORT_RE = /\{%-?\s*import\s+(['"])([^'"]+)\1\s+as\s+([A-Za-z_]\w*)\s*-?%\}/g;
const FROM_IMPORT_RE = /\{%-?\s*from\s+(['"])([^'"]+)\1\s+import\s+([^%]+?)\s*-?%\}/g;
const MACRO_RE = /\{%-?\s*macro\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*-?%\}/g;

/** Scan a template string for inheritance, includes, imports, and macros. */
export function scanTemplateRelations(text: string): TemplateRelations {
  return {
    extends: scanExtends(text),
    includes: scanIncludes(text),
    imports: scanImports(text),
    macros: extractMacroDefinitions(text),
  };
}

function scanExtends(text: string): TemplatePathOccurrence | null {
  EXTENDS_RE.lastIndex = 0;
  const m = EXTENDS_RE.exec(text);
  if (!m) { return null; }
  return buildPathOccurrence(m, text, m[2]);
}

function scanIncludes(text: string): TemplatePathOccurrence[] {
  INCLUDE_RE.lastIndex = 0;
  const out: TemplatePathOccurrence[] = [];
  let m: RegExpExecArray | null;
  while ((m = INCLUDE_RE.exec(text)) !== null) {
    out.push(buildPathOccurrence(m, text, m[2]));
  }
  return out;
}

function scanImports(text: string): TemplateImportOccurrence[] {
  const out: TemplateImportOccurrence[] = [];

  IMPORT_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = IMPORT_RE.exec(text)) !== null) {
    const base = buildPathOccurrence(m, text, m[2]);
    out.push({ ...base, kind: 'import', alias: m[3] });
  }

  FROM_IMPORT_RE.lastIndex = 0;
  while ((m = FROM_IMPORT_RE.exec(text)) !== null) {
    const base = buildPathOccurrence(m, text, m[2]);
    out.push({ ...base, kind: 'from', names: parseImportNames(m[3]) });
  }

  return out;
}

/** Public — also feeds future Macro IntelliSense feature. */
export function extractMacroDefinitions(text: string): MacroDefinition[] {
  MACRO_RE.lastIndex = 0;
  const out: MacroDefinition[] = [];
  let m: RegExpExecArray | null;
  while ((m = MACRO_RE.exec(text)) !== null) {
    const name = m[1];
    const paramsBody = m[2];
    const nameLocal = m[0].indexOf(name, m[0].indexOf('macro') + 5);
    out.push({
      name,
      params: parseMacroParams(paramsBody),
      nameOffset: m.index + nameLocal,
      nameLength: name.length,
    });
  }
  return out;
}

function buildPathOccurrence(
  match: RegExpExecArray,
  text: string,
  rawPath: string,
): TemplatePathOccurrence {
  const tagOffset = match.index;
  const tagLength = match[0].length;
  // Path is in capture group 2 (groups: 1=quote, 2=path). Locate it inside m[0].
  const localPathOffset = match[0].indexOf(rawPath);
  const pathOffset = tagOffset + localPathOffset;
  return {
    path: rawPath,
    pathOffset,
    pathLength: rawPath.length,
    tagOffset,
    tagLength,
  };
}

function parseImportNames(body: string): TemplateImportName[] {
  return body
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => {
      const asMatch = part.match(/^([A-Za-z_]\w*)\s+as\s+([A-Za-z_]\w*)$/);
      if (asMatch) {
        return { name: asMatch[1], alias: asMatch[2] };
      }
      const nameMatch = part.match(/^([A-Za-z_]\w*)$/);
      return nameMatch ? { name: nameMatch[1] } : null;
    })
    .filter((entry): entry is TemplateImportName => entry !== null);
}

function parseMacroParams(body: string): MacroParam[] {
  return body
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => {
      const eq = part.indexOf('=');
      const rawName = (eq >= 0 ? part.slice(0, eq) : part).trim();
      const nameMatch = rawName.match(/^([A-Za-z_]\w*)$/);
      if (!nameMatch) { return null; }
      return { name: nameMatch[1], hasDefault: eq >= 0 };
    })
    .filter((p): p is MacroParam => p !== null);
}
