import path from "node:path";
import url from "node:url";

const fixtureRepo = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  "fixtures",
  "repo",
);

process.env.FEDRAMP_DOCS_PATH = fixtureRepo;
process.env.FEDRAMP_DOCS_ALLOW_AUTO_CLONE = "false";
process.env.FEDRAMP_DOCS_INDEX_PERSIST = "false";
