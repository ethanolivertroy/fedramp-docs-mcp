import stringify from "fast-json-stable-stringify";

import { resolveFrmrDocument } from "./indexer.js";
import type { DiffChange, DiffResult, FrmrDocumentRecord } from "./types.js";
import { createError } from "./util.js";

interface DiffOptions {
  idKey?: string;
}

function extractItems(
  doc: FrmrDocumentRecord,
): Array<Record<string, unknown>> {
  const raw = doc.raw as Record<string, unknown>;
  const candidates = [
    raw.items,
    raw.controls,
    raw.entries,
    raw.records,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item && typeof item === "object"),
      );
    }
  }
  return [];
}

function getIdKey(
  options: DiffOptions,
  left: FrmrDocumentRecord,
  right: FrmrDocumentRecord,
): string {
  if (options.idKey) {
    return options.idKey;
  }
  if (left.idKey && right.idKey && left.idKey === right.idKey) {
    return left.idKey;
  }
  return left.idKey ?? right.idKey ?? "id";
}

function toMap(
  items: Array<Record<string, unknown>>,
  idKey: string,
): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>();
  for (const item of items) {
    const id = item[idKey];
    if (typeof id === "string") {
      map.set(id, item);
    }
  }
  return map;
}

function detectChangedFields(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  idKey: string,
): string[] {
  const keys = new Set([
    ...Object.keys(left),
    ...Object.keys(right),
  ]);
  keys.delete(idKey);
  const changed: string[] = [];
  for (const key of keys) {
    const leftValue = left[key];
    const rightValue = right[key];
    if (stringify(leftValue) !== stringify(rightValue)) {
      changed.push(key);
    }
  }
  return changed;
}

export function diffFrmrDocuments(
  leftPath: string,
  rightPath: string,
  options: DiffOptions = {},
): DiffResult {
  const leftDoc = resolveFrmrDocument(leftPath);
  const rightDoc = resolveFrmrDocument(rightPath);
  if (!leftDoc || !rightDoc) {
    throw createError({
      code: "NOT_FOUND",
      message: "One or both FRMR documents could not be found in the index.",
    });
  }

  const idKey = getIdKey(options, leftDoc, rightDoc);

  const leftItems = extractItems(leftDoc);
  const rightItems = extractItems(rightDoc);

  const leftMap = toMap(leftItems, idKey);
  const rightMap = toMap(rightItems, idKey);

  const changes: DiffChange[] = [];

  for (const [id, rightValue] of rightMap.entries()) {
    if (!leftMap.has(id)) {
      changes.push({
        type: "added",
        id,
        title:
          typeof rightValue.title === "string" ? rightValue.title : undefined,
      });
    }
  }

  for (const [id, leftValue] of leftMap.entries()) {
    if (!rightMap.has(id)) {
      changes.push({
        type: "removed",
        id,
        title:
          typeof leftValue.title === "string" ? leftValue.title : undefined,
      });
      continue;
    }
    const rightValue = rightMap.get(id)!;
    const fields = detectChangedFields(leftValue, rightValue, idKey);
    if (fields.length) {
      changes.push({
        type: "modified",
        id,
        title:
          typeof rightValue.title === "string"
            ? rightValue.title
            : typeof leftValue.title === "string"
              ? leftValue.title
              : undefined,
        fields,
      });
    }
  }

  const summary = {
    added: changes.filter((change) => change.type === "added").length,
    removed: changes.filter((change) => change.type === "removed").length,
    modified: changes.filter((change) => change.type === "modified").length,
  };

  return {
    summary,
    changes,
  };
}
