import { filterAtOffset, identifierAtOffset } from '../src/filterParser';

describe('identifierAtOffset', () => {
  it('returns the identifier when cursor is inside {{ }}', () => {
    const text = '{{ user }}';
    const m = identifierAtOffset(text, 5); // inside "user"
    expect(m).toEqual({ name: 'user', offset: 3, length: 4 });
  });

  it('returns null outside any Jinja2 expression', () => {
    const text = 'hello user';
    expect(identifierAtOffset(text, 7)).toBeNull();
  });

  it('returns null when cursor is on whitespace inside expression', () => {
    const text = '{{   }}';
    expect(identifierAtOffset(text, 4)).toBeNull();
  });

  it('returns null on a digit-leading token', () => {
    const text = '{{ 42 }}';
    expect(identifierAtOffset(text, 4)).toBeNull();
  });

  it('works inside {% %} blocks too', () => {
    const text = '{% if user %}';
    const m = identifierAtOffset(text, 8);
    expect(m?.name).toBe('user');
  });
});

describe('filterAtOffset', () => {
  it('detects a filter after a single pipe', () => {
    const text = '{{ name|upper }}';
    const m = filterAtOffset(text, 9); // on "upper"
    expect(m?.name).toBe('upper');
  });

  it('returns null on the variable side of the pipe', () => {
    const text = '{{ name|upper }}';
    expect(filterAtOffset(text, 4)).toBeNull(); // on "name"
  });

  it('handles whitespace between pipe and filter', () => {
    const text = '{{ name |   upper }}';
    const m = filterAtOffset(text, 13); // on "upper"
    expect(m?.name).toBe('upper');
  });

  it('handles chained filters', () => {
    const text = '{{ name|lower|capitalize }}';
    const m1 = filterAtOffset(text, 10); // on "lower"
    const m2 = filterAtOffset(text, 16); // on "capitalize"
    expect(m1?.name).toBe('lower');
    expect(m2?.name).toBe('capitalize');
  });

  it('rejects logical-or `||`', () => {
    const text = '{{ a||upper }}';
    expect(filterAtOffset(text, 7)).toBeNull();
  });

  it('returns null outside expressions', () => {
    const text = 'name|upper';
    expect(filterAtOffset(text, 6)).toBeNull();
  });

  it('returns null when there is no pipe before the identifier', () => {
    const text = '{{ upper }}';
    expect(filterAtOffset(text, 5)).toBeNull();
  });
});
