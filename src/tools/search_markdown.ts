import { z } from "zod";

import { searchMarkdown } from "../search.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  query: z.string(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const searchMarkdownTool: ToolDefinition<
  typeof schema,
  ReturnType<typeof searchMarkdown>
> = {
  name: "search_markdown",
  description: "Full-text search across FedRAMP markdown documentation and guidance. Use this to find information about policies, procedures, requirements, and guidance. Examples: 'continuous monitoring', 'incident response', 'significant change', 'authorization boundary'.",
  schema,
  execute: async (input) => {
    return searchMarkdown(input.query, input.limit ?? 20, input.offset ?? 0);
  },
};
