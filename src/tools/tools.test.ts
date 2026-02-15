import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FrmrDocumentRecord, ControlMapping, KsiItem } from "../types.js";

// Mock the indexer module
vi.mock("../indexer.js", () => ({
  getFrmrDocuments: vi.fn(),
  getKsiItems: vi.fn(),
  getControlMappings: vi.fn(),
}));

// Mock the frmr module
vi.mock("../frmr.js", () => ({
  listControlMappings: vi.fn(),
}));

// Mock the search module
vi.mock("../search.js", () => ({
  searchMarkdown: vi.fn(),
}));

import { getFrmrDocuments, getKsiItems, getControlMappings } from "../indexer.js";
import { listControlMappings } from "../frmr.js";
import { searchMarkdown } from "../search.js";

import { searchDefinitionsTool } from "./search_definitions.js";
import { filterByImpactTool } from "./filter_by_impact.js";
import { getEvidenceExamplesTool } from "./get_evidence_examples.js";
import { analyzeControlCoverageTool } from "./analyze_control_coverage.js";
import { getControlRequirementsTool } from "./get_control_requirements.js";
import { getThemeSummaryTool } from "./get_theme_summary.js";
import { getRequirementByIdTool } from "./get_requirement_by_id.js";
import { searchToolCatalog, TOOL_CATALOG } from "./tool_catalog.js";

// Sample test data
const mockKsiItems: KsiItem[] = [
  {
    id: "KSI-IAM-01",
    title: "Identity Management",
    description: "Manage user identities",
    category: "IAM",
    impact: { low: true, moderate: true, high: true },
    controlMapping: ["AC-2", "IA-5"],
    evidenceExamples: ["User provisioning logs", "Access reviews"],
    docPath: "/docs/ksi.json",
    statement: "Identity must be managed",
  },
  {
    id: "KSI-IAM-02",
    title: "Access Control",
    description: "Control user access",
    category: "IAM",
    impact: { low: false, moderate: true, high: true },
    controlMapping: ["AC-2", "AC-3"],
    evidenceExamples: ["RBAC policies"],
    docPath: "/docs/ksi.json",
    statement: "Access must be controlled",
  },
  {
    id: "KSI-CNA-01",
    title: "Container Security",
    description: "Secure containers",
    category: "CNA",
    impact: { low: false, moderate: false, high: true },
    controlMapping: ["SC-7"],
    evidenceExamples: ["Container scan results"],
    docPath: "/docs/ksi.json",
    statement: "Containers must be secure",
  },
];

const mockFrdDocument: FrmrDocumentRecord = {
  type: "FRD",
  path: "/docs/frd.json",
  title: "FedRAMP Definitions",
  rawText: "{}",
  topLevelKeys: ["info", "data"],
  idKey: "id",
  itemCount: 3,
  raw: {
    info: {
      name: "FedRAMP Definitions",
    },
    data: {
      both: {
        "FRD-001": {
          term: "Authorization",
          definition: "The process of granting access to resources",
          alts: ["Auth", "Authz"],
        },
        "FRD-002": {
          term: "Continuous Monitoring",
          definition: "Ongoing awareness of security status",
          alts: ["ConMon"],
        },
        "FRD-003": {
          term: "FedRAMP",
          definition: "Federal Risk and Authorization Management Program",
        },
      },
    },
  },
};

const mockControlMappings: ControlMapping[] = [
  { control: "AC-2", source: "KSI", sourceId: "KSI-IAM-01", controlEnhancements: [], path: "/ksi" },
  { control: "AC-2", source: "KSI", sourceId: "KSI-IAM-02", controlEnhancements: [], path: "/ksi" },
  { control: "AC-3", source: "KSI", sourceId: "KSI-IAM-02", controlEnhancements: [], path: "/ksi" },
  { control: "IA-5", source: "KSI", sourceId: "KSI-IAM-01", controlEnhancements: [], path: "/ksi" },
  { control: "SC-7", source: "KSI", sourceId: "KSI-CNA-01", controlEnhancements: [], path: "/ksi" },
];

