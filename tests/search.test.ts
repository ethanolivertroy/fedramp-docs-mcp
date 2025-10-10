import { beforeAll, describe, expect, it } from "vitest";

import { buildIndex } from "../src/indexer.js";
import {
  getSignificantChangeGuidance,
  grepControlsInMarkdown,
  searchMarkdown,
} from "../src/search.js";

beforeAll(async () => {
  await buildIndex(true);
});

describe("search", () => {
  it("finds markdown content", () => {
    const result = searchMarkdown("Significant Change", 10, 0);
    expect(result.total).toBeGreaterThan(0);
    expect(result.hits[0]?.path).toContain("significant-change");
  });

  it("finds control references with enhancements", () => {
    const matches = grepControlsInMarkdown("SC-7", true);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]?.snippet).toMatch(/SC-7/);
  });

  it("aggregates significant change guidance", () => {
    const guidance = getSignificantChangeGuidance(5);
    expect(guidance.sources.length).toBeGreaterThan(0);
    expect(guidance.sources.some((source) => source.type === "FRMR")).toBe(true);
    expect(guidance.sources.some((source) => source.type === "markdown")).toBe(true);
  });
});
