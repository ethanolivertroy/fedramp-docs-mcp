import path from "node:path";

import fse from "fs-extra";
import { glob } from "glob";
import lunr from "lunr";
import { simpleGit } from "simple-git";

import { ensureRepoReady, getRepoPath } from "./repo.js";
import type {
  ControlMapping,
  FrmrDocumentRecord,
  FrmrDocumentType,
  IndexState,
  KsiItem,
  MarkdownDoc,
  VersionInfo,
} from "./types.js";
import {
  createError,
  detectIdKey,
  envBoolean,
  extractControlLikeStrings,
  guessFrmrTypeFromFilename,
  normalizePath,
  sha256,
  unique,
} from "./util.js";

const IGNORE_GLOBS = [
  "**/node_modules/**",
  "**/.git/**",
  "**/.hg/**",
  "**/dist/**",
  "**/build/**",
  "**/.cache/**",
];

const INDEX_CACHE_FILE = path.join(
  process.env.HOME ?? ".",
  ".cache",
  "fedramp-docs",
  "index-v1.json",
);

interface PersistedIndex {
  repoHead?: string | null;
  indexedAt: number;
  repoPath: string;
  frmrDocuments: FrmrDocumentRecord[];
  ksiItems: KsiItem[];
  controlMappings: ControlMapping[];
  markdownDocs: Array<MarkdownDoc & { indexContent: string }>;
  errors: string[];
}

let indexState: IndexState | null = null;
let markdownIndex: lunr.Index | null = null;

function getPersistEnabled(): boolean {
  return envBoolean("FEDRAMP_DOCS_INDEX_PERSIST", true);
}

async function loadPersistedIndex(
  repoHead: string | null,
): Promise<IndexState | null> {
  if (!getPersistEnabled()) {
    return null;
  }

  try {
    const exists = await fse.pathExists(INDEX_CACHE_FILE);
    if (!exists) {
      return null;
    }
    const raw = await fse.readFile(INDEX_CACHE_FILE, "utf8");
    const data = JSON.parse(raw) as PersistedIndex;

    if (repoHead && data.repoHead && data.repoHead !== repoHead) {
      return null;
    }

    const docsMap = new Map<string, MarkdownDoc>();
    const builder = new lunr.Builder();
    builder.ref("path");
    builder.field("content");

    for (const doc of data.markdownDocs) {
      docsMap.set(doc.path, {
        path: doc.path,
        content: doc.content,
        sha256: doc.sha256,
        headings: doc.headings,
        lines: doc.lines,
      });
      builder.add({ path: doc.path, content: doc.indexContent });
    }

    markdownIndex = builder.build();

    return {
      repoPath: data.repoPath,
      indexedAt: data.indexedAt,
      frmrDocuments: data.frmrDocuments,
      ksiItems: data.ksiItems,
      controlMappings: data.controlMappings,
      markdownDocs: docsMap,
      errors: data.errors,
    };
  } catch (error) {
    console.warn(
      `Failed to load persisted index: ${(error as Error).message}`,
    );
    return null;
  }
}

async function persistIndex(
  state: IndexState,
  repoHead: string | null,
  indexContentMap: Map<string, string>,
): Promise<void> {
  if (!getPersistEnabled()) {
    return;
  }
  const payload: PersistedIndex = {
    repoHead,
    indexedAt: state.indexedAt,
    repoPath: state.repoPath,
    frmrDocuments: state.frmrDocuments,
    ksiItems: state.ksiItems,
    controlMappings: state.controlMappings,
    markdownDocs: [...state.markdownDocs.values()].map((doc) => ({
      ...doc,
      indexContent: indexContentMap.get(doc.path) ?? doc.content,
    })),
    errors: state.errors,
  };

  await fse.ensureDir(path.dirname(INDEX_CACHE_FILE));
  await fse.writeFile(INDEX_CACHE_FILE, JSON.stringify(payload), "utf8");
}

