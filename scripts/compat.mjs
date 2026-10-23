// The skill and Cline's guide name Tisty tools; this asks a real Tisty server that they still exist.
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const NAMED = ["rules", "find", "propose", "write_doc"];
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
const tools = new Set(listed.result.tools.map((tool) => tool.name));
const missing = NAMED.filter((name) => !tools.has(name));
if (missing.length) fail(`the plugin's docs name tools this Tisty no longer has: ${missing.join(", ")}`);

console.log(`${hello.result.serverInfo?.name} ${hello.result.serverInfo?.version}: ${tools.size} tools, all the named ones present`);
server.kill();
process.exit(0);
