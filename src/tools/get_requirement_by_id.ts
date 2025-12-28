import { z } from "zod";

import { getFrmrDocuments, getKsiItems } from "../indexer.js";
import { createError } from "../util.js";
import type { ToolDefinition } from "./base.js";

interface RequirementResult {
  id: string;
  source: string;
  documentPath: string;
  documentTitle: string;
  title?: string;
  statement?: string;
  description?: string;
  theme?: string;
  impact?: { low?: boolean; moderate?: boolean; high?: boolean };
  controlMapping?: string[];
  evidenceExamples?: string[];
  raw?: unknown;
}

const schema = z.object({
  id: z
    .string()
    .describe(
      "Requirement ID (e.g., KSI-IAM-01, FRR-MAS-01, FRR-VDR-01)",
    ),
});

export const getRequirementByIdTool: ToolDefinition<
  typeof schema,
  RequirementResult
> = {
  name: "get_requirement_by_id",
  description:
    "Get any FedRAMP requirement by its ID. Works with KSI indicators (KSI-*), FRR requirements (FRR-*), and FRD definitions (FRD-*).",
  schema,
  execute: async (input) => {
    const searchId = input.id.toUpperCase();

    // First check KSI items (most common)
    if (searchId.startsWith("KSI-")) {
      const ksiItems = getKsiItems();
      const ksiItem = ksiItems.find(
        (item) => item.id.toUpperCase() === searchId,
      );
      if (ksiItem) {
        return {
          id: ksiItem.id,
          source: "KSI",
          documentPath: ksiItem.docPath,
          documentTitle: "Key Security Indicators",
          title: ksiItem.title,
          statement: ksiItem.statement,
          description: ksiItem.description,
          theme: ksiItem.category,
          impact: ksiItem.impact,
          controlMapping: ksiItem.controlMapping,
          evidenceExamples: ksiItem.evidenceExamples,
        };
      }
    }

    // Search in all FRMR documents
    const docs = getFrmrDocuments();
    for (const doc of docs) {
      if (!doc.raw || typeof doc.raw !== "object") continue;

      // Recursive search for item with matching ID
      const found = findItemById(doc.raw, searchId);
      if (found) {
        return {
          id: searchId,
          source: doc.type,
          documentPath: doc.path,
          documentTitle: doc.title,
          title: (found as Record<string, unknown>).name as string | undefined,
          statement: (found as Record<string, unknown>).statement as
            | string
            | undefined,
          description: (found as Record<string, unknown>).description as
            | string
            | undefined,
          raw: found,
        };
      }
    }

    throw createError({
      code: "NOT_FOUND",
      message: `Requirement not found for ID: ${input.id}`,
      hint: "Try using list_frmr_documents to see available documents, or list_ksi to browse KSI items.",
    });
  },
};

function findItemById(obj: unknown, targetId: string): unknown | null {
  if (!obj || typeof obj !== "object") return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (
        item &&
        typeof item === "object" &&
        "id" in item &&
        String((item as Record<string, unknown>).id).toUpperCase() === targetId
      ) {
        return item;
      }
      const found = findItemById(item, targetId);
      if (found) return found;
    }
  } else {
    const record = obj as Record<string, unknown>;
    if ("id" in record && String(record.id).toUpperCase() === targetId) {
      return record;
    }
    for (const value of Object.values(record)) {
      const found = findItemById(value, targetId);
      if (found) return found;
    }
  }
  return null;
}
