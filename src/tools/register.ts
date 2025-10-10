import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools as registerToolDefs } from "./base.js";
import { diffFrmrTool } from "./diff_frmr.js";
import { getFrmrDocumentTool } from "./get_frmr_document.js";
import { getKsiTool } from "./get_ksi.js";
import { significantChangeTool } from "./get_significant_change_guidance.js";
import { healthCheckTool } from "./health_check.js";
import { grepControlsTool } from "./grep_controls_in_markdown.js";
import { listControlsTool } from "./list_controls.js";
import { listFrmrDocumentsTool } from "./list_frmr_documents.js";
import { listKsiTool } from "./list_ksi.js";
import { listVersionsTool } from "./list_versions.js";
import { readMarkdownTool } from "./read_markdown.js";
import { searchMarkdownTool } from "./search_markdown.js";
import { updateRepositoryTool } from "./update_repository.js";

export function registerTools(server: McpServer): void {
  registerToolDefs(server, [
    listFrmrDocumentsTool,
    getFrmrDocumentTool,
    listKsiTool,
    getKsiTool,
    listControlsTool,
    searchMarkdownTool,
    readMarkdownTool,
    listVersionsTool,
    diffFrmrTool,
    grepControlsTool,
    significantChangeTool,
    healthCheckTool,
    updateRepositoryTool,
  ]);
}
