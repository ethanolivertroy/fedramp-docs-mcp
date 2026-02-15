import { z } from "zod";

import { getControlMappings } from "../indexer.js";
import type { ToolDefinition } from "./base.js";

interface FamilyCoverage {
  family: string;
  controlCount: number;
  mappingCount: number;
  controls: string[];
  sources: string[];
}

const schema = z.object({});

export const analyzeControlCoverageTool: ToolDefinition<
  typeof schema,
  {
    totalFamilies: number;
    totalControls: number;
    totalMappings: number;
    families: FamilyCoverage[];
  }
> = {
  name: "analyze_control_coverage",
  title: "Analyze Control Coverage",
  description:
    "Analyze which NIST 800-53 control families have FedRAMP requirements. Returns a coverage report showing control families, number of controls and mappings per family, and which FRMR sources contribute. Useful for gap analysis and compliance dashboards. [Category: Controls]",
  schema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  execute: async () => {
    const mappings = getControlMappings();

    // Group by control family (first 2 characters, e.g., AC, SC, IA)
    const familyMap = new Map<
      string,
      { controls: Set<string>; mappings: number; sources: Set<string> }
    >();

    for (const mapping of mappings) {
      const family = mapping.control.split("-")[0];
      if (!familyMap.has(family)) {
        familyMap.set(family, {
          controls: new Set(),
          mappings: 0,
          sources: new Set(),
        });
      }
      const entry = familyMap.get(family)!;
      entry.controls.add(mapping.control);
      entry.mappings++;
      entry.sources.add(mapping.source);
    }

    const families: FamilyCoverage[] = [...familyMap.entries()]
      .map(([family, data]) => ({
        family,
        controlCount: data.controls.size,
        mappingCount: data.mappings,
        controls: [...data.controls].sort(),
        sources: [...data.sources].sort(),
      }))
      .sort((a, b) => b.mappingCount - a.mappingCount);

    const totalControls = new Set(mappings.map((m) => m.control)).size;

    return {
      totalFamilies: families.length,
      totalControls,
      totalMappings: mappings.length,
      families,
    };
  },
};
