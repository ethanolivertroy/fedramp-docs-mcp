import { z } from "zod";

import { searchMarkdown } from "../search.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  query: z.string().describe("Search query for full-text search across FedRAMP documentation"),
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of results to return"),
  offset: z.number().int().min(0).default(0).describe("Number of results to skip for pagination"),
});

export const searchMarkdownTool: ToolDefinition<
  typeof schema,
  ReturnType<typeof searchMarkdown>
> = {
  name: "search_markdown",
  title: "Search FedRAMP Documentation",
  description:
    "Full-text search across FedRAMP markdown documentation and guidance. Use this to find information about policies, procedures, requirements, and guidance. Searches over 60 indexed markdown files covering authorization, continuous monitoring, incident response, significant change, and more. Examples: 'continuous monitoring', 'incident response', 'significant change', 'authorization boundary'. [Category: Search]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async (input) => {
    return searchMarkdown(input.query, input.limit ?? 20, input.offset ?? 0);
  },
};
