import escapeStringRegexp from "escape-string-regexp";
import lunr from "lunr";

import {
  getFrmrDocuments,
  getIndexErrors,
  getIndexState,
  getMarkdownDoc,
  getMarkdownIndex,
} from "./indexer.js";
import { getAutoUpdateConfig, getRepoInfo } from "./repo.js";
import type {
  AutoUpdateConfig,
  MarkdownDoc,
  MarkdownSearchHit,
  MarkdownSearchResult,
  RepoInfo,
} from "./types.js";
import { clamp, createError, unique } from "./util.js";

function findLineAndSnippet(
  doc: MarkdownDoc,
  query: string,
): { line: number; snippet: string } {
  const regex = new RegExp(escapeStringRegexp(query), "i");
  for (let index = 0; index < doc.lines.length; index += 1) {
    const line = doc.lines[index];
    if (regex.test(line)) {
      const snippet = line.trim();
      return { line: index + 1, snippet };
    }
  }
  return { line: 1, snippet: doc.lines[0]?.slice(0, 200) ?? "" };
}

export function searchMarkdown(
  query: string,
  limit: number,
  offset: number,
): MarkdownSearchResult {
  if (!query.trim()) {
    throw createError({
      code: "BAD_REQUEST",
      message: "Query must not be empty.",
    });
  }

  const index = getMarkdownIndex();
  let results: lunr.Index.Result[];
  try {
    results = index.search(query);
  } catch {
    results = index.search(query.replace(/[~*:^+-]/g, " "));
  }

  const hits: MarkdownSearchHit[] = [];
  for (const result of results) {
    const doc = getMarkdownDoc(result.ref);
    if (!doc) {
      continue;
    }
    const { line, snippet } = findLineAndSnippet(doc, query);
    hits.push({
      path: doc.path,
      line,
      snippet,
      score: result.score,
    });
  }

  const total = hits.length;
  const paginated = hits.slice(offset, offset + limit);
  return { total, hits: paginated };
}

export function grepControlsInMarkdown(
  control: string,
  withEnhancements: boolean,
): Array<{ path: string; line: number; snippet: string }> {
  const docs = getIndexState().markdownDocs;
  const escaped = escapeStringRegexp(control);
  const controlRegex = withEnhancements
    ? new RegExp(`${escaped}(\\([^)]+\\))?`, "g")
    : new RegExp(`${escaped}(?!\\()`, "g");

  const matches: Array<{ path: string; line: number; snippet: string }> = [];
  for (const doc of docs.values()) {
    doc.lines.forEach((line, idx) => {
      if (controlRegex.test(line)) {
        matches.push({
          path: doc.path,
          line: idx + 1,
          snippet: line.trim().slice(0, 240),
        });
      }
      controlRegex.lastIndex = 0;
    });
  }
  return matches;
}

interface SignificantChangeSource {
  type: "markdown" | "FRMR";
  path: string;
  lines?: [number, number];
  references?: string[];
  docType?: string;
}

const SIGNIFICANT_CHANGE_REGEX = /significant change/i;

function findMarkdownSignificantSections(
  limit: number,
): SignificantChangeSource[] {
  const results: SignificantChangeSource[] = [];
  for (const doc of getIndexState().markdownDocs.values()) {
    const matches: Array<[number, number]> = [];
    doc.lines.forEach((line, idx) => {
      if (SIGNIFICANT_CHANGE_REGEX.test(line)) {
        const start = clamp(idx + 1 - 3, 1, doc.lines.length);
        const end = clamp(idx + 1 + 3, 1, doc.lines.length);
        matches.push([start, end]);
      }
    });
    if (matches.length) {
      results.push({
        type: "markdown",
        path: doc.path,
        lines: matches[0],
      });
      if (results.length >= limit) {
        break;
      }
    }
  }
  return results;
}

function extractKeywordsFromObject(value: unknown): string[] {
  if (!value) {
    return [];
  }
  if (typeof value === "string") {
    return SIGNIFICANT_CHANGE_REGEX.test(value) ? [value] : [];
  }
  if (Array.isArray(value)) {
    return unique(
      value.flatMap((item) => extractKeywordsFromObject(item)),
    );
  }
  if (typeof value === "object") {
    return unique(
      Object.values(value).flatMap((item) =>
        extractKeywordsFromObject(item),
      ),
    );
  }
  return [];
}

