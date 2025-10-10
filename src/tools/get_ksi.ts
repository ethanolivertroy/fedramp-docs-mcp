import { z } from "zod";

import { getKsiItem } from "../frmr.js";
import type { ToolDefinition } from "./base.js";

const schema = z.object({
  id: z.string(),
});

export const getKsiTool: ToolDefinition<
  typeof schema,
  { item: ReturnType<typeof getKsiItem> }
> = {
  name: "get_ksi",
  description: "Retrieve a single KSI entry by id.",
  schema,
  execute: async (input) => {
    const item = getKsiItem(input.id);
    return { item };
  },
};
