import crypto from "node:crypto";

import type { ErrorDetail, ToolExecutionError } from "./types.js";

export function envBoolean(
  key: string,
  defaultValue: boolean,
): boolean {
  const value = process.env[key];
  if (typeof value === "undefined" || value === "") {
    return defaultValue;
  }
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function envString(
  key: string,
  defaultValue?: string,
): string | undefined {
  const value = process.env[key];
  if (typeof value === "undefined" || value === "") {
    return defaultValue;
  }
  return value;
}

export function sha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function createError(detail: ErrorDetail): ToolExecutionError {
  const error = new Error(detail.message) as ToolExecutionError;
  error.detail = detail;
  return error;
}

export function isToolExecutionError(
  error: unknown,
): error is ToolExecutionError {
  return (
    error instanceof Error &&
    typeof (error as ToolExecutionError).detail !== "undefined"
  );
}

export function guessFrmrTypeFromFilename(filename: string): string {
  const match = filename.match(/^FRMR\.([A-Z]+)\./i);
  if (match) {
    return match[1].toUpperCase();
  }
  return "unknown";
}

export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

export function detectIdKey(obj: unknown): string | null {
  if (!Array.isArray(obj)) {
    return null;
  }
  const keys = ["id", "uid", "name"];
  for (const key of keys) {
    if (obj.some((item) => item && typeof item === "object" && key in item)) {
      return key;
    }
  }
  return null;
}

/**
 * Case-insensitive field lookup. Searches object keys for any of the provided
 * field names, ignoring case. Returns the first match found.
 */
export function getFieldCI<T>(
  obj: Record<string, unknown>,
  ...names: string[]
): T | undefined {
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();
    for (const name of names) {
      if (keyLower === name.toLowerCase()) {
        return value as T;
      }
    }
  }
  return undefined;
}

/**
 * Check if a key matches known item array patterns (case-insensitive).
 * Patterns: items, entries, records, controls, requirements, indicators, definitions, rules, mappings, ALL
 */
const ITEM_ARRAY_PATTERNS = [
  /^(items?|entries|records|controls)$/i,
  /^(requirements?|indicators?)$/i,
  /^(definitions?|rules?|mappings?)$/i,
  /^all$/i,
];

export function isItemArrayKey(key: string): boolean {
  return ITEM_ARRAY_PATTERNS.some((pattern) => pattern.test(key));
}

export function extractControlLikeStrings(input: unknown): string[] {
  if (typeof input === "string") {
    return findControlIds(input);
  }
  if (Array.isArray(input)) {
    return input.flatMap((value) => extractControlLikeStrings(value));
  }
  if (input && typeof input === "object") {
    return Object.values(input).flatMap((value) =>
      extractControlLikeStrings(value),
    );
  }
  return [];
}

const CONTROL_PATTERN =
  /\b([A-Za-z]{2}-\d{1,3}(?:(?:\.[\dA-Za-z]+)|(?:\([\dA-Za-z]+\)))*)\b/gi;

export function findControlIds(text: string): string[] {
  const matches = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = CONTROL_PATTERN.exec(text)) !== null) {
    matches.add(match[1].toUpperCase());
  }
  return [...matches];
}

export function unique<T>(values: Iterable<T>): T[] {
  return Array.from(new Set(values));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export interface Timer {
  stop: () => number;
}

export function startTimer(): Timer {
  const start = process.hrtime.bigint();
  return {
    stop: () => {
      const diff = process.hrtime.bigint() - start;
      return Number(diff) / 1_000_000; // ms
    },
  };
}
