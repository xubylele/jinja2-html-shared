import {
  renderTemplate,
  findMissingVariables,
  findUsedVariables,
} from '../src/templateRenderer';

describe('templateRenderer', () => {
  describe('renderTemplate', () => {
    it('renders simple variable substitution', () => {
      const result = renderTemplate('Hello {{ name }}!', { name: 'World' });
      expect(result.html).toBe('Hello World!');
      expect(result.missingVariables).toEqual([]);
      expect(result.usedVariables).toEqual(['name']);
    });

    it('reports missing variables', () => {
      const result = renderTemplate('Hello {{ name }}!', {});
      expect(result.missingVariables).toContain('name');
    });

    it('highlights missing variables with span (legacy highlightMissing)', () => {
      const result = renderTemplate('Hello {{ name }}!', {}, { highlightMissing: true });
      expect(result.html).toContain('jinja2-missing-var');
      expect(result.html).toContain('data-var="name"');
      expect(result.html).toContain('data-mode="inline"');
    });

    it('placeholderMode inline emits inline span', () => {
      const result = renderTemplate('Hi {{ x }}', {}, { placeholderMode: 'inline' });
      expect(result.html).toContain('data-mode="inline"');
    });

    it('placeholderMode badge tags spans with data-mode="badge"', () => {
      const result = renderTemplate('Hi {{ x }}', {}, { placeholderMode: 'badge' });
      expect(result.html).toContain('data-mode="badge"');
      expect(result.html).toContain('data-var="x"');
    });

    it('placeholderMode hidden emits no span', () => {
      const result = renderTemplate('Hi {{ x }}', {}, { placeholderMode: 'hidden' });
      expect(result.html).not.toContain('jinja2-missing-var');
      expect(result.html).toBe('Hi ');
    });

    it('placeholderMode overrides legacy highlightMissing when both set', () => {
      const result = renderTemplate(
        'Hi {{ x }}',
        {},
        { highlightMissing: true, placeholderMode: 'hidden' }
      );
      expect(result.html).not.toContain('jinja2-missing-var');
    });

    it('legacy highlightMissing false maps to hidden output', () => {
      const result = renderTemplate('Hi {{ x }}', {}, { highlightMissing: false });
      expect(result.html).not.toContain('jinja2-missing-var');
    });

    it('processes for loops', () => {
      const result = renderTemplate(
        '{% for item in items %}{{ item }} {% endfor %}',
        { items: ['a', 'b'] }
      );
      expect(result.html.trim()).toBe('a b');
    });

    it('processes if conditions', () => {
      const result = renderTemplate(
        '{% if show %}yes{% else %}no{% endif %}',
        { show: true }
      );
      expect(result.html).toBe('yes');
    });

    it('supports set blocks', () => {
      const result = renderTemplate('{% set x = 5 %}{{ x }}', {});
      expect(result.html).toBe('5');
    });

    it('handles nested object access', () => {
      const result = renderTemplate('{{ user.name }}', { user: { name: 'Alice' } });
      expect(result.html).toBe('Alice');
    });

    it('falls back to raw content on render error', () => {
      const broken = '{% for %}oops';
      const result = renderTemplate(broken, {});
      expect(result.html).toBe(broken);
    });

    it('injects now() global when absent', () => {
      const result = renderTemplate('{{ now().getFullYear() }}', {});
      expect(result.html).toMatch(/^\d{4}$/);
    });
  });

  describe('findMissingVariables', () => {
    it('returns empty for fully-provided context', () => {
      const missing = findMissingVariables('{{ a }} {{ b }}', { a: 1, b: 2 });
      expect(missing).toEqual([]);
    });

    it('finds a single missing variable', () => {
      const missing = findMissingVariables('{{ a }}', {});
      expect(missing).toContain('a');
    });

    it('does not flag set variables as missing', () => {
      const missing = findMissingVariables('{% set x = 1 %}{{ x }}', {});
      expect(missing).not.toContain('x');
    });

    it('does not flag for-loop variables as missing', () => {
      const missing = findMissingVariables(
        '{% for i in items %}{{ i }}{% endfor %}',
        { items: [1, 2] }
      );
      expect(missing).not.toContain('i');
    });

    it('extracts root variable from nested access', () => {
      const missing = findMissingVariables('{{ user.name }}', {});
      expect(missing).toContain('user');
    });
  });

  describe('findUsedVariables', () => {
    it('returns every root identifier referenced by {{ }}', () => {
      const used = findUsedVariables('{{ a }} {{ b.c }} {{ a }}');
      expect(used.sort()).toEqual(['a', 'b']);
    });

    it('includes locally-defined identifiers (unlike findMissingVariables)', () => {
      const content = '{% set x = 1 %}{{ x }} {{ y }}';
      expect(findUsedVariables(content).sort()).toEqual(['x', 'y']);
      expect(findMissingVariables(content, {})).toEqual(['y']);
    });

    it('returns empty for templates without expressions', () => {
      expect(findUsedVariables('<p>hi</p>')).toEqual([]);
    });
  });
});
