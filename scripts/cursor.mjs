// Cursor has no validator of its own, so the checks its submission list names are made here.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const kebab = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const read = (at) => JSON.parse(readFileSync(at, "utf8"));
const problems = [];

const market = read(".cursor-plugin/marketplace.json");
if (!kebab.test(market.name ?? "")) problems.push(`marketplace name "${market.name}" is not kebab-case`);
if (!market.owner?.name) problems.push("marketplace has no owner name");

const seen = new Set();
for (const entry of market.plugins ?? []) {
  const root = typeof entry.source === "string" ? entry.source : entry.source?.path;
  if (seen.has(entry.name)) problems.push(`plugin "${entry.name}" is listed twice`);
  seen.add(entry.name);
  if (!root || root.includes("..") || root.startsWith("/")) {
    problems.push(`plugin "${entry.name}" has a source that is not a relative path inside the repository`);
    continue;
  }
  const manifest = join(root, ".cursor-plugin", "plugin.json");
  if (!existsSync(manifest)) {
    problems.push(`${manifest} is missing`);
    continue;
  }
  const plugin = read(manifest);
  if (plugin.name !== entry.name) problems.push(`${manifest} is named "${plugin.name}", the marketplace says "${entry.name}"`);
  if (!plugin.description) problems.push(`${manifest} has no description`);
  for (const key of ["logo", "mcpServers"]) {
    const path = plugin[key];
    if (typeof path === "string" && !/^https?:/.test(path) && !existsSync(join(root, path))) {
      problems.push(`${manifest} points ${key} at ${path}, which is not there`);
    }
  }
}

if (problems.length) {
  for (const one of problems) console.error(`::error::${one}`);
  process.exit(1);
}
console.log(`Cursor marketplace: ${seen.size} plugin(s) in order`);
