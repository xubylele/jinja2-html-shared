import {
  extractBlockDefinitions,
  extractMacroCalls,
  calculateNestingDepth,
  isVariableUsed,
} from '../src/templateRelations';

describe('extractBlockDefinitions', () => {
  it('extracts a simple block', () => {
    const text = '{% block title %}My Title{% endblock %}';
    const blocks = extractBlockDefinitions(text);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].name).toBe('title');
    expect(blocks[0].endblockOffset).toBeGreaterThan(0);
    expect(blocks[0].endblockLength).toBeGreaterThan(0);
  });

  it('extracts multiple blocks', () => {
    const text = '{% block head %}...{% endblock %}{% block body %}...{% endblock %}';
    const blocks = extractBlockDefinitions(text);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].name).toBe('head');
    expect(blocks[1].name).toBe('body');
  });

  it('handles named endblock', () => {
    const text = '{% block foo %}...{% endblock foo %}';
    const blocks = extractBlockDefinitions(text);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].name).toBe('foo');
  });

  it('marks unclosed blocks with endblockOffset=-1', () => {
    const text = '{% block orphan %}no close';
    const blocks = extractBlockDefinitions(text);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].endblockOffset).toBe(-1);
    expect(blocks[0].endblockLength).toBe(0);
  });
});

describe('extractMacroCalls', () => {
  it('extracts a simple macro call', () => {
    const text = '{{ input_field("name", label="Name") }}';
    const calls = extractMacroCalls(text);
    expect(calls).toHaveLength(1);
    expect(calls[0].name).toBe('input_field');
    expect(calls[0].args).toContain('"name"');
    expect(calls[0].args).toContain('label="Name"');
  });

  it('does not include macro definitions', () => {
    const text = '{% macro my_macro(x) %}{{ my_macro(1) }}{% endmacro %}';
    const calls = extractMacroCalls(text);
    expect(calls).toHaveLength(1);
    expect(calls[0].name).toBe('my_macro');
  });

  it('extracts multiple calls', () => {
    const text = '{{ foo() }}{{ bar(1, 2) }}';
    const calls = extractMacroCalls(text);
    expect(calls).toHaveLength(2);
    expect(calls[0].name).toBe('foo');
    expect(calls[1].name).toBe('bar');
  });
});

describe('calculateNestingDepth', () => {
  it('returns 0 for flat template', () => {
    expect(calculateNestingDepth('{{ x }}')).toBe(0);
  });

  it('counts a single block', () => {
    const text = '{% block content %}{{ x }}{% endblock %}';
    expect(calculateNestingDepth(text)).toBe(1);
  });

  it('counts nested blocks', () => {
    const text = '{% if True %}{% for x in items %}{{ x }}{% endfor %}{% endif %}';
    expect(calculateNestingDepth(text)).toBe(2);
  });

  it('handles macro as depth', () => {
    const text = '{% macro fn() %}{% if True %}{{ x }}{% endif %}{% endmacro %}';
    expect(calculateNestingDepth(text)).toBe(2);
  });
});

describe('isVariableUsed', () => {
  it('returns true for variable in {{ ... }}', () => {
    expect(isVariableUsed('{{ user }}', 'user')).toBe(true);
  });

  it('returns true for loop variable', () => {
    expect(isVariableUsed('{% for item in items %}{{ item }}{% endfor %}', 'item')).toBe(true);
  });

  it('returns false for unused variable', () => {
    expect(isVariableUsed('{{ other }}', 'user')).toBe(false);
  });

  it('returns true for variable in expression', () => {
    expect(isVariableUsed('{% if user.is_admin %}...{% endif %}', 'user')).toBe(true);
  });
});