describe("search_definitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should find definitions by term", async () => {
    vi.mocked(getFrmrDocuments).mockReturnValue([mockFrdDocument]);

    const result = await searchDefinitionsTool.execute({ term: "authorization", limit: 20 });

    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.definitions.some((d) => d.term === "Authorization")).toBe(true);
  });

  it("should find definitions by alternate term", async () => {
    vi.mocked(getFrmrDocuments).mockReturnValue([mockFrdDocument]);

    const result = await searchDefinitionsTool.execute({ term: "conmon", limit: 20 });

    expect(result.total).toBe(1);
    expect(result.definitions[0].term).toBe("Continuous Monitoring");
  });

  it("should find definitions in definition text", async () => {
    vi.mocked(getFrmrDocuments).mockReturnValue([mockFrdDocument]);

    const result = await searchDefinitionsTool.execute({ term: "federal", limit: 20 });

    expect(result.total).toBe(1);
    expect(result.definitions[0].term).toBe("FedRAMP");
  });

  it("should respect limit parameter", async () => {
    vi.mocked(getFrmrDocuments).mockReturnValue([mockFrdDocument]);

    const result = await searchDefinitionsTool.execute({ term: "a", limit: 1 });

    expect(result.definitions.length).toBe(1);
    expect(result.total).toBeGreaterThan(1);
  });

  it("should return empty when no FRD document", async () => {
    vi.mocked(getFrmrDocuments).mockReturnValue([]);

    const result = await searchDefinitionsTool.execute({ term: "test", limit: 20 });

    expect(result.total).toBe(0);
    expect(result.definitions).toEqual([]);
  });
});

describe("filter_by_impact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getKsiItems).mockReturnValue(mockKsiItems);
  });

  it("should filter by low impact", async () => {
    const result = await filterByImpactTool.execute({ impact: "low", limit: 100, offset: 0 });

    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe("KSI-IAM-01");
  });

  it("should filter by moderate impact", async () => {
    const result = await filterByImpactTool.execute({ impact: "moderate", limit: 100, offset: 0 });

    expect(result.total).toBe(2);
  });

  it("should filter by high impact", async () => {
    const result = await filterByImpactTool.execute({ impact: "high", limit: 100, offset: 0 });

    expect(result.total).toBe(3);
  });

  it("should respect pagination", async () => {
    const result = await filterByImpactTool.execute({ impact: "high", limit: 1, offset: 1 });

    expect(result.total).toBe(3);
    expect(result.items.length).toBe(1);
    expect(result.items[0].id).toBe("KSI-IAM-02");
  });
});

describe("get_evidence_examples", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getKsiItems).mockReturnValue(mockKsiItems);
  });

  it("should return all KSI items with disclaimer", async () => {
    const result = await getEvidenceExamplesTool.execute({ includeRetired: true });

    expect(result.total).toBe(3);
    expect(result.disclaimer).toContain("community suggestions");
    expect(result.disclaimer).toContain("NOT official FedRAMP guidance");
  });

  it("should filter by theme", async () => {
    const result = await getEvidenceExamplesTool.execute({ theme: "IAM", includeRetired: true });

    expect(result.total).toBe(2);
    expect(result.items.every((i) => i.theme === "IAM")).toBe(true);
  });

  it("should filter by specific ID", async () => {
    const result = await getEvidenceExamplesTool.execute({ id: "KSI-CNA-01", includeRetired: true });

    expect(result.total).toBe(1);
    expect(result.items[0].ksiId).toBe("KSI-CNA-01");
  });

  it("should include themes list", async () => {
    const result = await getEvidenceExamplesTool.execute({ includeRetired: true });

    expect(result.themes).toContain("IAM");
    expect(result.themes).toContain("CNA");
  });
});

describe("analyze_control_coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getControlMappings).mockReturnValue(mockControlMappings);
  });

  it("should count control families", async () => {
    const result = await analyzeControlCoverageTool.execute({});

    expect(result.totalFamilies).toBe(3); // AC, IA, SC
  });

  it("should count total controls", async () => {
    const result = await analyzeControlCoverageTool.execute({});

    expect(result.totalControls).toBe(4); // AC-2, AC-3, IA-5, SC-7
  });

  it("should count total mappings", async () => {
    const result = await analyzeControlCoverageTool.execute({});

    expect(result.totalMappings).toBe(5);
  });

  it("should provide family breakdown", async () => {
    const result = await analyzeControlCoverageTool.execute({});

    const acFamily = result.families.find((f) => f.family === "AC");
    expect(acFamily).toBeDefined();
    expect(acFamily!.controlCount).toBe(2); // AC-2, AC-3
    expect(acFamily!.mappingCount).toBe(3); // 2 for AC-2, 1 for AC-3
  });

  it("should sort families by mapping count descending", async () => {
    const result = await analyzeControlCoverageTool.execute({});

    for (let i = 0; i < result.families.length - 1; i++) {
      expect(result.families[i].mappingCount).toBeGreaterThanOrEqual(
        result.families[i + 1].mappingCount,
      );
    }
  });
});

