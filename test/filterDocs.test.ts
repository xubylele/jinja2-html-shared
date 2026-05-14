import { FILTER_DOCS, getFilterDoc, listFilterNames } from "../src/filterDocs";

describe("FILTER_DOCS", () => {
  it("contains the full set of built-in Jinja2 filters", () => {
    expect(listFilterNames().length).toBeGreaterThanOrEqual(50);
  });

  it("every entry has a stable descriptionKey of the form filter.<name>.description", () => {
    for (const name of listFilterNames()) {
      const doc = FILTER_DOCS[name];
      expect(doc.descriptionKey).toBe(`filter.${name}.description`);
      expect(doc.signature).toContain(name);
      expect(doc.example.length).toBeGreaterThan(0);
    }
  });

  it("exposes well-known filters", () => {
    expect(getFilterDoc("length")).toBeDefined();
    expect(getFilterDoc("default")).toBeDefined();
    expect(getFilterDoc("safe")).toBeDefined();
    expect(getFilterDoc("upper")).toBeDefined();
  });

  it("returns undefined for unknown filters", () => {
    expect(getFilterDoc("not_a_filter")).toBeUndefined();
    expect(getFilterDoc("")).toBeUndefined();
  });
});
