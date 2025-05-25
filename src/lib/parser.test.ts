import { describe, it, expect, beforeAll } from "vitest";
import { parse, prettyPrintAst, summarizeGrammar } from "./parser.js";

// The grammar needs to be built before tests can run
beforeAll(async () => {
  // Grammar should be built by npm run build:grammar in the test script
});

describe("parse", () => {
  it("should parse simple equality filter", () => {
    const result = parse('name = "john"');
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
    expect(result.errors).toBeUndefined();
  });

  it("should parse field contains filter", () => {
    const result = parse('title : "manager"');
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse comparison operators", () => {
    const operators = ["=", "!=", ">", ">=", "<", "<="];
    operators.forEach((op) => {
      const result = parse(`age ${op} 25`);
      expect(result.isSuccess).toBe(true);
      expect(result.ast).toBeDefined();
    });
  });

  it("should parse AND expressions", () => {
    const result = parse('name = "john" AND age > 25');
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse OR expressions", () => {
    const result = parse('status = "active" OR status = "pending"');
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse NOT expressions", () => {
    const result = parse('NOT status = "deleted"');
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse negative expressions with dash", () => {
    const result = parse('- status = "deleted"');
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse grouped expressions", () => {
    const result = parse('(name = "john" OR name = "jane") AND age > 18');
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse colon operator for containment", () => {
    const result = parse('tags : "urgent"');
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse numeric values", () => {
    const result = parse("count = 42");
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse decimal numbers", () => {
    const result = parse("price = 29.99");
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse scientific notation", () => {
    const result = parse("value = 1.5e10");
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse boolean values", () => {
    const result = parse("is_active = true");
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse false boolean", () => {
    const result = parse("is_deleted = false");
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should handle empty input", () => {
    const result = parse("");
    expect(result.isSuccess).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors![0]).toContain("Expected");
  });

  it("should handle invalid syntax", () => {
    const result = parse('name = = "john"');
    expect(result.isSuccess).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it("should handle unclosed quotes", () => {
    const result = parse('name = "john');
    expect(result.isSuccess).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it("should handle nested complex expressions", () => {
    const result = parse(
      '(status = "active" AND (priority = "high" OR priority = "urgent")) AND created_date > "2023-01-01"',
    );
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse field names with dots", () => {
    const result = parse('user.profile.name = "john"');
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should parse identifiers as values", () => {
    const result = parse("status = active");
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should handle case insensitive operators", () => {
    const result = parse('name = "john" and age > 25 or status = "active"');
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it("should handle case insensitive NOT", () => {
    const result = parse('not status = "deleted"');
    expect(result.isSuccess).toBe(true);
    expect(result.ast).toBeDefined();
  });
});

describe("prettyPrintAst", () => {
  it("should handle null/undefined input", () => {
    expect(prettyPrintAst(null)).toBe("");
    expect(prettyPrintAst(undefined)).toBe("");
  });

  it("should handle primitive values", () => {
    expect(prettyPrintAst("test")).toBe("test");
    expect(prettyPrintAst(42)).toBe("42");
    expect(prettyPrintAst(true)).toBe("true");
  });

  it("should handle arrays", () => {
    const result = prettyPrintAst(["a", "b", "c"]);
    expect(result).toBe("a\nb\nc");
  });

  it("should format AST nodes with type", () => {
    const ast = {
      type: "comp",
      field: "name",
      op: "=",
      value: "john",
    };
    const result = prettyPrintAst(ast);
    expect(result).toContain('comp (name) [=]: "john"');
  });

  it("should handle nested objects with proper indentation", () => {
    const ast = {
      type: "and",
      left: {
        type: "comp",
        field: "name",
        op: "=",
        value: "john",
      },
      right: {
        type: "comp",
        field: "age",
        op: ">",
        value: 25,
      },
    };
    const result = prettyPrintAst(ast);
    expect(result).toContain("and");
    expect(result).toContain('  comp (name) [=]: "john"');
    expect(result).toContain("  comp (age) [>]: 25");
  });

  it("should format real parser output", () => {
    const parseResult = parse('name = "john"');
    if (parseResult.isSuccess) {
      const formatted = prettyPrintAst(parseResult.ast);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe("string");
    }
  });

  it("should handle nodes with object values", () => {
    const ast = {
      type: "custom",
      field: "metadata",
      value: {
        nested: "data",
        count: 42,
      },
    };
    const result = prettyPrintAst(ast);
    expect(result).toContain("custom (metadata)");
    expect(result).toContain("data");
    expect(result).toContain("42");
    // The object value should be processed recursively
    expect(result.length).toBeGreaterThan("custom (metadata)\n".length);
  });

  it("should handle nodes with additional properties", () => {
    const ast = {
      type: "test",
      field: "name",
      customProp: "value",
      anotherProp: {
        nested: true,
      },
    };
    const result = prettyPrintAst(ast);
    expect(result).toContain("test (name)");
    expect(result).toContain("value");
    expect(result).toContain("true");
    // Should process additional properties recursively
    expect(result.split("\n").length).toBeGreaterThan(1);
  });
});

describe("summarizeGrammar", () => {
  it("should handle null/undefined AST", () => {
    expect(summarizeGrammar(null)).toBe("No filter applied");
    expect(summarizeGrammar(undefined)).toBe("No filter applied");
  });

  it("should summarize simple comparison", () => {
    const parseResult = parse('name = "john"');
    if (parseResult.isSuccess) {
      const summary = summarizeGrammar(parseResult.ast);
      expect(summary).toContain("name");
      expect(summary).toContain("john");
    }
  });

  it("should humanize operators", () => {
    const tests = [
      { input: "age = 25", expected: "is" },
      { input: "age != 25", expected: "is not" },
      { input: "age > 25", expected: "greater than" },
      { input: "age >= 25", expected: "at least" },
      { input: "age < 25", expected: "less than" },
      { input: "age <= 25", expected: "at most" },
    ];

    tests.forEach((test) => {
      const parseResult = parse(test.input);
      if (parseResult.isSuccess) {
        const summary = summarizeGrammar(parseResult.ast);
        expect(summary).toContain(test.expected);
      }
    });
  });

  it("should handle colon operator", () => {
    const parseResult = parse('name : "john"');
    if (parseResult.isSuccess) {
      const summary = summarizeGrammar(parseResult.ast);
      // The colon operator should be handled in summarizeGrammar
      expect(summary).toBeTruthy();
      expect(summary).toContain("name");
      expect(summary).toContain("john");
    }
  });

  it("should format field names nicely", () => {
    const tests = [
      { input: 'created_date = "2023-01-01"', expected: "created date" },
      { input: 'firstName = "john"', expected: "first name" },
      { input: 'user_profile = "test"', expected: "user profile" },
    ];

    tests.forEach((test) => {
      const parseResult = parse(test.input);
      if (parseResult.isSuccess) {
        const summary = summarizeGrammar(parseResult.ast);
        expect(summary.toLowerCase()).toContain(test.expected);
      }
    });
  });

  it("should handle AND expressions", () => {
    const parseResult = parse('name = "john" AND age > 25');
    if (parseResult.isSuccess) {
      const summary = summarizeGrammar(parseResult.ast);
      expect(summary).toContain("and");
      expect(summary).toContain("name");
      expect(summary).toContain("age");
    }
  });

  it("should handle OR expressions", () => {
    const parseResult = parse('status = "active" OR status = "pending"');
    if (parseResult.isSuccess) {
      const summary = summarizeGrammar(parseResult.ast);
      expect(summary).toContain("or");
      expect(summary).toContain("status");
    }
  });

  it("should handle NOT expressions", () => {
    const parseResult = parse('NOT status = "deleted"');
    if (parseResult.isSuccess) {
      const summary = summarizeGrammar(parseResult.ast);
      expect(summary).toContain("not");
    }
  });

  it("should handle grouped expressions", () => {
    const parseResult = parse('(name = "john" OR name = "jane") AND age > 18');
    if (parseResult.isSuccess) {
      const summary = summarizeGrammar(parseResult.ast);
      expect(summary).toContain("name");
      expect(summary).toContain("age");
    }
  });

  it("should handle complex nested expressions", () => {
    const parseResult = parse(
      '(status = "active" AND priority = "high") OR (status = "pending" AND priority = "urgent")',
    );
    if (parseResult.isSuccess) {
      const summary = summarizeGrammar(parseResult.ast);
      expect(summary).toBeTruthy();
      expect(typeof summary).toBe("string");
      expect(summary.length).toBeGreaterThan(0);
    }
  });

  it("should handle boolean values", () => {
    const parseResult = parse("is_active = true");
    if (parseResult.isSuccess) {
      const summary = summarizeGrammar(parseResult.ast);
      expect(summary).toContain("true");
    }
  });

  it("should handle identifier values", () => {
    const parseResult = parse("status = active");
    if (parseResult.isSuccess) {
      const summary = summarizeGrammar(parseResult.ast);
      expect(summary).toContain("active");
    }
  });

  it("should handle non-object nodes in describe function", () => {
    // Test primitive values directly
    const summary1 = summarizeGrammar("simple string");
    expect(summary1).toBe("simple string");

    const summary2 = summarizeGrammar(42);
    expect(summary2).toBe("42");

    const summary3 = summarizeGrammar(true);
    expect(summary3).toBe("true");
  });

  it("should handle array nodes in describe function", () => {
    const arrayNode = ["first", "second", "third"];
    const summary = summarizeGrammar(arrayNode);
    expect(summary).toBe("first, second, third");
  });

  it("should handle unknown node types", () => {
    const unknownNode = {
      type: "unknown_type",
      customField: "test_value",
      anotherField: 123,
    };
    const summary = summarizeGrammar(unknownNode);
    expect(summary).toContain("customField: test_value");
    expect(summary).toContain("anotherField: 123");
  });

  it("should handle unknown nodes with object properties", () => {
    const unknownNode = {
      type: "unknown_type",
      objectProp: {
        type: "comp",
        field: "nested",
        op: "=",
        value: "test",
      },
    };
    const summary = summarizeGrammar(unknownNode);
    expect(summary).toContain("nested");
    expect(summary).toContain("test");
  });

  it("should handle unknown nodes with only value property", () => {
    const unknownNode = {
      type: "unknown_type",
      value: "direct_value",
    };
    const summary = summarizeGrammar(unknownNode);
    expect(summary).toBe("direct_value");
  });

  it("should handle non-string field names", () => {
    const nodeWithNumericField = {
      type: "comp",
      field: 123,
      op: "=",
      value: "test",
    };
    const summary = summarizeGrammar(nodeWithNumericField);
    expect(summary).toContain("123");
  });

  it("should handle array values in formatValue", () => {
    const nodeWithArrayValue = {
      type: "comp",
      field: "tags",
      op: "=",
      value: ["tag1", "tag2", "tag3"],
    };
    const summary = summarizeGrammar(nodeWithArrayValue);
    expect(summary).toContain("[tag1, tag2, tag3]");
  });

  it("should handle nested arrays in formatValue", () => {
    const nodeWithNestedArray = {
      type: "comp",
      field: "matrix",
      op: "=",
      value: [
        ["a", "b"],
        ["c", "d"],
      ],
    };
    const summary = summarizeGrammar(nodeWithNestedArray);
    expect(summary).toContain("[[a, b], [c, d]]");
  });

  it("should handle empty NOT expressions", () => {
    const emptyNotNode = {
      type: "not",
      expr: null,
    };
    const summary = summarizeGrammar(emptyNotNode);
    expect(summary).toBe("(empty not expression)");
  });

  it("should handle NOT expressions with empty string", () => {
    const emptyNotNode = {
      type: "not",
      expr: "",
    };
    const summary = summarizeGrammar(emptyNotNode);
    expect(summary).toBe("(empty not expression)");
  });

  it("should handle has operator (colon) in summarizeGrammar", () => {
    // Create a mock AST node for has operator since we need to test the case
    const hasNode = {
      type: "has",
      field: "tags",
      value: "urgent",
    };
    const summary = summarizeGrammar(hasNode);
    expect(summary).toBe("tags contains urgent");
  });

  it("should handle NOT with contains expression", () => {
    const notContainsNode = {
      type: "not",
      expr: {
        type: "has",
        field: "tags",
        value: "spam",
      },
    };
    const summary = summarizeGrammar(notContainsNode);
    expect(summary).toBe("tags does not contain spam");
  });

  it("should handle unknown nodes with empty meaningful properties", () => {
    const emptyUnknownNode = {
      type: "unknown_type",
    };
    const summary = summarizeGrammar(emptyUnknownNode);
    expect(summary).toBe("");
  });

  it("should handle NOT with expressions that don't contain 'is' or 'contains'", () => {
    // Create a NOT node with a child that doesn't have "is" or "contains" in its description
    const notNode = {
      type: "not",
      expr: {
        type: "unknown_type",
        customField: "test_value",
      },
    };
    const summary = summarizeGrammar(notNode);
    expect(summary).toBe("not (customField: test_value)");
  });
});
