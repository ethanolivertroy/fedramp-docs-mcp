import { z } from "zod";

import { grepControlsInMarkdown } from "../search.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  control: z.string().describe("NIST control identifier to search for (e.g. AC-2, SC-7, IA-5)"),
  with_enhancements: z.boolean().default(true).describe("Include control enhancements (e.g. AC-2(1)) in search results"),
});

export const grepControlsTool: ToolDefinition<
  typeof schema,
  { matches: ReturnType<typeof grepControlsInMarkdown> }
> = {
  name: "grep_controls_in_markdown",
  title: "Grep Controls in Markdown",
  description:
    "Search FedRAMP markdown files for occurrences of a NIST control identifier. Returns file paths, line numbers, and surrounding context for each match. Optionally includes control enhancements. Useful for finding where specific controls are discussed in FedRAMP guidance. [Category: Analysis]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async (input) => {
    const matches = grepControlsInMarkdown(
      input.control,
      input.with_enhancements ?? true,
    );
    return { matches };
  },
};
