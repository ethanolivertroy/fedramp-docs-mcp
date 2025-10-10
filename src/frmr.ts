import type {
  ControlMapping,
  FrmrDocumentMeta,
  FrmrDocumentType,
  FrmrSummary,
  KsiItem,
} from "./types.js";
import { createError } from "./util.js";
import {
  getControlMappings,
  getFrmrDocuments,
  getKsiItems,
  resolveFrmrDocument,
} from "./indexer.js";

export function listFrmrDocuments(): FrmrDocumentMeta[] {
  return getFrmrDocuments().map(
    ({ raw, rawText, topLevelKeys, idKey, ...meta }) => meta,
  );
}

export function getFrmrDocument(
  type: FrmrDocumentType | undefined,
  path: string,
): { meta: FrmrDocumentMeta; rawJson: string; summary: FrmrSummary } {
  const doc = resolveFrmrDocument(path);
  if (!doc) {
    throw createError({
      code: "NOT_FOUND",
      message: `FRMR document not found at path ${path}`,
    });
  }
  if (type && doc.type !== type) {
    throw createError({
      code: "BAD_REQUEST",
      message: `Requested type ${type} does not match document type ${doc.type}`,
    });
  }
  const { rawText, topLevelKeys } = doc;
  const meta: FrmrDocumentMeta = {
    type: doc.type,
    title: doc.title,
    version: doc.version,
    published: doc.published,
    path: doc.path,
    idHint: doc.idHint,
    itemCount: doc.itemCount,
  };
  const summary: FrmrSummary = {
    countItems: doc.itemCount,
    topLevelKeys,
  };
  return { meta, rawJson: rawText, summary };
}

export interface ListKsiOptions {
  id?: string;
  text?: string;
  category?: string;
  status?: string;
  limit: number;
  offset: number;
}

function textMatches(haystack: string | undefined, needle: string): boolean {
  if (!haystack) {
    return false;
  }
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export function listKsiItems(
  options: ListKsiOptions,
): { total: number; items: KsiItem[] } {
  const all = getKsiItems();
  const filtered = all.filter((item) => {
    if (options.id && item.id !== options.id) {
      return false;
    }
    if (
      options.text &&
      !(
        textMatches(item.title, options.text) ||
        textMatches(item.description, options.text)
      )
    ) {
      return false;
    }
    if (
      options.category &&
      !textMatches(item.category, options.category)
    ) {
      return false;
    }
    if (
      options.status &&
      options.status !== item.status
    ) {
      return false;
    }
    return true;
  });
  const total = filtered.length;
  const items = filtered.slice(options.offset, options.offset + options.limit);
  return { total, items };
}

export function getKsiItem(id: string): KsiItem {
  const match = getKsiItems().find((item) => item.id === id);
  if (!match) {
    throw createError({
      code: "NOT_FOUND",
      message: `KSI item not found for id ${id}`,
    });
  }
  return match;
}

export interface ListControlOptions {
  family?: string;
  control?: string;
  source?: FrmrDocumentType;
}

export function listControlMappings(
  options: ListControlOptions,
): ControlMapping[] {
  return getControlMappings().filter((mapping) => {
    if (options.source && mapping.source !== options.source) {
      return false;
    }
    if (options.family) {
      const family = mapping.control.split("-")[0];
      if (!family.startsWith(options.family.toUpperCase())) {
        return false;
      }
    }
    if (options.control) {
      const expected = options.control.toUpperCase();
      const controlId = mapping.control.toUpperCase();
      if (
        !(
          controlId === expected ||
          controlId.startsWith(`${expected}-`) ||
          expected.startsWith(controlId)
        )
      ) {
        return false;
      }
    }
    return true;
  });
}
