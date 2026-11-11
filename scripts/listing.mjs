import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SOURCE = "listings/tisty.json";
const REGISTRY_LIMIT = 100;

const MANIFESTS = [
  {
    file: "plugins/tisty/.claude-plugin/plugin.json",
    wants: (words) => ({ description: words.description, keywords: words.keywords.plugin }),
    at: (json) => json,
  },
  {
    file: "plugins/tisty/.cursor-plugin/plugin.json",
    wants: (words) => ({ description: words.description, keywords: words.keywords.plugin }),
    at: (json) => json,
  },
  {
    file: ".claude-plugin/marketplace.json",
    wants: (words) => ({ description: `${words.description} ${words.marketplaceTail}`, keywords: words.keywords.marketplace }),
    at: (json) => json.plugins.find((one) => one.name === "tisty"),
  },
  {
    file: "gemini-extension.json",
    wants: (words) => ({ description: `${words.description} ${words.geminiTail}` }),
    at: (json) => json,
  },
  {
    file: "plugins/tisty/package.json",
    wants: (words) => ({ description: words.npm, keywords: words.keywords.npm }),
    at: (json) => json,
  },
  {
    file: "listings/lobehub/tisty/lhm.plugin.json",
    wants: (words) => ({ description: words.lobehub.description, tags: words.lobehub.tags }),
    at: (json) => json,
  },
  {
    file: "listings/lobehub/tisty/lhm.plugin.json",
    wants: (words) => ({ description: words.lobehub["es-ES"] }),
    at: (json) => json.localizations.find((one) => one.locale === "es-ES"),
  },
];

const VERSIONED = [
  "plugins/tisty/package.json",
  "plugins/tisty/.claude-plugin/plugin.json",
  "plugins/tisty/.cursor-plugin/plugin.json",
  "gemini-extension.json",
];

const read = (root, file) => JSON.parse(readFileSync(join(root, file), "utf8"));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function words(root = ROOT) {
  return read(root, SOURCE);
}

export function drift(root = ROOT) {
  const said = words(root);
  const found = [];
  for (const { file, wants, at } of MANIFESTS) {
    const place = at(read(root, file));
    for (const [field, value] of Object.entries(wants(said))) {
      if (!same(place?.[field], value)) found.push(`${file}: ${field} is not what ${SOURCE} says`);
    }
  }
  const versions = new Set(VERSIONED.map((file) => read(root, file).version));
  if (versions.size !== 1) found.push(`the plugin's versions differ: ${[...versions].join(", ")}`);
  if (said.registry.length > REGISTRY_LIMIT) found.push(`the registry line is ${said.registry.length} characters, past the ${REGISTRY_LIMIT} the MCP Registry takes`);
  return found;
}

export function apply(root = ROOT) {
  const said = words(root);
  const changed = new Set();
  for (const { file, wants, at } of MANIFESTS) {
    const json = read(root, file);
    const place = at(json);
    let moved = false;
    for (const [field, value] of Object.entries(wants(said))) {
      if (!same(place[field], value)) {
        place[field] = value;
        moved = true;
      }
    }
    if (moved) {
      writeFileSync(join(root, file), `${JSON.stringify(json, null, 2)}\n`);
      changed.add(file);
    }
  }
  return [...changed];
}

export function registryDrift(serverJson, root = ROOT) {
  const registry = JSON.parse(readFileSync(serverJson, "utf8")).description;
  const said = words(root).registry;
  return registry === said ? [] : [`Tisty's server.json says «${registry}», ${SOURCE} says «${said}»`];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [flag, path] = process.argv.slice(2);
  const found = flag === "--check" ? drift() : flag === "--registry" ? registryDrift(path) : null;
  if (found === null) {
    const changed = apply();
    console.log(changed.length ? `wrote ${changed.join(", ")}` : "every manifest already says what listings/tisty.json says");
  } else if (found.length) {
    for (const one of found) console.error(`::error::${one}`);
    process.exit(1);
  } else {
    console.log("no drift");
  }
}
