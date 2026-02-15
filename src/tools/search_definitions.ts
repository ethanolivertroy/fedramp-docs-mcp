import { z } from "zod";

import { getFrmrDocuments } from "../indexer.js";
import type { ToolDefinition } from "./base.js";

interface Definition {
  id: string;
  term: string;
  definition: string;
  alts?: string[];
  note?: string;
}

const schema = z.object({
  term: z.string().describe("Search term to find in FedRAMP definitions (searches terms, definitions, and alternate names)"),
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of definitions to return"),
});

export const searchDefinitionsTool: ToolDefinition<
  typeof schema,
  { total: number; definitions: Definition[] }
> = {
  name: "search_definitions",
  title: "Search FedRAMP Definitions",
  description:
    "Search FedRAMP definitions (FRD document) by term. Returns matching definitions with their full text, alternate terms, and notes. Useful for looking up FedRAMP-specific terminology, acronyms, and compliance vocabulary. [Category: Search]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async (input) => {
    const frdDoc = getFrmrDocuments().find((doc) => doc.type === "FRD");
    if (!frdDoc || !frdDoc.raw) {
      return { total: 0, definitions: [] };
    }

    const raw = frdDoc.raw as Record<string, unknown>;
    const data = raw.data as Record<string, unknown> | undefined;
    const both = data?.both as Record<string, unknown> | undefined;
    const allDefs: Definition[] = both
      ? Object.entries(both)
          .filter(([, value]) => Boolean(value && typeof value === "object"))
          .map(([id, value]) => ({
            id,
            ...(value as Omit<Definition, "id">),
          }))
      : [];

    const searchLower = input.term.toLowerCase();
    const matches = allDefs.filter((def) => {
      if (def.term?.toLowerCase().includes(searchLower)) return true;
      if (def.definition?.toLowerCase().includes(searchLower)) return true;
      if (def.alts?.some((alt) => alt.toLowerCase().includes(searchLower)))
        return true;
      return false;
    });

    return {
      total: matches.length,
      definitions: matches.slice(0, input.limit),
    };
  },
};