function deriveTitleFromFilename(filename: string): string {
  return filename
    .replace(/^FRMR\.[A-Z]+\./i, "")
    .replace(/\.json$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractVersionFromString(input: string): string | undefined {
  const match =
    input.match(/(20\d{2})[-_. ]?(0[1-9]|1[0-2])(?:[-_. ]?(0[1-9]|[12]\d|3[01]))?/);
  if (match) {
    return match[0].replace(/[-_. ]/g, "-");
  }
  return undefined;
}

function extractPublishedDate(metadata: Record<string, unknown>): string | undefined {
  const candidateKeys = ["published", "published_at", "date", "released"];
  for (const key of candidateKeys) {
    const value = metadata[key];
    if (typeof value === "string") {
      return value;
    }
  }
  return undefined;
}

function normalizeDocType(typeGuess: string): FrmrDocumentType {
  const upper = typeGuess.toUpperCase();
  if (
    ["KSI", "MAS", "VDR", "SCN", "FRD", "ADS"].includes(upper)
  ) {
    return upper as FrmrDocumentType;
  }
  return "unknown";
}

function coerceStringArray(
  value: unknown,
): string[] | undefined {
  if (!value) {
    return undefined;
  }
  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === "string" ? item : undefined))
      .filter((item): item is string => Boolean(item));
    return items.length ? items : undefined;
  }
  if (typeof value === "string") {
    return [value];
  }
  return undefined;
}

function buildKsiItems(
  doc: FrmrDocumentRecord,
  items: unknown[],
): KsiItem[] {
  const results: KsiItem[] = [];
  const idKey = doc.idKey ?? "id";
  for (const rawItem of items) {
    if (!rawItem || typeof rawItem !== "object") {
      continue;
    }
    const item = rawItem as Record<string, unknown>;
    const idValue =
      (typeof item[idKey] === "string" && item[idKey]) ||
      (typeof item.id === "string" && item.id) ||
      (typeof item.uid === "string" && item.uid);
    if (!idValue) {
      continue;
    }

    const referencesValue = Array.isArray(item.references)
      ? (item.references as Array<Record<string, unknown>>)
      : undefined;

    const ksiItem: KsiItem = {
      id: idValue,
      title: typeof item.title === "string" ? item.title : undefined,
      description:
        typeof item.description === "string" ? item.description : undefined,
      category:
        typeof item.category === "string"
          ? item.category
          : Array.isArray(item.categories)
            ? (item.categories.find((value) => typeof value === "string") as
                | string
                | undefined)
            : undefined,
      status: typeof item.status === "string" ? item.status : undefined,
      sourceRef:
        typeof item.source_ref === "string"
          ? item.source_ref
          : Array.isArray(item.source_ref)
            ? item.source_ref
                .filter((value) => typeof value === "string")
                .join(", ")
            : typeof item.source === "string"
              ? item.source
              : undefined,
      requirements: coerceStringArray(item.requirements),
      controlMapping: unique(extractControlLikeStrings(item)),
      evidenceExamples: coerceStringArray(item.evidence_examples),
      references: referencesValue?.map((ref) => ({
        type:
          typeof ref.type === "string"
            ? ref.type
            : typeof ref.kind === "string"
              ? ref.kind
              : undefined,
        id: typeof ref.id === "string" ? ref.id : undefined,
        text:
          typeof ref.text === "string"
            ? ref.text
            : typeof ref.description === "string"
              ? ref.description
              : undefined,
      })),
      docPath: doc.path,
    };
    results.push(ksiItem);
  }
  return results;
}

function parseControlId(
  control: string,
): { control: string; enhancements: string[] } | null {
  const baseMatch = control.match(/^([A-Z]{2}-\d{1,3})/);
  if (!baseMatch) {
    return null;
  }
  const enhancements = unique(
    (control.match(/\(\w+\)/g) ?? []).map((value) => value),
  );
  return {
    control: baseMatch[1],
    enhancements,
  };
}

