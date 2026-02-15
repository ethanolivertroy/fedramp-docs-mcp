import { z } from "zod";

import { getMarkdownDoc } from "../indexer.js";
import type { ToolDefinition } from "./base.js";
import { createError } from "../util.js";

const schema = z.object({
  path: z.string().describe("Path to the markdown file (as returned by search_markdown)"),
});

export const readMarkdownTool: ToolDefinition<
  typeof schema,
  {
    path: string;
    sha256: string;
    content: string;
  }
> = {
  name: "read_markdown",
  title: "Read Markdown File",
  description:
    "Read a FedRAMP markdown file and return its full contents and SHA-256 digest. Use search_markdown first to find relevant file paths, then read_markdown to retrieve the complete document content. [Category: Search]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async (input) => {
    const doc = getMarkdownDoc(input.path);
    if (!doc) {
      throw createError({
        code: "NOT_FOUND",
        message: `Markdown file not indexed: ${input.path}`,
      });
    }
    return {
      path: doc.path,
      sha256: doc.sha256,
      content: doc.content,
    };
  },
};
