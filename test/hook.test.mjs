import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { hooked, host } from "../plugins/tisty/server/launch.mjs";

const HOOK = fileURLToPath(new URL("../plugins/tisty/server/hook.mjs", import.meta.url));
const ECHO = ["-e", "process.stdin.pipe(process.stdout)"];
const read = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));

test("a Tisty that is not there is skipped for the next one", async () => {
  const said = await hooked(["/nowhere/tisty", process.execPath], ECHO, Buffer.from('{"decision":"block"}'));
  assert.equal(said, '{"decision":"block"}');
});

test("a Tisty that answers with an error says nothing, so an older one never breaks a turn", async () => {
  assert.equal(await hooked([process.execPath], ["-e", "process.exit(1)"], Buffer.from("{}")), "");
  assert.equal(await hooked([], ECHO, Buffer.from("{}")), "");
});

test("Copilot running the Claude plugin's hooks is answered as Copilot", () => {
  assert.equal(host("claude-code", { COPILOT_PLUGIN_ROOT: "/p" }), "copilot");
  assert.equal(host("claude-code", {}), "claude-code");
  assert.equal(host("gemini-cli", {}), "gemini-cli");
});

function ran(args, env) {
  return new Promise((done) => {
    const child = spawn(process.execPath, [HOOK, ...args], { env: { ...process.env, ...env } });
    const out = [];
    child.stdout.on("data", (chunk) => out.push(chunk));
    child.on("close", (code) => done({ code, said: Buffer.concat(out).toString("utf8") }));
    child.stdin.end('{"session_id":"s"}');
  });
}

test("the hook always ends without an error, whatever it was given", async () => {
  for (const args of [["claude-code", "stop"], ["claude-code", "later"], []]) {
    const { code, said } = await ran(args, { TISTY_PATH: process.execPath });
    assert.equal(code, 0, args.join(" "));
    assert.equal(said, "", args.join(" "));
  }
});

function commands(file) {
  return Object.values(read(file).hooks)
    .flat()
    .flatMap((group) => group.hooks)
    .map((one) => one.command);
}

test("the Claude Code plugin runs the hook for each moment", () => {
  const all = commands("plugins/tisty/hooks/hooks.json");
  for (const moment of ["start", "tool", "stop"]) {
    assert.ok(all.includes(`node "\${CLAUDE_PLUGIN_ROOT}/server/hook.mjs" claude-code ${moment}`), moment);
  }
});

test("the Gemini CLI extension runs the hook for each moment from its own folder", () => {
  const all = commands("hooks/hooks.json");
  for (const moment of ["start", "tool", "stop"]) {
    assert.ok(
      all.includes(`node '\${extensionPath}\${/}plugins\${/}tisty\${/}server\${/}hook.mjs' gemini-cli ${moment}`),
      moment,
    );
  }
});

test("Cursor reads a hooks file of its own and is given none", () => {
  const manifest = read("plugins/tisty/.cursor-plugin/plugin.json");
  assert.equal(manifest.hooks, "hooks/cursor.json");
  assert.deepEqual(read("plugins/tisty/hooks/cursor.json"), { hooks: {} });
});
