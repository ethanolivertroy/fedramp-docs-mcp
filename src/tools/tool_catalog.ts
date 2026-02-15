/**
 * Static catalog of all MCP tools with metadata for search/discovery.
 * Used by the search_tools tool to help clients find relevant tools.
 */

export interface ToolCatalogEntry {
  name: string;
  description: string;
  category: string;
  keywords: string[];
  parameters: string[];
}

export const TOOL_CATALOG: ToolCatalogEntry[] = [
  // Discovery
  {
    name: "list_frmr_documents",
    description: "List available FRMR documents and metadata. Starting point for exploring FedRAMP datasets.",
    category: "Discovery",
    keywords: ["frmr", "documents", "list", "browse", "discover", "metadata", "datasets", "json"],
    parameters: [],
  },
  {
    name: "get_frmr_document",
    description: "Retrieve a FRMR document with metadata, raw JSON, and summary.",
    category: "Discovery",
    keywords: ["frmr", "document", "get", "retrieve", "json", "raw", "ksi", "mas", "vdr", "frd"],
    parameters: ["type", "path"],
  },
  {
    name: "list_versions",
    description: "List detected FRMR versions and metadata for comparison.",
    category: "Discovery",
    keywords: ["versions", "list", "history", "releases", "changelog", "compare"],
    parameters: [],
  },
  // KSI
  {
    name: "list_ksi",
    description: "List and filter Key Security Indicators with text search, category, and status filters.",
    category: "KSI",
    keywords: ["ksi", "key security indicators", "list", "filter", "search", "indicators", "compliance"],
    parameters: ["id", "text", "category", "status", "limit", "offset"],
  },
  {
    name: "get_ksi",
    description: "Retrieve a single KSI entry by its ID with full details.",
    category: "KSI",
    keywords: ["ksi", "get", "indicator", "detail", "item", "lookup"],
    parameters: ["id"],
  },
  {
    name: "filter_by_impact",
    description: "Filter KSI items by FIPS 199 impact level (low, moderate, high).",
    category: "KSI",
    keywords: ["ksi", "impact", "filter", "fips", "low", "moderate", "high", "categorization"],
    parameters: ["impact", "limit", "offset"],
  },
  {
    name: "get_theme_summary",
    description: "Get comprehensive guidance for a KSI theme with indicators, impact breakdown, and related controls.",
    category: "KSI",
    keywords: ["ksi", "theme", "summary", "guidance", "iam", "cna", "mla", "indicators", "controls"],
    parameters: ["theme"],
  },
  {
    name: "get_evidence_examples",
    description: "Get suggested evidence examples for KSI compliance with automation sources.",
    category: "KSI",
    keywords: ["ksi", "evidence", "examples", "compliance", "automation", "audit", "artifacts", "collection"],
    parameters: ["theme", "id", "includeRetired"],
  },
  // Controls
  {
    name: "list_controls",
    description: "Return flattened NIST control mappings across all FRMR sets.",
    category: "Controls",
    keywords: ["controls", "nist", "mapping", "list", "800-53", "control family", "ac", "sc", "ia"],
    parameters: ["family", "control", "source"],
  },
  {
    name: "get_control_requirements",
    description: "Get all FedRAMP requirements mapped to a specific NIST control.",
    category: "Controls",
    keywords: ["control", "requirements", "nist", "mapping", "ksi", "frmr", "800-53"],
    parameters: ["control"],
  },
  {
    name: "analyze_control_coverage",
    description: "Analyze NIST control family coverage with FedRAMP requirement counts.",
    category: "Controls",
    keywords: ["control", "coverage", "analysis", "gap", "families", "dashboard", "report"],
    parameters: [],
  },
  // Search
  {
    name: "search_markdown",
    description: "Full-text search across FedRAMP markdown documentation and guidance.",
    category: "Search",
    keywords: ["search", "markdown", "fulltext", "documentation", "guidance", "policies", "procedures"],
    parameters: ["query", "limit", "offset"],
  },
  {
    name: "read_markdown",
    description: "Read a FedRAMP markdown file and return its full contents.",
    category: "Search",
    keywords: ["read", "markdown", "file", "content", "document", "guidance"],
    parameters: ["path"],
  },
  {
    name: "search_definitions",
    description: "Search FedRAMP definitions (FRD) by term with alternate terms.",
    category: "Search",
    keywords: ["definitions", "search", "frd", "glossary", "terms", "acronyms", "vocabulary"],
    parameters: ["term", "limit"],
  },
  {
    name: "get_requirement_by_id",
    description: "Get any FedRAMP requirement by its ID across all document types.",
    category: "Search",
    keywords: ["requirement", "id", "lookup", "ksi", "frd", "frr", "universal", "get"],
    parameters: ["id"],
  },
  // Analysis
  {
    name: "diff_frmr",
    description: "Compute a structured diff between two FRMR document versions.",
    category: "Analysis",
    keywords: ["diff", "compare", "versions", "changes", "added", "removed", "modified", "delta"],
    parameters: ["left_path", "right_path", "id_key"],
  },
  {
    name: "grep_controls_in_markdown",
    description: "Search markdown files for NIST control identifier occurrences.",
    category: "Analysis",
    keywords: ["grep", "control", "markdown", "search", "references", "occurrences", "nist"],
    parameters: ["control", "with_enhancements"],
  },
  {
    name: "get_significant_change_guidance",
    description: "Aggregate guidance related to FedRAMP Significant Change requirements.",
    category: "Analysis",
    keywords: ["significant change", "guidance", "notification", "assessment", "re-assessment", "scn"],
    parameters: ["limit"],
  },
  // System
  {
    name: "health_check",
    description: "Verify index status and report server health.",
    category: "System",
    keywords: ["health", "status", "diagnostics", "index", "server", "check"],
    parameters: [],
  },
  {
    name: "update_repository",
    description: "Force update the cached FedRAMP docs repository from GitHub.",
    category: "System",
    keywords: ["update", "repository", "refresh", "sync", "fetch", "github", "latest"],
    parameters: [],
  },
  {
    name: "search_tools",
    description: "Search and discover available FedRAMP MCP tools by keyword or category.",
    category: "System",
    keywords: ["search", "tools", "discover", "find", "help", "catalog", "list tools"],
    parameters: ["query", "category", "limit"],
  },
];

