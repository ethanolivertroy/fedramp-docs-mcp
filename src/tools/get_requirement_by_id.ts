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
      "Requirement ID (e.g., KSI-IAM-AAM, MAS-CSO-IIR, FRD-ACV)",
    ),
});

export const getRequirementByIdTool: ToolDefinition<
  typeof schema,
  RequirementResult
> = {
  name: "get_requirement_by_id",
  title: "Get Requirement by ID",
  description:
    "Get any FedRAMP requirement by its ID. Works with KSI indicators (KSI-*), FRR requirements (FRR-*), FRD definitions (FRD-*), and other FRMR item types. Universal lookup across all indexed documents. Case-insensitive. [Category: Search]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
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

      const found = findItemById(doc.raw, searchId);
      if (found) {
        const record = found.item;
        return {
          id: found.id,
          source: doc.type,
          documentPath: doc.path,
          documentTitle: doc.title,
          title:
            (record.name as string | undefined) ??
            (record.title as string | undefined),
          statement: record.statement as string | undefined,
          description: (record.description as string | undefined) ??
            (record.definition as string | undefined),
          theme: (record.theme as string | undefined) ??
            (record.category as string | undefined),
          impact: record.impact as
            | { low?: boolean; moderate?: boolean; high?: boolean }
            | undefined,
          controlMapping: Array.isArray(record.controls)
            ? (record.controls as string[])
            : undefined,
          raw: record,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function findItemById(
  obj: unknown,
  targetId: string,
): { id: string; item: Record<string, unknown> } | null {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findItemById(item, targetId);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (!isRecord(obj)) {
    return null;
  }

  if (
    typeof obj.id === "string" &&
    obj.id.toUpperCase() === targetId
  ) {
    return {
      id: obj.id,
      item: obj,
    };
  }

  for (const [key, value] of Object.entries(obj)) {
    if (key.toUpperCase() === targetId && isRecord(value)) {
      return {
        id: key,
        item: { id: key, ...value },
      };
    }
    const found = findItemById(value, targetId);
    if (found) {
      return found;
    }
  }

  return null;
}
