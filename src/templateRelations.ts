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

export type TemplateImportKind = "import" | "from";

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

export interface BlockDefinition {
  name: string;
  /** Offset of the `{% block %}` opening tag. */
  blockOffset: number;
  /** Length of the full `{% block name %}` tag. */
  blockLength: number;
  /** Offset of the block name identifier. */
  nameOffset: number;
  /** Length of the block name. */
  nameLength: number;
  /** Offset of the `{% endblock %}` tag, or -1 if not found. */
  endblockOffset: number;
  /** Length of the `{% endblock %}` tag, or 0 if not found. */
  endblockLength: number;
}

export interface MacroCall {
  name: string;
  /** Argument strings (before trimming/parsing). May be empty strings for unnamed args. */
  args: string[];
  /** Offset of the macro name in the source text. */
  nameOffset: number;
  /** Length of the macro name. */
  nameLength: number;
  /** Offset of the opening `(` in the call. */
  callOffset: number;
}

export interface TemplateRelations {
  /** First `{% extends %}` in the file. Jinja2 only honors one per template. */
  extends: TemplatePathOccurrence | null;
  includes: TemplatePathOccurrence[];
  imports: TemplateImportOccurrence[];
  macros: MacroDefinition[];
  /** `{% block %}…{% endblock %}` pairs. */
  blocks: BlockDefinition[];
  /** `{{ macroName(args) }}` calls (excluding macro definitions themselves). */
  macroCalls: MacroCall[];
}

