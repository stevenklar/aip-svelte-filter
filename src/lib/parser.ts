// Google API Filter Parser using Peggy (AIP-160)
// @ts-expect-error: no types for Peggy output
import { parse as filterParse } from "../../filter-peg.js";

export interface ParseResult {
  isSuccess: boolean;
  errors?: string[];
  ast?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// Parse Google API filter using Peggy
export function parse(input: string): ParseResult {
  try {
    const ast = filterParse(input);
    return { isSuccess: true, ast };
  } catch (error) {
    return {
      isSuccess: false,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

export function prettyPrintAst(node: any, indent = 0): string {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  if (node == null) return "";
  const pad = "  ".repeat(indent);
  if (typeof node !== "object") return pad + String(node);
  if (Array.isArray(node)) {
    return node.map((n) => prettyPrintAst(n, indent)).join("\n");
  }
  let out = "";
  if (node.type) {
    out += pad + node.type;
    if (node.field) out += ` (${node.field})`;
    if (node.op) out += ` [${node.op}]`;
    if (node.value !== undefined && typeof node.value !== "object")
      out += `: ${JSON.stringify(node.value)}`;
    out += "\n";
  }
  for (const key of Object.keys(node)) {
    if (["type", "field", "op", "value"].includes(key)) continue;
    out += prettyPrintAst(node[key], indent + 1);
  }
  if (node.value && typeof node.value === "object") {
    out += prettyPrintAst(node.value, indent + 1);
  }
  return out;
}

export function summarizeGrammar(ast: any): string {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!ast) return "No filter applied";

  function describe(node: any): string {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!node) return "";

    // Handle primitive values
    if (typeof node !== "object") {
      return String(node);
    }

    // Handle arrays
    if (Array.isArray(node)) {
      return node.map(describe).filter(Boolean).join(", ");
    }

    // Handle different node types based on our actual grammar
    switch (node.type) {
      case "comp": {
        // Comparison expressions (field op value)
        const field = formatFieldName(node.field);
        const operator = humanizeOperator(node.op);
        const value = formatValue(node.value);
        return `${field} ${operator} ${value}`;
      }

      case "has": {
        // Colon operator expressions (field : value)
        const hasField = formatFieldName(node.field);
        const hasValue = formatValue(node.value);
        return `${hasField} contains ${hasValue}`;
      }

      case "and":
        return handleAndOperator(node);

      case "or":
        return handleOrOperator(node);

      case "not":
        return handleNotOperator(node);

      default:
        return handleUnknownNode(node);
    }
  }

  function formatFieldName(field: any): string {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (typeof field === "string") {
      // Convert snake_case or camelCase to human readable
      return field
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .toLowerCase();
    }
    return String(field);
  }

  function humanizeOperator(op: string): string {
    const operators: Record<string, string> = {
      "=": "is",
      "!=": "is not",
      ">": "is greater than",
      ">=": "is at least",
      "<": "is less than",
      "<=": "is at most",
    };
    return operators[op] || op;
  }

  function formatValue(value: any): string {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") {
      // Add quotes for string values, but make them more readable
      return value.includes(" ") ? `"${value}"` : value;
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (Array.isArray(value)) {
      return `[${value.map(formatValue).join(", ")}]`;
    }
    return String(value);
  }

  function handleAndOperator(node: any): string {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const left = describe(node.left);
    const right = describe(node.right);

    const parts = [left, right].filter(Boolean);
    return parts.join(" and ");
  }

  function handleOrOperator(node: any): string {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const left = describe(node.left);
    const right = describe(node.right);

    const parts = [left, right].filter(Boolean);
    return parts.join(" or ");
  }

  function handleNotOperator(node: any): string {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const child = describe(node.expr);

    if (!child) {
      return "(empty not expression)";
    }

    // Make negation more natural
    if (child.includes(" is ")) {
      return child.replace(" is ", " is not ");
    }
    if (child.includes(" contains ")) {
      return child.replace(" contains ", " does not contain ");
    }

    return `not (${child})`;
  }

  function handleUnknownNode(node: any): string {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // Try to extract meaningful information from unknown nodes
    if (node.value !== undefined && typeof node.value !== "object") {
      return formatValue(node.value);
    }

    // Look for any meaningful properties
    const meaningfulProps = Object.keys(node).filter(
      (key) => key !== "type" && node[key] !== undefined && node[key] !== null,
    );

    if (meaningfulProps.length === 0) {
      return "";
    }

    // Try to describe based on available properties
    const descriptions = meaningfulProps
      .map((key) => {
        const value = node[key];
        if (typeof value === "object") {
          return describe(value);
        }
        return `${key}: ${formatValue(value)}`;
      })
      .filter(Boolean);

    return descriptions.length > 0 ? descriptions.join(", ") : "";
  }

  return describe(ast);
}
