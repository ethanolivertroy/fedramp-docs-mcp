/**
 * Integration tests – validate the indexer against the real upstream FedRAMP/docs repo.
 *
 * Run via:  npm run test:integration
 *
 * These tests clone/use a real copy of the upstream repo (set FEDRAMP_DOCS_PATH to
 * skip the clone) and verify that the indexer can parse the current upstream data
 * without errors.
 */
import { beforeAll, describe, expect, it } from "vitest";

import {
  buildIndex,
  getControlMappings,
  getFrmrDocuments,
  getIndexErrors,
  getKsiItems,
} from "../src/indexer.js";
import { ensureRepoReady, getRepoInfo } from "../src/repo.js";

const KNOWN_FRMR_TYPES = new Set([
  "KSI",
  "MAS",
  "VDR",
  "SCN",
  "FRD",
  "ADS",
  "CCM",
  "FSI",
  "ICP",
  "PVA",
  "SCG",
  "UCM",
  "unknown",
]);

beforeAll(async () => {
  await ensureRepoReady();
  await buildIndex(true);
});

describe("integration: upstream FedRAMP docs", () => {
  it("indexes FRMR documents from upstream", () => {
    const docs = getFrmrDocuments();
    expect(docs.length).toBeGreaterThan(0);
  });

  it("extracts KSI items with valid IDs", () => {
    const items = getKsiItems();
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.id).toBeTruthy();
      expect(typeof item.id).toBe("string");
    }
  });

  it("populates control mappings", () => {
    const mappings = getControlMappings();
    expect(mappings.length).toBeGreaterThan(0);
    for (const mapping of mappings) {
      expect(mapping.control).toMatch(/^[A-Z]{2}-\d+$/);
    }
  });

  it("only produces known FRMR document types", () => {
    const docs = getFrmrDocuments();
    const unknownTypes = docs
      .map((d) => d.type)
      .filter((t) => !KNOWN_FRMR_TYPES.has(t));
    expect(unknownTypes).toEqual([]);
  });

  it("getIndexErrors returns an array", () => {
    const errors = getIndexErrors();
    expect(Array.isArray(errors)).toBe(true);
  });

  it("repo info is available after indexing", async () => {
    const info = await getRepoInfo();
    expect(info).not.toBeNull();
    expect(info?.commitHash).toBeTruthy();
  });
});
