import { z } from "zod";

import { grepControlsInMarkdown } from "../search.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  control: z.string(),
  with_enhancements: z.boolean().default(true),
});

export const grepControlsTool: ToolDefinition<
  typeof schema,
  { matches: ReturnType<typeof grepControlsInMarkdown> }
> = {
  name: "grep_controls_in_markdown",
  description: "Search markdown files for occurrences of a control identifier.",
  schema,
  execute: async (input) => {
    const matches = grepControlsInMarkdown(
      input.control,
      input.with_enhancements ?? true,
    );
    return { matches };
  },
};