describe("get_control_requirements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getKsiItems).mockReturnValue(mockKsiItems);
    vi.mocked(listControlMappings).mockImplementation(({ control }) =>
      mockControlMappings.filter((m) => m.control === control),
    );
  });

  it("should find requirements for a control", async () => {
    const result = await getControlRequirementsTool.execute({ control: "AC-2" });

    expect(result.control).toBe("AC-2");
    expect(result.total).toBe(2);
  });

  it("should include KSI item details", async () => {
    const result = await getControlRequirementsTool.execute({ control: "AC-2" });

    const req = result.requirements.find((r) => r.sourceId === "KSI-IAM-01");
    expect(req).toBeDefined();
    expect(req!.title).toBe("Identity Management");
    expect(req!.theme).toBe("IAM");
  });

  it("should deduplicate by sourceId", async () => {
    const result = await getControlRequirementsTool.execute({ control: "AC-2" });

    const sourceIds = result.requirements.map((r) => r.sourceId);
    expect(sourceIds.length).toBe(new Set(sourceIds).size);
  });

  it("should return empty for unknown control", async () => {
    vi.mocked(listControlMappings).mockReturnValue([]);

    const result = await getControlRequirementsTool.execute({ control: "XX-99" });

    expect(result.total).toBe(0);
    expect(result.requirements).toEqual([]);
  });
});

describe("get_theme_summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getKsiItems).mockReturnValue(mockKsiItems);
    vi.mocked(searchMarkdown).mockReturnValue({ hits: [], total: 0 });
  });

  it("should get IAM theme summary", async () => {
    const result = await getThemeSummaryTool.execute({ theme: "IAM" });

    expect(result.theme).toBe("IAM");
    expect(result.themeName).toBe("Identity & Access Management");
    expect(result.indicatorCount).toBe(2);
  });

  it("should calculate impact breakdown", async () => {
    const result = await getThemeSummaryTool.execute({ theme: "IAM" });

    expect(result.impactBreakdown.low).toBe(1);
    expect(result.impactBreakdown.moderate).toBe(2);
    expect(result.impactBreakdown.high).toBe(2);
  });

  it("should collect related controls", async () => {
    const result = await getThemeSummaryTool.execute({ theme: "IAM" });

    expect(result.relatedControls).toContain("AC-2");
    expect(result.relatedControls).toContain("AC-3");
    expect(result.relatedControls).toContain("IA-5");
  });

  it("should return empty for theme with no indicators", async () => {
    const result = await getThemeSummaryTool.execute({ theme: "TPR" });

    expect(result.indicatorCount).toBe(0);
    expect(result.indicators).toEqual([]);
  });
});

describe("get_requirement_by_id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getKsiItems).mockReturnValue(mockKsiItems);
    vi.mocked(getFrmrDocuments).mockReturnValue([mockFrdDocument]);
  });

  it("should find KSI item by ID", async () => {
    const result = await getRequirementByIdTool.execute({ id: "KSI-IAM-01" });

    expect(result.id).toBe("KSI-IAM-01");
    expect(result.source).toBe("KSI");
    expect(result.title).toBe("Identity Management");
  });

  it("should be case-insensitive", async () => {
    const result = await getRequirementByIdTool.execute({ id: "ksi-iam-01" });

    expect(result.id).toBe("KSI-IAM-01");
  });

  it("should find FRD definition by ID", async () => {
    const result = await getRequirementByIdTool.execute({ id: "FRD-001" });

    expect(result.id).toBe("FRD-001");
    expect(result.source).toBe("FRD");
  });

  it("should throw for unknown ID", async () => {
    await expect(
      getRequirementByIdTool.execute({ id: "UNKNOWN-999" }),
    ).rejects.toThrow("Requirement not found");
  });
});

describe("search_tools (tool catalog)", () => {
  it("should find tools by keyword", () => {
    const results = searchToolCatalog("ksi");

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name === "list_ksi")).toBe(true);
    expect(results.some((r) => r.name === "get_ksi")).toBe(true);
  });

  it("should filter by category", () => {
    const results = searchToolCatalog("", "Controls");

    expect(results.length).toBe(3);
    expect(results.every((r) => r.category === "Controls")).toBe(true);
  });

  it("should return empty for nonsense queries", () => {
    const results = searchToolCatalog("xyzzy_nonexistent_gibberish");

    expect(results.length).toBe(0);
  });

  it("should rank exact name match highest", () => {
    const results = searchToolCatalog("list_ksi");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe("list_ksi");
    expect(results[0].score).toBeGreaterThan(results[1]?.score ?? 0);
  });

  it("should respect limit parameter", () => {
    const results = searchToolCatalog("control", undefined, 2);

    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("should return all tools when query is empty", () => {
    const results = searchToolCatalog("", undefined, 100);

    expect(results.length).toBe(TOOL_CATALOG.length);
  });

  it("should find tools by multi-word queries", () => {
    const results = searchToolCatalog("significant change");

    expect(results.some((r) => r.name === "get_significant_change_guidance")).toBe(true);
  });

  it("should combine category filter with keyword search", () => {
    const results = searchToolCatalog("search", "Search");

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.category === "Search")).toBe(true);
  });
});
