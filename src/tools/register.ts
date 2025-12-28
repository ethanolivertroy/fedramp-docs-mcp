import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools as registerToolDefs } from "./base.js";
import { analyzeControlCoverageTool } from "./analyze_control_coverage.js";
import { diffFrmrTool } from "./diff_frmr.js";
import { filterByImpactTool } from "./filter_by_impact.js";
import { getControlRequirementsTool } from "./get_control_requirements.js";
import { getEvidenceChecklistTool } from "./get_evidence_checklist.js";
import { getFrmrDocumentTool } from "./get_frmr_document.js";
import { getKsiTool } from "./get_ksi.js";
import { getRequirementByIdTool } from "./get_requirement_by_id.js";
import { significantChangeTool } from "./get_significant_change_guidance.js";
import { getThemeSummaryTool } from "./get_theme_summary.js";
import { healthCheckTool } from "./health_check.js";
import { grepControlsTool } from "./grep_controls_in_markdown.js";
import { listControlsTool } from "./list_controls.js";
import { listFrmrDocumentsTool } from "./list_frmr_documents.js";
import { listKsiTool } from "./list_ksi.js";
import { listVersionsTool } from "./list_versions.js";
import { readMarkdownTool } from "./read_markdown.js";
import { searchDefinitionsTool } from "./search_definitions.js";
import { searchMarkdownTool } from "./search_markdown.js";
import { updateRepositoryTool } from "./update_repository.js";

export function registerTools(server: McpServer): void {
  registerToolDefs(server, [
    // Document discovery
    listFrmrDocumentsTool,
    getFrmrDocumentTool,
    listVersionsTool,
    // KSI tools
    listKsiTool,
    getKsiTool,
    filterByImpactTool,
    getThemeSummaryTool,
    getEvidenceChecklistTool,
    // Control mapping tools
    listControlsTool,
    getControlRequirementsTool,
    analyzeControlCoverageTool,
    // Search & lookup tools
    searchMarkdownTool,
    readMarkdownTool,
    searchDefinitionsTool,
    getRequirementByIdTool,
    // Analysis tools
    diffFrmrTool,
    grepControlsTool,
    significantChangeTool,
    // System tools
    healthCheckTool,
    updateRepositoryTool,
  ]);
}
