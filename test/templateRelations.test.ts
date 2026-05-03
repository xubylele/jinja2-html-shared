import {
  scanTemplateRelations,
  extractMacroDefinitions,
} from '../src/templateRelations';

describe('scanTemplateRelations — extends', () => {
  it('extracts a double-quoted extends path', () => {
    const text = `{% extends "base.html" %}\n<h1>x</h1>`;
    const r = scanTemplateRelations(text);
    expect(r.extends).not.toBeNull();
    expect(r.extends!.path).toBe('base.html');
    const slice = text.slice(r.extends!.pathOffset, r.extends!.pathOffset + r.extends!.pathLength);
    expect(slice).toBe('base.html');
  });

  it('extracts a single-quoted extends path with whitespace control', () => {
    const text = `{%- extends 'layouts/base.html' -%}`;
    const r = scanTemplateRelations(text);
    expect(r.extends?.path).toBe('layouts/base.html');
  });

  it('returns null when no extends', () => {
    expect(scanTemplateRelations('<p>plain</p>').extends).toBeNull();
  });

  it('honors only the first extends', () => {
    const text = `{% extends "a.html" %}{% extends "b.html" %}`;
    expect(scanTemplateRelations(text).extends?.path).toBe('a.html');
  });
});

describe('scanTemplateRelations — includes', () => {
  it('extracts multiple include paths', () => {
    const text = `
      {% include "header.html" %}
      <main></main>
      {% include 'footer.html' %}
    `;
    const r = scanTemplateRelations(text);
    expect(r.includes.map((i) => i.path)).toEqual(['header.html', 'footer.html']);
  });

  it('handles "ignore missing" and "with context"', () => {
    const text = `{% include "opt.html" ignore missing %}{% include 'x.html' with context %}`;
    const r = scanTemplateRelations(text);
    expect(r.includes.map((i) => i.path)).toEqual(['opt.html', 'x.html']);
  });
});

describe('scanTemplateRelations — imports', () => {
  it('parses {% import "x" as alias %}', () => {
    const text = `{% import "macros.html" as m %}`;
    const [imp] = scanTemplateRelations(text).imports;
    expect(imp.kind).toBe('import');
    expect(imp.path).toBe('macros.html');
    expect(imp.alias).toBe('m');
  });

  it('parses {% from "x" import a, b as c %}', () => {
    const text = `{% from 'macros.html' import card, modal as m %}`;
    const [imp] = scanTemplateRelations(text).imports;
    expect(imp.kind).toBe('from');
    expect(imp.path).toBe('macros.html');
    expect(imp.names).toEqual([
      { name: 'card' },
      { name: 'modal', alias: 'm' },
    ]);
  });

  it('collects both import and from-import in one file', () => {
    const text = `
      {% import "a.html" as a %}
      {% from "b.html" import x %}
    `;
    const r = scanTemplateRelations(text);
    expect(r.imports).toHaveLength(2);
    expect(r.imports.map((i) => i.kind).sort()).toEqual(['from', 'import']);
  });
});

describe('extractMacroDefinitions', () => {
  it('extracts macro name and params', () => {
    const text = `{% macro card(title, body, footer="") %}<div></div>{% endmacro %}`;
    const macros = extractMacroDefinitions(text);
    expect(macros).toHaveLength(1);
    expect(macros[0].name).toBe('card');
    expect(macros[0].params).toEqual([
      { name: 'title', hasDefault: false },
      { name: 'body', hasDefault: false },
      { name: 'footer', hasDefault: true },
    ]);
    const slice = text.slice(macros[0].nameOffset, macros[0].nameOffset + macros[0].nameLength);
    expect(slice).toBe('card');
  });

  it('returns empty list when no macros', () => {
    expect(extractMacroDefinitions(`<p>{{ x }}</p>`)).toEqual([]);
  });

  it('handles macros with no params', () => {
    expect(extractMacroDefinitions(`{% macro nop() %}{% endmacro %}`)).toEqual([
      { name: 'nop', params: [], nameOffset: 9, nameLength: 3 },
    ]);
  });
});

describe('scanTemplateRelations — combined', () => {
  it('collects everything in a realistic child template', () => {
    const text = [
      `{% extends "base.html" %}`,
      `{% from "macros/forms.html" import field %}`,
      `{% import "macros/cards.html" as cards %}`,
      `{% block content %}`,
      `  {% include "partials/_flash.html" %}`,
      `  {% macro greet(name) %}Hi {{ name }}{% endmacro %}`,
      `{% endblock %}`,
    ].join('\n');
    const r = scanTemplateRelations(text);
    expect(r.extends?.path).toBe('base.html');
    expect(r.includes.map((i) => i.path)).toEqual(['partials/_flash.html']);
    expect(r.imports.map((i) => i.path).sort()).toEqual([
      'macros/cards.html',
      'macros/forms.html',
    ]);
    expect(r.macros.map((m) => m.name)).toEqual(['greet']);
  });
});
