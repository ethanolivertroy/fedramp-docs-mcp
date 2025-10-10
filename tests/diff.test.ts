import { beforeAll, describe, expect, it } from "vitest";

import { buildIndex } from "../src/indexer.js";
import { diffFrmrDocuments } from "../src/diff.js";

beforeAll(async () => {
  await buildIndex(true);
});

describe("diff", () => {
  it("detects added and modified items", () => {
    const diff = diffFrmrDocuments(
      "FRMR.KSI.previous.json",
      "FRMR.KSI.sample.json",
    );
    expect(diff.summary.added).toBeGreaterThanOrEqual(1);
    expect(diff.summary.modified).toBeGreaterThanOrEqual(1);
    const addedIds = diff.changes
      .filter((change) => change.type === "added")
      .map((change) => change.id);
    expect(addedIds).toContain("KSI-002");
  });
});
