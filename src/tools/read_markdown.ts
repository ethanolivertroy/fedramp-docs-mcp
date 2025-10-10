import { z } from "zod";

import { getMarkdownDoc } from "../indexer.js";
import type { ToolDefinition } from "./base.js";
import { createError } from "../util.js";

const schema = z.object({
  path: z.string(),
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
  description: "Read a markdown file and return its contents and digest.",
  schema,
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
