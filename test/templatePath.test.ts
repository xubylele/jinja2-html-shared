import { resolveTemplatePath } from '../src/templatePath';

describe('resolveTemplatePath', () => {
  it('joins each root with the relative path in priority order', () => {
    const out = resolveTemplatePath(
      'auth/login.html',
      null,
      ['/repo/app/templates', '/repo/shared/templates'],
    );
    expect(out).toEqual([
      '/repo/app/templates/auth/login.html',
      '/repo/shared/templates/auth/login.html',
    ]);
  });

  it('appends a relative-to-current-file fallback', () => {
    const out = resolveTemplatePath(
      'partial.html',
      '/repo/app/templates/auth/login.html',
      ['/repo/app/templates'],
    );
    expect(out).toEqual([
      '/repo/app/templates/partial.html',
      '/repo/app/templates/auth/partial.html',
    ]);
  });

  it('strips leading ./ and / from the relative path', () => {
    const out = resolveTemplatePath('./auth/x.html', null, ['/r']);
    expect(out).toEqual(['/r/auth/x.html']);
  });

  it('normalizes Windows-style paths', () => {
    const out = resolveTemplatePath(
      'auth\\login.html',
      'C:\\repo\\app\\templates\\auth\\login.html',
      ['C:\\repo\\app\\templates'],
    );
    expect(out).toEqual([
      'C:/repo/app/templates/auth/login.html',
      'C:/repo/app/templates/auth/auth/login.html',
    ]);
  });

  it('strips trailing slashes from roots', () => {
    expect(resolveTemplatePath('a.html', null, ['/r/'])).toEqual(['/r/a.html']);
    expect(resolveTemplatePath('a.html', null, ['/r//'])).toEqual(['/r/a.html']);
  });

  it('skips empty roots', () => {
    expect(resolveTemplatePath('a.html', null, ['', '/r'])).toEqual(['/r/a.html']);
  });

  it('deduplicates identical candidates', () => {
    const out = resolveTemplatePath(
      'partial.html',
      '/r/partial.html',
      ['/r'],
    );
    expect(out).toEqual(['/r/partial.html']);
  });

  it('returns empty when path is empty', () => {
    expect(resolveTemplatePath('', null, ['/r'])).toEqual([]);
  });
});
