import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { ensureRepoReady, getRepoPath } from "../src/repo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureRepo = path.resolve(__dirname, "fixtures", "repo");

describe("repo", () => {
  it("resolves to the fixture repository path", async () => {
    const repoPath = await ensureRepoReady();
    expect(path.resolve(repoPath)).toBe(fixtureRepo);
    expect(getRepoPath()).toBe(repoPath);
  });
});
