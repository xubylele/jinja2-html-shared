import {
  formatMacroSignatureLabel,
  formatMacroSnippet,
  parseMacroCallContext,
  isInPrintContext,
  computeActiveParameter,
} from "../src/macro-intellisense";
import type { MacroParam } from "../src/templateRelations";

const params: MacroParam[] = [
  { name: "title", hasDefault: false },
  { name: "body", hasDefault: true },
];

describe("formatMacroSignatureLabel", () => {
  it("renders required and defaulted params", () => {
    expect(formatMacroSignatureLabel("card", params)).toBe("card(title, body = …)");
  });

  it("handles empty params", () => {
    expect(formatMacroSignatureLabel("foo", [])).toBe("foo()");
  });
});

describe("formatMacroSnippet", () => {
  it("emits indexed snippet placeholders", () => {
    expect(formatMacroSnippet("card", params)).toBe("card(${1:title}, ${2:body})");
  });

  it("handles empty params", () => {
    expect(formatMacroSnippet("foo", [])).toBe("foo()");
  });
});

describe("parseMacroCallContext", () => {
  it("parses bare macro call", () => {
    expect(parseMacroCallContext("{{ card(")).toEqual({ macroName: "card" });
  });

  it("parses namespaced macro call", () => {
    expect(parseMacroCallContext("{{ forms.card(")).toEqual({
      macroName: "card",
      namespace: "forms",
    });
  });

  it("returns null when no call site at end", () => {
    expect(parseMacroCallContext("{{ card ")).toBeNull();
    expect(parseMacroCallContext("")).toBeNull();
  });
});

describe("isInPrintContext", () => {
  it("true when {{ is open", () => {
    expect(isInPrintContext("hello {{ ca")).toBe(true);
  });

  it("false when }} closes", () => {
    expect(isInPrintContext("{{ x }} after")).toBe(false);
  });

  it("false when no {{", () => {
    expect(isInPrintContext("plain text")).toBe(false);
  });

  it("false when {% interrupts", () => {
    expect(isInPrintContext("{{ a {% b ")).toBe(false);
  });
});

describe("computeActiveParameter", () => {
  it("returns 0 before the first comma", () => {
    expect(computeActiveParameter("{{ card(")).toBe(0);
    expect(computeActiveParameter("{{ card(title")).toBe(0);
  });

  it("counts commas at top depth", () => {
    expect(computeActiveParameter("{{ card(title, ")).toBe(1);
    expect(computeActiveParameter("{{ card(title, body, ")).toBe(2);
  });

  it("resets on nested brackets", () => {
    expect(computeActiveParameter("{{ card(title, [1,2,3], ")).toBe(0);
  });

  it("returns 0 when no open paren", () => {
    expect(computeActiveParameter("{{ card")).toBe(0);
  });
});