export interface ToolSearchResult extends ToolCatalogEntry {
  score: number;
}

/**
 * Search the tool catalog with weighted text scoring.
 *
 * Scoring:
 *  - Name exact match: +10
 *  - Name contains query: +5
 *  - Keyword exact match: +4
 *  - Keyword partial match: +2
 *  - Description contains query: +1
 *
 * Empty query returns all tools (browsing mode).
 */
export function searchToolCatalog(
  query: string,
  category?: string,
  limit = 5,
): ToolSearchResult[] {
  let entries = TOOL_CATALOG;

  // Filter by category if provided
  if (category) {
    const catLower = category.toLowerCase();
    entries = entries.filter(
      (entry) => entry.category.toLowerCase() === catLower,
    );
  }

  // Empty query returns all (browsing mode)
  if (!query.trim()) {
    return entries
      .map((entry) => ({ ...entry, score: 0 }))
      .slice(0, limit);
  }

  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(Boolean);

  const scored: ToolSearchResult[] = entries.map((entry) => {
    let score = 0;
    const nameLower = entry.name.toLowerCase();

    // Name exact match
    if (nameLower === queryLower) {
      score += 10;
    } else if (nameLower.includes(queryLower)) {
      // Name contains query
      score += 5;
    }

    // Check each query term against name
    for (const term of queryTerms) {
      if (nameLower.includes(term)) {
        score += 3;
      }
    }

    // Keyword matching
    for (const keyword of entry.keywords) {
      const kwLower = keyword.toLowerCase();
      if (kwLower === queryLower) {
        score += 4;
      } else if (kwLower.includes(queryLower) || queryLower.includes(kwLower)) {
        score += 2;
      }
      // Check individual query terms against keywords
      for (const term of queryTerms) {
        if (kwLower === term) {
          score += 3;
        } else if (kwLower.includes(term)) {
          score += 1;
        }
      }
    }

    // Description match
    const descLower = entry.description.toLowerCase();
    if (descLower.includes(queryLower)) {
      score += 1;
    }
    for (const term of queryTerms) {
      if (descLower.includes(term)) {
        score += 0.5;
      }
    }

    return { ...entry, score };
  });

  // Filter out zero-score results and sort by score descending
  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
