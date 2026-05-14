import nunjucks from "nunjucks";

nunjucks.installJinjaCompat();

export type PlaceholderMode = "inline" | "badge" | "hidden";

export interface RenderResult {
  html: string;
  missingVariables: string[];
  usedVariables: string[];
}

export interface RenderOptions {
  highlightMissing?: boolean;
  placeholderMode?: PlaceholderMode;
}

function collectUsedRoots(content: string): string[] {
  const varRegex = /\{\{\s*([\w.]+)\s*\}\}/g;
  const roots: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = varRegex.exec(content)) !== null) {
    roots.push(match[1].split(".")[0]);
  }

  return [...new Set(roots)];
}

function collectLocallyDefined(content: string): Set<string> {
  const setRegex = /\{%-?\s*set\s+(\w+)\s*=/g;
  const forRegex = /\{%-?\s*for\s+(\w+)\s+in\s+/g;
  const defined = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = setRegex.exec(content)) !== null) {
    defined.add(match[1]);
  }
  while ((match = forRegex.exec(content)) !== null) {
    defined.add(match[1]);
  }

  return defined;
}

export function findUsedVariables(content: string): string[] {
  return collectUsedRoots(content);
}

export function findMissingVariables(content: string, context: Record<string, unknown>): string[] {
  const used = collectUsedRoots(content);
  const defined = collectLocallyDefined(content);
  return used.filter((v) => !defined.has(v) && !(v in context));
}

function addJinjaHelpers(context: Record<string, unknown>): Record<string, unknown> {
  const enriched = { ...context };

  if (!("now" in enriched)) {
    enriched["now"] = () => new Date();
  }

  return enriched;
}

function resolveMode(opts: RenderOptions): PlaceholderMode {
  if (opts.placeholderMode) {
    return opts.placeholderMode;
  }
  return opts.highlightMissing ? "inline" : "hidden";
}

export function renderTemplate(
  content: string,
  context: Record<string, unknown>,
  opts: RenderOptions = {}
): RenderResult {
  const mode = resolveMode(opts);
  const usedVariables = findUsedVariables(content);
  const missing = findMissingVariables(content, context);

  const env = new nunjucks.Environment(null, { throwOnUndefined: false });

  const safeContext: Record<string, unknown> = addJinjaHelpers({ ...context });
  for (const v of missing) {
    safeContext[v] = mode === "hidden" ? "" : `<<MISSING:${v}>>`;
  }

  let html: string;
  try {
    html = env.renderString(content, safeContext);
  } catch {
    html = content;
  }

  if (mode !== "hidden") {
    html = html.replace(
      /&lt;&lt;MISSING:(\w+)&gt;&gt;/g,
      (_match, name: string) =>
        `<span class="jinja2-missing-var" data-var="${name}" data-mode="${mode}">${name}</span>`
    );
  }

  return { html, missingVariables: missing, usedVariables };
}
