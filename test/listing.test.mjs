import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { apply, drift, registryDrift } from "../scripts/listing.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const FILES = [
  "listings/tisty.json",
  "listings/lobehub/tisty/lhm.plugin.json",
  "plugins/tisty/.claude-plugin/plugin.json",
  "plugins/tisty/.cursor-plugin/plugin.json",
  "plugins/tisty/package.json",
  ".claude-plugin/marketplace.json",
  "gemini-extension.json",
];

function copy() {
  const root = mkdtempSync(join(tmpdir(), "listing-"));
  for (const file of FILES) cpSync(join(ROOT, file), join(root, file), { recursive: true });
  return root;
}

function edit(root, file, change) {
  const json = JSON.parse(readFileSync(join(root, file), "utf8"));
  change(json);
  writeFileSync(join(root, file), `${JSON.stringify(json, null, 2)}\n`);
}

test("every manifest says what listings/tisty.json says", () => {
  assert.deepEqual(drift(), []);
});

test("a manifest changed by hand is caught, and apply writes it back", () => {
  const root = copy();
  edit(root, "plugins/tisty/.cursor-plugin/plugin.json", (json) => {
    json.description = "something else";
  });
  edit(root, "listings/lobehub/tisty/lhm.plugin.json", (json) => {
    json.tags = ["notes"];
  });
  assert.equal(drift(root).length, 2);
  assert.deepEqual(apply(root).sort(), ["listings/lobehub/tisty/lhm.plugin.json", "plugins/tisty/.cursor-plugin/plugin.json"]);
  assert.deepEqual(drift(root), []);
});

test("apply leaves the tools of the LobeHub listing as they were", () => {
  const root = copy();
  const before = JSON.parse(readFileSync(join(root, "listings/lobehub/tisty/lhm.plugin.json"), "utf8")).tools;
  edit(root, "listings/tisty.json", (json) => {
    json.lobehub.tags = ["memory", "notes"];
  });
  apply(root);
  const after = JSON.parse(readFileSync(join(root, "listings/lobehub/tisty/lhm.plugin.json"), "utf8"));
  assert.deepEqual(after.tags, ["memory", "notes"]);
  assert.deepEqual(after.tools, before);
});

test("versions that differ between manifests are caught", () => {
  const root = copy();
  edit(root, "gemini-extension.json", (json) => {
    json.version = "0.0.1";
  });
  assert.match(drift(root).join("\n"), /versions differ/);
});

test("a registry line past 100 characters is caught", () => {
  const root = copy();
  edit(root, "listings/tisty.json", (json) => {
    json.registry = "x".repeat(101);
  });
  assert.match(drift(root).join("\n"), /past the 100/);
});

test("Tisty's server.json is held to the same registry line", () => {
  const root = copy();
  const server = join(root, "server.json");
  const said = JSON.parse(readFileSync(join(root, "listings/tisty.json"), "utf8")).registry;
  writeFileSync(server, JSON.stringify({ description: said }));
  assert.deepEqual(registryDrift(server, root), []);
  writeFileSync(server, JSON.stringify({ description: "older words" }));
  assert.equal(registryDrift(server, root).length, 1);
});
