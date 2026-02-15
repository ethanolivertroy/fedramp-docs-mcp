import { z } from "zod";

import type { ToolDefinition } from "./base.js";
import { searchToolCatalog, type ToolSearchResult } from "./tool_catalog.js";

const schema = z.object({
  query: z.string().default("").describe("Search query to find tools by name, keyword, or description. Leave empty to browse all tools."),
  category: z
    .enum(["Discovery", "KSI", "Controls", "Search", "Analysis", "System"])
    .optional()
    .describe("Filter results by tool category"),
  limit: z.number().int().min(1).max(21).default(5).describe("Maximum number of results to return"),
});

interface SearchToolsResult {
  total: number;
  results: ToolSearchResult[];
}

export const searchToolsTool: ToolDefinition<
  typeof schema,
  SearchToolsResult
> = {
  name: "search_tools",
  title: "Search Available Tools",
  description:
    "Search and discover available FedRAMP MCP tools by keyword or category. Use this to find the right tool for your task. Returns tool names, descriptions, categories, and parameters. Supports browsing all tools (empty query) or searching by keyword. Categories: Discovery, KSI, Controls, Search, Analysis, System. [Category: System]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async (input) => {
    const results = searchToolCatalog(
      input.query ?? "",
      input.category,
      input.limit ?? 5,
    );
    return {
      total: results.length,
      results,
    };
  },
};