function findFrmrSignificantReferences(
  limit: number,
): SignificantChangeSource[] {
  const results: SignificantChangeSource[] = [];
  const idKeyPattern = /^[A-Z0-9]+(?:-[A-Z0-9]+)+$/;

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    Boolean(value && typeof value === "object" && !Array.isArray(value));

  const collectIdMappedItems = (
    value: unknown,
  ): Array<Record<string, unknown>> => {
    if (!isRecord(value)) {
      return [];
    }
    const items: Array<Record<string, unknown>> = [];
    for (const [key, entry] of Object.entries(value)) {
      if (!isRecord(entry)) {
        continue;
      }
      if (idKeyPattern.test(key)) {
        items.push({ id: key, ...entry });
        continue;
      }
      items.push(...collectIdMappedItems(entry));
    }
    return items;
  };

  for (const doc of getFrmrDocuments()) {
    const raw = doc.raw as Record<string, unknown>;
    const directArrays = [
      raw.items,
      raw.controls,
      raw.entries,
    ].filter((value): value is unknown[] => Array.isArray(value));
    const arrays =
      directArrays.length > 0
        ? directArrays
        : [collectIdMappedItems(raw.data ?? raw)];
    const matches: string[] = [];
    for (const array of arrays) {
      for (const item of array) {
        const collected = extractKeywordsFromObject(item);
        if (collected.length) {
          let idCandidate: string | undefined;
          if (typeof item === "object" && item) {
            const obj = item as Record<string, unknown>;
            if (typeof obj.id === "string") {
              idCandidate = obj.id;
            } else if (typeof obj.uid === "string") {
              idCandidate = obj.uid;
            }
          }
          if (idCandidate) {
            matches.push(idCandidate);
          }
        }
        if (matches.length >= limit) {
          break;
        }
      }
      if (matches.length >= limit) {
        break;
      }
    }
    if (matches.length) {
      results.push({
        type: "FRMR",
        path: doc.path,
        references: matches.slice(0, limit),
        docType: doc.type,
      });
    }
    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

export function getSignificantChangeGuidance(
  limit: number,
): { sources: SignificantChangeSource[] } {
  const markdown = findMarkdownSignificantSections(limit);
  const frmr = findFrmrSignificantReferences(limit);
  const sources: SignificantChangeSource[] = [];
  let markdownIndex = 0;
  let frmrIndex = 0;
  while (
    sources.length < limit &&
    (frmrIndex < frmr.length || markdownIndex < markdown.length)
  ) {
    if (frmrIndex < frmr.length) {
      sources.push(frmr[frmrIndex]);
      frmrIndex += 1;
    }
    if (sources.length >= limit) {
      break;
    }
    if (markdownIndex < markdown.length) {
      sources.push(markdown[markdownIndex]);
      markdownIndex += 1;
    }
  }
  return { sources };
}

export async function healthCheck(): Promise<{
  ok: boolean;
  indexedFiles: number;
  repoPath: string;
  errors?: string[];
  repoInfo?: RepoInfo;
  autoUpdate?: AutoUpdateConfig;
}> {
  const state = getIndexState();
  const indexedFiles =
    state.frmrDocuments.length + state.markdownDocs.size;
  const errors = getIndexErrors();

  // Get repo info (commit hash, date, last fetch time)
  const repoInfoResult = await getRepoInfo();
  const repoInfo: RepoInfo | undefined = repoInfoResult
    ? {
        commitHash: repoInfoResult.commitHash,
        commitDate: repoInfoResult.commitDate,
        lastFetchedAt: repoInfoResult.lastFetchedAt,
      }
    : undefined;

  // Get auto-update configuration
  const autoUpdateConfig = getAutoUpdateConfig();
  const autoUpdate: AutoUpdateConfig = {
    enabled: autoUpdateConfig.enabled,
    checkIntervalHours: autoUpdateConfig.checkIntervalHours,
  };

  return {
    ok: errors.length === 0,
    indexedFiles,
    repoPath: state.repoPath,
    errors: errors.length ? errors : undefined,
    repoInfo,
    autoUpdate,
  };
}