const EXTENDS_RE = /\{%-?\s*extends\s+(['"])([^'"]+)\1\s*-?%\}/g;
const INCLUDE_RE = /\{%-?\s*include\s+(['"])([^'"]+)\1[^%]*?-?%\}/g;
const IMPORT_RE = /\{%-?\s*import\s+(['"])([^'"]+)\1\s+as\s+([A-Za-z_]\w*)\s*-?%\}/g;
const FROM_IMPORT_RE = /\{%-?\s*from\s+(['"])([^'"]+)\1\s+import\s+([^%]+?)\s*-?%\}/g;
const MACRO_RE = /\{%-?\s*macro\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*-?%\}/g;
const BLOCK_RE = /\{%-?\s*block\s+([A-Za-z_]\w*)\s*-?%\}/g;
const ENDBLOCK_RE = /\{%-?\s*endblock(?:\s+([A-Za-z_]\w*))?\s*-?%\}/g;
const MACRO_CALL_RE = /\{\{\s*([A-Za-z_]\w*)\s*\(/g;

/** Scan a template string for inheritance, includes, imports, macros, blocks, and macro calls. */
export function scanTemplateRelations(text: string): TemplateRelations {
  return {
    extends: scanExtends(text),
    includes: scanIncludes(text),
    imports: scanImports(text),
    macros: extractMacroDefinitions(text),
    blocks: extractBlockDefinitions(text),
    macroCalls: extractMacroCalls(text),
  };
}

function scanExtends(text: string): TemplatePathOccurrence | null {
  EXTENDS_RE.lastIndex = 0;
  const m = EXTENDS_RE.exec(text);
  if (!m) {
    return null;
  }
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
    out.push({ ...base, kind: "import", alias: m[3] });
  }

  FROM_IMPORT_RE.lastIndex = 0;
  while ((m = FROM_IMPORT_RE.exec(text)) !== null) {
    const base = buildPathOccurrence(m, text, m[2]);
    out.push({ ...base, kind: "from", names: parseImportNames(m[3]) });
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
    const nameLocal = m[0].indexOf(name, m[0].indexOf("macro") + 5);
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
  rawPath: string
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
    .split(",")
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
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => {
      const eq = part.indexOf("=");
      const rawName = (eq >= 0 ? part.slice(0, eq) : part).trim();
      const nameMatch = rawName.match(/^([A-Za-z_]\w*)$/);
      if (!nameMatch) {
        return null;
      }
      return { name: nameMatch[1], hasDefault: eq >= 0 };
    })
    .filter((p): p is MacroParam => p !== null);
}

/**
 * Parse `{% block name %}…{% endblock %}` pairs.
 * Captures block name, offsets for the opening and closing tags, and the name offset.
 * Uses a stack-based approach to handle nested blocks correctly.
 */
export function extractBlockDefinitions(text: string): BlockDefinition[] {
  const out: BlockDefinition[] = [];
  const stack: Array<{
    name: string;
    blockOffset: number;
    blockLength: number;
    nameOffset: number;
    nameLength: number;
  }> = [];

  const blockRe = /\{%-?\s*block\s+([A-Za-z_]\w*)\s*-?%\}/g;
  const endblockRe = /\{%-?\s*endblock(?:\s+([A-Za-z_]\w*))?\s*-?%\}/g;

  let m: RegExpExecArray | null;

  // Collect all tags with their positions
  const tags: Array<{
    type: "block" | "endblock";
    name: string;
    offset: number;
    length: number;
  }> = [];

  blockRe.lastIndex = 0;
  while ((m = blockRe.exec(text)) !== null) {
    tags.push({ type: "block", name: m[1], offset: m.index, length: m[0].length });
  }

  endblockRe.lastIndex = 0;
  while ((m = endblockRe.exec(text)) !== null) {
    tags.push({ type: "endblock", name: m[1] || "", offset: m.index, length: m[0].length });
  }

  // Sort by offset to process in document order
  tags.sort((a, b) => a.offset - b.offset);

  for (const tag of tags) {
    if (tag.type === "block") {
      const nameLocal = text.indexOf(tag.name, tag.offset + 1);
      stack.push({
        name: tag.name,
        blockOffset: tag.offset,
        blockLength: tag.length,
        nameOffset: nameLocal,
        nameLength: tag.name.length,
      });
    } else {
      // endblock: pop from stack (LIFO)
      let found = tag.name ? stack.reverse().find((s) => s.name === tag.name) : stack.pop();
      if (found) {
        const idx = stack.indexOf(found);
        if (idx >= 0) {
          stack.splice(idx, 1);
        }
        out.push({
          name: found.name,
          blockOffset: found.blockOffset,
          blockLength: found.blockLength,
          nameOffset: found.nameOffset,
          nameLength: found.nameLength,
          endblockOffset: tag.offset,
          endblockLength: tag.length,
        });
      }
    }
  }

  // Any unclosed blocks
  for (const blk of stack) {
    out.push({
      name: blk.name,
      blockOffset: blk.blockOffset,
      blockLength: blk.blockLength,
      nameOffset: blk.nameOffset,
      nameLength: blk.nameLength,
      endblockOffset: -1,
      endblockLength: 0,
    });
  }

  return out;
}

/**
 * Parse `{{ macroName(arg1, arg2) }}` calls, excluding macro definitions themselves.
 * Captures macro name, argument strings (raw, before trimming), and offsets.
 */
export function extractMacroCalls(text: string): MacroCall[] {
  const out: MacroCall[] = [];
  const seen = new Set<number>();

  // Collect macro definition offsets to skip them
  const defRe = /\{%-?\s*macro\s+([A-Za-z_]\w*)\s*\(/g;
  let dm: RegExpExecArray | null;
  while ((dm = defRe.exec(text)) !== null) {
    seen.add(dm.index);
  }

  const callRe = /\{\{\s*([A-Za-z_]\w*)\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = callRe.exec(text)) !== null) {
    if (seen.has(m.index)) {
      continue;
    }
    const name = m[1];
    const callOffset = m.index + m[0].lastIndexOf("(");
    // Extract arguments between ( and matching )
    const args = extractArgs(text, callOffset);
    const nameLocal = m[0].indexOf(name);
    out.push({
      name,
      args,
      nameOffset: m.index + nameLocal,
      nameLength: name.length,
      callOffset,
    });
  }
  return out;
}

function extractArgs(text: string, parenOffset: number): string[] {
  let depth = 0;
  let i = parenOffset;
  const args: string[] = [];
  let current = "";
  while (i < text.length) {
    const ch = text[i];
    if (ch === "(") {
      depth++;
      if (depth > 1) {
        current += ch;
      }
    } else if (ch === ")") {
      depth--;
      if (depth === 0) {
        if (current.trim()) {
          args.push(current.trim());
        }
        break;
      }
      current += ch;
    } else if (ch === "," && depth === 1) {
      args.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
    i++;
  }
  return args;
}

/**
 * Calculate the maximum nesting depth of Jinja2 block-level tags
 * ({% if %}, {% for %}, {% block %}, {% macro %}).
 * Returns the depth (>= 0). Useful for lint rule JHE1202.
 */
export function calculateNestingDepth(text: string): number {
  const openRe = /\{%-?\s*(if|for|block|macro)\b/g;
  const closeRe = /\{%-?\s*end(if|for|block|macro)\b/g;
  let maxDepth = 0;
  let depth = 0;
  let m: RegExpExecArray | null;

  // Collect all open and close tags with positions
  const tags: { offset: number; type: "open" | "close" }[] = [];

  openRe.lastIndex = 0;
  while ((m = openRe.exec(text)) !== null) {
    tags.push({ offset: m.index, type: "open" });
  }

  closeRe.lastIndex = 0;
  while ((m = closeRe.exec(text)) !== null) {
    tags.push({ offset: m.index, type: "close" });
  }

  // Sort by offset to process in document order
  tags.sort((a, b) => a.offset - b.offset);

  for (const tag of tags) {
    if (tag.type === "open") {
      depth++;
      if (depth > maxDepth) {
        maxDepth = depth;
      }
    } else {
      if (depth > 0) {
        depth--;
      }
    }
  }

  return maxDepth;
}

/**
 * Check if a variable name appears to be "used" in the template text.
 * Looks for usage in {{ ... }}, as a loop variable, or in expressions.
 * Returns true if the variable name is found in relevant contexts.
 */
export function isVariableUsed(text: string, varName: string): boolean {
  const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Match as a standalone identifier in {{ ... }}, {% ... %}, or as a for-loop var
  const re = new RegExp(
    "({{[^}]*\\b" +
      escaped +
      "\\b[^}]*}})|" +
      "({%[^%]*\\b" +
      escaped +
      "\\b[^%]*%})|" +
      "({%\s*for\s+" +
      escaped +
      "\\s+in\\b)",
    "g"
  );
  return re.test(text);
}
