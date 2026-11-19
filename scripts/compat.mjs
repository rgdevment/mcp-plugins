// The skills and Cline's guide name Tisty tools and prompts; this asks a real Tisty server that they still exist and tools take the arguments named.
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const NAMED = {
  rules: ["topic"],
  catch_up: ["since"],
  read: ["task", "doc", "section", "marks", "print", "versions", "version"],
  brain: ["query", "doc", "task", "links", "part_of", "folder", "list"],
  tick: ["task", "state"],
  note: [],
  say_done: [],
  sum_up: [],
  propose: [],
  write_doc: ["compact", "person_asked"],
  edit_doc: [],
  flag_doc: ["reason", "instead"],
};
const PROMPTS = ["consolidate"];
const [tisty] = process.argv.slice(2);
if (!tisty) {
  console.error("usage: node scripts/compat.mjs <path-to-tisty>");
  process.exit(2);
}

// A profile of its own, so the check never reaches anybody's real data.
const server = spawn(tisty, ["mcp"], {
  env: { ...process.env, TISTY_PROFILE: "plugin-compat" },
  stdio: ["pipe", "pipe", "inherit"],
});
const fail = (why) => {
  console.error(`::error::${why}`);
  server.kill();
  process.exit(1);
};
server.on("error", (why) => fail(`${tisty} could not start: ${why.message}`));
server.on("exit", (code, signal) => fail(`the server stopped before answering (${signal ?? `exit ${code}`})`));
const lines = createInterface({ input: server.stdout });
const waiting = new Map();
lines.on("line", (line) => {
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    fail(`the server wrote something that is not JSON on stdout: ${line.slice(0, 200)}`);
  }
  waiting.get(message.id)?.(message);
});
const ask = (id, method, params = {}) =>
  new Promise((answer) => {
    waiting.set(id, answer);
    server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
  });
setTimeout(() => fail("the server did not answer within 30 seconds"), 30_000).unref();

const hello = await ask(1, "initialize", {
  protocolVersion: "2025-06-18",
  capabilities: {},
  clientInfo: { name: "mcp-plugins-compat", version: "1" },
});
if (hello.error) fail(`initialize failed: ${hello.error.message}`);
server.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })}\n`);

const listed = await ask(2, "tools/list");
if (listed.error) fail(`tools/list failed: ${listed.error.message}`);
const tools = new Map(listed.result.tools.map((tool) => [tool.name, tool]));
const missing = Object.keys(NAMED).filter((name) => !tools.has(name));
if (missing.length) fail(`the plugin's docs name tools this Tisty no longer has: ${missing.join(", ")}`);
const missingArguments = Object.entries(NAMED).flatMap(([name, args]) => {
  const properties = tools.get(name).inputSchema?.properties ?? {};
  return args.filter((arg) => !(arg in properties)).map((arg) => `${name}.${arg}`);
});
if (missingArguments.length) fail(`the plugin's docs name arguments this Tisty does not take: ${missingArguments.join(", ")}`);

const offered = await ask(3, "prompts/list");
if (offered.error) fail(`prompts/list failed: ${offered.error.message}`);
const prompts = new Set(offered.result.prompts.map((prompt) => prompt.name));
const missingPrompts = PROMPTS.filter((name) => !prompts.has(name));
if (missingPrompts.length) fail(`the plugin's docs name prompts this Tisty no longer offers: ${missingPrompts.join(", ")}`);

console.log(`${hello.result.serverInfo?.name} ${hello.result.serverInfo?.version}: ${tools.size} tools and ${prompts.size} prompts, all the named ones present`);
server.kill();
process.exit(0);