function collectControlMappings(
  type: FrmrDocumentType,
  pathRef: string,
  idKey: string | null,
  items: unknown[],
): ControlMapping[] {
  const mappings: ControlMapping[] = [];
  items.forEach((rawItem) => {
    if (!rawItem || typeof rawItem !== "object") {
      return;
    }
    const item = rawItem as Record<string, unknown>;
    const sourceId =
      (idKey && typeof item[idKey] === "string" && item[idKey]) ||
      (typeof item.id === "string" ? item.id : undefined) ||
      (typeof item.uid === "string" ? item.uid : undefined);
    if (!sourceId) {
      return;
    }
    const controls = unique(extractControlLikeStrings(item));
    for (const controlCandidate of controls) {
      const parsed = parseControlId(controlCandidate);
      if (!parsed) {
        continue;
      }
      mappings.push({
        source: type,
        sourceId,
        control: parsed.control,
        controlEnhancements: parsed.enhancements,
        path: pathRef,
      });
    }
  });
  return mappings;
}

function stripCodeBlocks(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, " ");
}

function extractHeadings(lines: string[]): Array<{ depth: number; title: string; line: number }> {
  const headings: Array<{ depth: number; title: string; line: number }> = [];
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (match) {
      headings.push({
        depth: match[1].length,
        title: match[2].trim(),
        line: index + 1,
      });
    }
  });
  return headings;
}

interface BuildResult {
  state: IndexState;
  indexContentMap: Map<string, string>;
}

async function scanRepository(): Promise<BuildResult> {
  const repoPath = getRepoPath();
  const jsonPaths = await glob("**/*.json", {
    cwd: repoPath,
    ignore: IGNORE_GLOBS,
  });
  const markdownPaths = await glob("**/*.md", {
    cwd: repoPath,
    ignore: IGNORE_GLOBS,
  });

  const frmrDocuments: FrmrDocumentRecord[] = [];
  const ksiItems: KsiItem[] = [];
  const controlMappings: ControlMapping[] = [];
  const markdownDocs = new Map<string, MarkdownDoc>();
  const errors: string[] = [];

  for (const relativePath of jsonPaths) {
    const normalizedPath = normalizePath(relativePath);
    const absolutePath = path.join(repoPath, relativePath);
    let content: string;
    try {
      content = await fse.readFile(absolutePath, "utf8");
    } catch (error) {
      errors.push(
        `Failed to read JSON file ${normalizedPath}: ${(error as Error).message}`,
      );
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      errors.push(
        `Failed to parse JSON file ${normalizedPath}: ${(error as Error).message}`,
      );
      continue;
    }

    if (!parsed || typeof parsed !== "object") {
      continue;
    }

    const docTypeGuess = normalizeDocType(
      guessFrmrTypeFromFilename(path.basename(relativePath)),
    );

    const parsedRecord = parsed as Record<string, unknown>;
    const metadata =
      parsedRecord.metadata && typeof parsedRecord.metadata === "object"
        ? (parsedRecord.metadata as Record<string, unknown>)
        : {};

    const title =
      (typeof metadata.title === "string" && metadata.title) ||
      (typeof parsedRecord.title === "string" && parsedRecord.title) ||
      deriveTitleFromFilename(path.basename(relativePath));

    const version =
      (typeof metadata.version === "string" && metadata.version) ||
      extractVersionFromString(path.basename(relativePath));
    const published = extractPublishedDate(metadata);

    const candidateArrays = [
      parsedRecord.items,
      parsedRecord.controls,
      parsedRecord.entries,
      parsedRecord.records,
    ].filter((value) => Array.isArray(value)) as unknown[][];

    const items = candidateArrays.length ? candidateArrays[0] : [];
    const idKey = detectIdKey(items);

    const docRecord: FrmrDocumentRecord = {
      type: docTypeGuess,
      title,
      version,
      published,
      path: normalizedPath,
      idHint: docTypeGuess !== "unknown" ? docTypeGuess : undefined,
      itemCount: items.length,
      raw: parsed,
      rawText: content,
      topLevelKeys: Object.keys(parsedRecord),
      idKey,
    };

    frmrDocuments.push(docRecord);

    if (docTypeGuess === "KSI" && items.length) {
      ksiItems.push(...buildKsiItems(docRecord, items));
    }

    if (items.length) {
      controlMappings.push(
        ...collectControlMappings(docTypeGuess, normalizedPath, idKey, items),
      );
    }
  }

  const builder = new lunr.Builder();
  builder.ref("path");
  builder.field("content");
  const indexContentMap = new Map<string, string>();

  for (const relativePath of markdownPaths) {
    const normalizedPath = normalizePath(relativePath);
    const absolutePath = path.join(repoPath, relativePath);
    let content: string;
    try {
      content = await fse.readFile(absolutePath, "utf8");
    } catch (error) {
      errors.push(
        `Failed to read markdown file ${normalizedPath}: ${(error as Error).message}`,
      );
      continue;
    }
    const lines = content.split(/\r?\n/);
    const headings = extractHeadings(lines);
    const doc: MarkdownDoc = {
      path: normalizedPath,
      content,
      sha256: sha256(content),
      headings,
      lines,
    };
    markdownDocs.set(normalizedPath, doc);

    const indexContent = stripCodeBlocks(content);
    indexContentMap.set(normalizedPath, indexContent);
    builder.add({ path: normalizedPath, content: indexContent });
  }

  markdownIndex = builder.build();

  const indexedAt = Date.now();
  const state: IndexState = {
    repoPath,
    indexedAt,
    frmrDocuments,
    ksiItems,
    controlMappings,
    markdownDocs,
    errors,
  };

  return { state, indexContentMap };
}

