import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ToolAnnotations,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { createError, isToolExecutionError } from "../util.js";

interface ToolDefinition<Schema extends z.ZodTypeAny, Result> {
  name: string;
  title?: string;
  description: string;
  schema: Schema;
  annotations?: ToolAnnotations;
  execute: (input: z.infer<Schema>) => Promise<Result> | Result;
}

export function registerTool<Schema extends z.ZodTypeAny, Result>(
  server: McpServer,
  definition: ToolDefinition<Schema, Result>,
): void {
  // Extract the shape from the Zod schema for the inputSchema
  const schemaShape = definition.schema instanceof z.ZodObject
    ? definition.schema.shape
    : {};

  server.registerTool(
    definition.name,
    {
      title: definition.title,
      description: definition.description,
      inputSchema: schemaShape,
      annotations: definition.annotations,
    },
    async (args: any) => {
      try {
        const parsed = definition.schema.parse(args ?? {});
        const result = await definition.execute(parsed);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        } as CallToolResult;
      } catch (error) {
        const detail = isToolExecutionError(error)
          ? error.detail
          : createError({
              code: "IO_ERROR",
              message: (error as Error).message,
            }).detail;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: detail }),
            },
          ],
          isError: true,
        } as CallToolResult;
      }
    },
  );
}

export function registerTools(
  server: McpServer,
  definitions: Array<ToolDefinition<any, any>>,
): void {
  definitions.forEach((definition) => registerTool(server, definition));
}

export type { ToolDefinition };
