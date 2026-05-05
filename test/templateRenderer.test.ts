import { renderTemplate, findMissingVariables } from '../src/templateRenderer';

describe('templateRenderer', () => {
  describe('renderTemplate', () => {
    it('renders simple variable substitution', () => {
      const result = renderTemplate('Hello {{ name }}!', { name: 'World' });
      expect(result.html).toBe('Hello World!');
      expect(result.missingVariables).toEqual([]);
    });

    it('reports missing variables', () => {
      const result = renderTemplate('Hello {{ name }}!', {});
      expect(result.missingVariables).toContain('name');
    });

    it('highlights missing variables with span', () => {
      const result = renderTemplate('Hello {{ name }}!', {}, { highlightMissing: true });
      expect(result.html).toContain('jinja2-missing-var');
      expect(result.html).toContain('name');
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
      const result = renderTemplate(
        '{% set x = 5 %}{{ x }}',
        {}
      );
      expect(result.html).toBe('5');
    });

    it('handles nested object access', () => {
      const result = renderTemplate('{{ user.name }}', { user: { name: 'Alice' } });
      expect(result.html).toBe('Alice');
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
      const missing = findMissingVariables('{% for i in items %}{{ i }}{% endfor %}', { items: [1, 2] });
      expect(missing).not.toContain('i');
    });

    it('extracts root variable from nested access', () => {
      const missing = findMissingVariables('{{ user.name }}', {});
      expect(missing).toContain('user');
    });
  });
});