export async function buildIndex(force = false): Promise<IndexState> {
  await ensureRepoReady();
  if (indexState && !force) {
    return indexState;
  }

  const repoPath = getRepoPath();
  const git = simpleGit(repoPath);
  const repoHead = await git.revparse(["HEAD"]).catch(() => null);

  if (!force) {
    const cached = await loadPersistedIndex(repoHead);
    if (cached) {
      indexState = cached;
      return indexState;
    }
  }

  const { state, indexContentMap } = await scanRepository();
  indexState = state;
  await persistIndex(state, repoHead, indexContentMap);
  return state;
}

export function getIndexState(): IndexState {
  if (!indexState) {
    throw createError({
      code: "INDEX_NOT_READY",
      message: "Index not ready. Call buildIndex() first.",
    });
  }
  return indexState;
}

export function getMarkdownIndex(): lunr.Index {
  if (!markdownIndex) {
    throw createError({
      code: "INDEX_NOT_READY",
      message: "Markdown index not ready. Call buildIndex() first.",
    });
  }
  return markdownIndex;
}

export function resolveFrmrDocument(
  pathRef: string,
): FrmrDocumentRecord | undefined {
  const state = getIndexState();
  return state.frmrDocuments.find((doc) => doc.path === pathRef);
}

export function getFrmrDocuments(): FrmrDocumentRecord[] {
  return getIndexState().frmrDocuments;
}

export function getKsiItems(): KsiItem[] {
  return getIndexState().ksiItems;
}

export function getControlMappings(): ControlMapping[] {
  return getIndexState().controlMappings;
}

export function getMarkdownDoc(pathRef: string): MarkdownDoc | undefined {
  return getIndexState().markdownDocs.get(pathRef);
}

export function listVersions(): VersionInfo[] {
  return getIndexState().frmrDocuments.map((doc) => ({
    type: doc.type,
    version: doc.version,
    published: doc.published,
    path: doc.path,
  }));
}

export function getIndexErrors(): string[] {
  return getIndexState().errors;
}
