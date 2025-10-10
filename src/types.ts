export type FrmrDocumentType =
  | "KSI"
  | "MAS"
  | "VDR"
  | "SCN"
  | "FRD"
  | "ADS"
  | "unknown";

export interface FrmrDocumentMeta {
  type: FrmrDocumentType;
  title: string;
  version?: string;
  published?: string;
  path: string;
  idHint?: string;
  itemCount: number;
}

export interface FrmrDocumentRecord extends FrmrDocumentMeta {
  raw: unknown;
  rawText: string;
  topLevelKeys: string[];
  idKey: string | null;
}

export interface FrmrSummary {
  countItems: number;
  topLevelKeys: string[];
}

export interface KsiItem {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  sourceRef?: string | string[];
  requirements?: string[];
  controlMapping?: string[];
  evidenceExamples?: string[];
  references?: Array<{ type?: string; id?: string; text?: string }>;
  docPath: string;
}

export interface ControlMapping {
  source: FrmrDocumentType;
  sourceId: string;
  control: string;
  controlEnhancements: string[];
  path: string;
}

export interface MarkdownDoc {
  path: string;
  content: string;
  sha256: string;
  headings: Array<{ depth: number; title: string; line: number }>;
  lines: string[];
}

export interface MarkdownSearchHit {
  path: string;
  line: number;
  snippet: string;
  score: number;
}

export interface MarkdownSearchResult {
  total: number;
  hits: MarkdownSearchHit[];
}

export interface IndexState {
  repoPath: string;
  indexedAt: number;
  frmrDocuments: FrmrDocumentRecord[];
  ksiItems: KsiItem[];
  controlMappings: ControlMapping[];
  markdownDocs: Map<string, MarkdownDoc>;
  errors: string[];
}

export interface ErrorDetail {
  code:
    | "NOT_FOUND"
    | "BAD_REQUEST"
    | "INDEX_NOT_READY"
    | "REPO_CLONE_FAILED"
    | "IO_ERROR"
    | "PARSE_ERROR"
    | "UNSUPPORTED";
  message: string;
  hint?: string;
}

export interface ToolExecutionError extends Error {
  detail: ErrorDetail;
}

export type DiffChange =
  | { type: "added"; id: string; title?: string }
  | { type: "removed"; id: string; title?: string }
  | { type: "modified"; id: string; title?: string; fields: string[] };

export interface DiffSummary {
  added: number;
  removed: number;
  modified: number;
}

export interface DiffResult {
  summary: DiffSummary;
  changes: DiffChange[];
}

export interface VersionInfo {
  type: FrmrDocumentType;
  version?: string;
  published?: string;
  path: string;
}

export interface HealthCheckResult {
  ok: boolean;
  indexedFiles: number;
  repoPath: string;
  errors?: string[];
}
