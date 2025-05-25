import { describe, it, expect, beforeAll } from "vitest";
import {
  parse,
  prettyPrintAst,
  summarizeGrammar,
  type ParseResult,
} from "./index.js";

// The grammar needs to be built before tests can run
beforeAll(async () => {
  // Grammar should be built by npm run build:grammar in the test script
});

describe("aip-svelte-filter integration", () => {
  it("should export all expected functions", () => {
    expect(typeof parse).toBe("function");
    expect(typeof prettyPrintAst).toBe("function");
    expect(typeof summarizeGrammar).toBe("function");
  });

  it("should handle complete workflow", () => {
    const filter = 'user.name = "john" AND status : "active"';

    // Parse the filter
    const result: ParseResult = parse(filter);
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
    expect(result.errors).toBeUndefined();

    // Pretty print the AST
    const prettyAst = prettyPrintAst(result.ast);
    expect(prettyAst).toBeTruthy();
    expect(typeof prettyAst).toBe("string");

    // Summarize the grammar
    const summary = summarizeGrammar(result.ast);
    expect(summary).toBeTruthy();
    expect(typeof summary).toBe("string");
    expect(summary).toContain("user");
    expect(summary).toContain("status");
  });

  it("should handle error cases gracefully", () => {
    const invalidFilter = "invalid syntax ===";

    const result: ParseResult = parse(invalidFilter);
    expect(result.isSuccess).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
    expect(result.ast).toBeUndefined();

    // Functions should handle undefined/null AST
    const prettyAst = prettyPrintAst(result.ast);
    expect(prettyAst).toBe("");

    const summary = summarizeGrammar(result.ast);
    expect(summary).toBe("No filter applied");
  });

  it("should maintain consistency across all exports", () => {
    const filters = [
      'name = "test"',
      'age > 18 AND status = "active"',
      "NOT deleted = true",
      '(priority = "high" OR priority = "urgent") AND created_date > "2023-01-01"',
      'tags : "important"',
    ];

    filters.forEach((filter) => {
      const result = parse(filter);
      expect(result.isSuccess).toBe(true);

      if (result.isSuccess) {
        const prettyAst = prettyPrintAst(result.ast);
        const summary = summarizeGrammar(result.ast);

        expect(prettyAst).toBeTruthy();
        expect(summary).toBeTruthy();
        expect(summary).not.toBe("No filter applied");
      }
    });
  });

  it("should handle edge cases", () => {
    const edgeCases = [
      "",
      "   ",
      "field = true",
      "field = false",
      "field = 0",
      'field = ""',
      "field = identifier",
    ];

    edgeCases.forEach((filter) => {
      const result = parse(filter);

      // Even if parsing fails, functions should not throw
      expect(() => {
        prettyPrintAst(result.ast);
        summarizeGrammar(result.ast);
      }).not.toThrow();
    });
  });
});
