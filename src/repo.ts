import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import fse from "fs-extra";
import { simpleGit } from "simple-git";

import { createError, envBoolean, envString, normalizePath } from "./util.js";

let resolvedRepoPath: string | null = null;

const DEFAULT_REMOTE = "https://github.com/FedRAMP/docs";
const DEFAULT_BRANCH = "main";

function getCachePath(): string {
  return path.join(os.homedir(), ".cache", "fedramp-docs");
}

export interface RepoConfig {
  repoPath: string;
  remote: string;
  branch: string;
  allowAutoClone: boolean;
}

export function getRepoConfig(): RepoConfig {
  const repoPath =
    envString("FEDRAMP_DOCS_PATH") ??
    normalizePath(path.resolve(getCachePath()));

  return {
    repoPath,
    remote: envString("FEDRAMP_DOCS_REMOTE", DEFAULT_REMOTE) ?? DEFAULT_REMOTE,
    branch: envString("FEDRAMP_DOCS_BRANCH", DEFAULT_BRANCH) ?? DEFAULT_BRANCH,
    allowAutoClone: envBoolean("FEDRAMP_DOCS_ALLOW_AUTO_CLONE", true),
  };
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fse.access(targetPath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function cloneRepoIfNeeded(config: RepoConfig): Promise<void> {
  if (await pathExists(config.repoPath)) {
    return;
  }

  if (!config.allowAutoClone) {
    throw createError({
      code: "REPO_CLONE_FAILED",
      message:
        "FedRAMP docs repository not found locally and auto clone is disabled.",
      hint:
        "Set FEDRAMP_DOCS_PATH to a local clone or enable FEDRAMP_DOCS_ALLOW_AUTO_CLONE=1.",
    });
  }

  await fse.ensureDir(path.dirname(config.repoPath));

  const git = simpleGit();
  try {
    await git.clone(config.remote, config.repoPath, [
      "--depth",
      "1",
      "--branch",
      config.branch,
    ]);
  } catch (error) {
    throw createError({
      code: "REPO_CLONE_FAILED",
      message: `Failed to clone FedRAMP docs repository: ${(error as Error).message}`,
      hint:
        "Check network connectivity or set FEDRAMP_DOCS_PATH to an existing local checkout.",
    });
  }
}

async function shouldUpdateRepo(repoPath: string): Promise<boolean> {
  const autoUpdate = envBoolean("FEDRAMP_DOCS_AUTO_UPDATE", true);
  if (!autoUpdate) {
    return false;
  }

  const maxAgeHours = parseInt(
    envString("FEDRAMP_DOCS_UPDATE_CHECK_HOURS", "24") ?? "24",
    10,
  );

  try {
    const gitDir = path.join(repoPath, ".git");

    if (!(await pathExists(gitDir))) {
      return false; // Not a git repo, can't update
    }

    // Check last fetch time from FETCH_HEAD
    const fetchHeadPath = path.join(gitDir, "FETCH_HEAD");
    if (await pathExists(fetchHeadPath)) {
      const stats = await fse.stat(fetchHeadPath);
      const ageHours =
        (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
      if (ageHours < maxAgeHours) {
        return false; // Recently updated
      }
    }

    return true;
  } catch {
    return false; // Error checking, skip update
  }
}

async function updateRepo(repoPath: string): Promise<void> {
  try {
    const git = simpleGit(repoPath);
    await git.fetch(["origin"]);
    await git.reset(["--hard", "origin/main"]);
    console.error(
      `fedramp-docs-mcp: Updated repository at ${repoPath}`,
    );
  } catch (error) {
    console.error(
      `fedramp-docs-mcp: Failed to update repository: ${(error as Error).message}`,
    );
    // Don't throw - continue with existing cache
  }
}

export async function ensureRepoReady(): Promise<string> {
  if (resolvedRepoPath) {
    return resolvedRepoPath;
  }

  const config = getRepoConfig();

  if (await pathExists(config.repoPath)) {
    resolvedRepoPath = config.repoPath;

    // Check if we should update the repo
    if (await shouldUpdateRepo(config.repoPath)) {
      await updateRepo(config.repoPath);
    }

    return resolvedRepoPath;
  }

  await cloneRepoIfNeeded(config);
  resolvedRepoPath = config.repoPath;

  return resolvedRepoPath;
}

export async function forceUpdateRepo(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const repoPath = getRepoPath();
    await updateRepo(repoPath);
    return {
      success: true,
      message: `Successfully updated repository at ${repoPath}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update repository: ${(error as Error).message}`,
    };
  }
}

export function getRepoPath(): string {
  if (!resolvedRepoPath) {
    throw new Error("Repository path not resolved. Call ensureRepoReady first.");
  }
  return resolvedRepoPath;
}

export function resolveRepoPath(relativePath: string): string {
  return path.join(getRepoPath(), relativePath);
}

export interface RepoInfoResult {
  commitHash: string;
  commitDate: string;
  lastFetchedAt?: string;
}

export async function getRepoInfo(): Promise<RepoInfoResult | null> {
  try {
    const repoPath = getRepoPath();
    const git = simpleGit(repoPath);

    // Get current commit info
    const log = await git.log({ maxCount: 1 });
    if (!log.latest) {
      return null;
    }

    const result: RepoInfoResult = {
      commitHash: log.latest.hash.substring(0, 7),
      commitDate: log.latest.date,
    };

    // Get last fetch time from FETCH_HEAD
    const fetchHeadPath = path.join(repoPath, ".git", "FETCH_HEAD");
    try {
      const stats = await fse.stat(fetchHeadPath);
      result.lastFetchedAt = stats.mtime.toISOString();
    } catch {
      // FETCH_HEAD may not exist if never fetched
    }

    return result;
  } catch {
    return null;
  }
}

export interface AutoUpdateConfigResult {
  enabled: boolean;
  checkIntervalHours: number;
}

export function getAutoUpdateConfig(): AutoUpdateConfigResult {
  return {
    enabled: envBoolean("FEDRAMP_DOCS_AUTO_UPDATE", true),
    checkIntervalHours: parseInt(
      envString("FEDRAMP_DOCS_UPDATE_CHECK_HOURS", "24") ?? "24",
      10,
    ),
  };
}
