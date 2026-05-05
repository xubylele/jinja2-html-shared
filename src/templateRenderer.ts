import nunjucks from 'nunjucks';

nunjucks.installJinjaCompat();

export interface RenderResult {
  html: string;
  missingVariables: string[];
}

export interface RenderOptions {
  highlightMissing?: boolean;
}

function createMissingVarTracker(): {
  missing: Set<string>;
} {
  const missing = new Set<string>();
  return { missing };
}

function extractTemplateVariables(content: string): string[] {
  const varRegex = /\{\{\s*([\w.]+)\s*\}\}/g;
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

  const used: string[] = [];
  while ((match = varRegex.exec(content)) !== null) {
    const name = match[1].split('.')[0];
    if (!defined.has(name)) {
      used.push(name);
    }
  }

  return [...new Set(used)];
}

export function findMissingVariables(
  content: string,
  context: Record<string, unknown>
): string[] {
  const used = extractTemplateVariables(content);
  return used.filter((v) => !(v in context));
}

export function renderTemplate(
  content: string,
  context: Record<string, unknown>,
  opts: RenderOptions = {}
): RenderResult {
  const { highlightMissing = false } = opts;
  const missing = findMissingVariables(content, context);

  const env = new nunjucks.Environment(null, { throwOnUndefined: false });

  const safeContext: Record<string, unknown> = { ...context };
  for (const v of missing) {
    if (highlightMissing) {
      safeContext[v] = `<<MISSING:${v}>>`;
    } else {
      safeContext[v] = '';
    }
  }

  let html: string;
  try {
    html = env.renderString(content, safeContext);
  } catch {
    html = content;
  }

  if (highlightMissing) {
    html = html.replace(
      /&lt;&lt;MISSING:(\w+)&gt;&gt;/g,
      '<span class="jinja2-missing-var" data-var="$1">$1</span>'
    );
  }

  return { html, missingVariables: missing };
}
