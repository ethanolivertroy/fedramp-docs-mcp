import { beforeEach, describe, expect, it } from "vitest";

import {
  buildIndex,
  getControlMappings,
  getFrmrDocuments,
  getKsiItems,
  getMarkdownDoc,
} from "../src/indexer.js";

beforeEach(async () => {
  await buildIndex(true);
});

describe("indexer", () => {
  it("indexes FRMR documents with metadata", () => {
    const docs = getFrmrDocuments();
    expect(docs.length).toBeGreaterThanOrEqual(3);
    const ksiDoc = docs.find((doc) => doc.type === "KSI");
    expect(ksiDoc).toBeDefined();
    expect(ksiDoc?.itemCount).toBeGreaterThan(0);
  });

  it("extracts KSI items", () => {
    const items = getKsiItems();
    const ids = items.map((item) => item.id);
    expect(ids).toContain("KSI-001");
    expect(ids).toContain("KSI-002");
  });

  it("extracts control mappings", () => {
    const mappings = getControlMappings();
    const controls = mappings.map((mapping) => mapping.control);
    expect(controls).toContain("SC-13");
  });

  it("indexes markdown files", () => {
    const doc = getMarkdownDoc("markdown/significant-change/overview.md");
    expect(doc).toBeDefined();
    expect(doc?.content).toContain("Significant Change Request");
  });
});
