import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chmodSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { PassThrough } from "node:stream";
import { test } from "node:test";

import { newest, newer, places, standIn, versionOf } from "../plugins/tisty/server/launch.mjs";

const LAUNCHER = new URL("../plugins/tisty/server/tisty.mjs", import.meta.url);

test("TISTY_PATH is the only place looked at when it is set", () => {
  assert.deepEqual(places({ env: { TISTY_PATH: "/opt/t/tisty", PATH: "/usr/bin" }, platform: "linux" }), ["/opt/t/tisty"]);
});

test("Windows looks at the Store alias, then the installer's folder, then the PATH", () => {
  const found = places({
    env: { LOCALAPPDATA: "C:\\Users\\a\\AppData\\Local", PATH: "C:\\bin;C:\\Users\\a\\AppData\\Local\\Programs\\Tisty" },
    platform: "win32",
    exists: () => true,
  });
  assert.deepEqual(found, [
    "C:\\Users\\a\\AppData\\Local\\Microsoft\\WindowsApps\\tisty.exe",
    "C:\\Users\\a\\AppData\\Local\\Programs\\Tisty\\tisty.exe",
    "C:\\bin\\tisty.exe",
  ]);
});

test("macOS looks in Applications and Homebrew before the PATH", () => {
  const found = places({ env: { PATH: "/usr/bin" }, platform: "darwin", home: "/Users/a", exists: () => true });
  assert.deepEqual(found, [
    "/Applications/Tisty.app/Contents/MacOS/tisty",
    "/Users/a/Applications/Tisty.app/Contents/MacOS/tisty",
    "/opt/homebrew/bin/tisty",
    "/usr/local/bin/tisty",
    "/usr/bin/tisty",
  ]);
});

test("WSL reaches the Windows install", () => {
  const found = places({ env: { PATH: "" }, platform: "linux", windowsLocal: "/mnt/c/Users/a/AppData/Local" });
  assert.deepEqual(found, [
    "/mnt/c/Users/a/AppData/Local/Microsoft/WindowsApps/tisty.exe",
    "/mnt/c/Users/a/AppData/Local/Programs/Tisty/tisty.exe",
  ]);
});

test("PATH folders without a tisty in them are left out", () => {
  const found = places({ env: { PATH: "/usr/bin:/opt/tisty/bin" }, platform: "linux", exists: (file) => file === "/opt/tisty/bin/tisty" });
  assert.deepEqual(found, ["/opt/tisty/bin/tisty"]);
});

test("versions read from `tisty --version`", () => {
  assert.deepEqual(versionOf("tisty 1.32.0"), { parts: [1, 32, 0], pre: "" });
  assert.deepEqual(versionOf("tisty 1.33.0-rc.2\n"), { parts: [1, 33, 0], pre: "-rc.2" });
  assert.equal(versionOf("something else"), undefined);
  assert.equal(versionOf(undefined), undefined);
});

test("a release is newer than its candidates, and rc.10 newer than rc.9", () => {
  assert.ok(newer(versionOf("tisty 1.33.0"), versionOf("tisty 1.33.0-rc.1")));
  assert.ok(newer(versionOf("tisty 1.33.0-rc.10"), versionOf("tisty 1.33.0-rc.9")));
  assert.ok(newer(versionOf("tisty 1.10.0"), versionOf("tisty 1.9.9")));
  assert.ok(!newer(versionOf("tisty 1.32.0"), versionOf("tisty 1.32.0")));
});

test("the newest Tisty wins, and the earlier place a tie", () => {
  const said = { store: "tisty 1.32.0", installer: "tisty 1.33.0", path: "tisty 1.33.0", gone: undefined };
  assert.equal(newest(["store", "gone", "installer", "path"], (file) => said[file]), "installer");
  assert.equal(newest(["gone"], (file) => said[file]), undefined);
});

// The stand-in can answer within the write that asked, before anyone waits, so answers queue up.
function talk(stream) {
  const lines = createInterface({ input: stream });
  const said = [];
  const waiting = [];
  lines.on("line", (line) => {
    const message = JSON.parse(line);
    const answer = waiting.shift();
    if (answer) answer(message);
    else said.push(message);
  });
  return () => (said.length ? Promise.resolve(said.shift()) : new Promise((answer) => waiting.push(answer)));
}

test("without Tisty, the stand-in answers with how to install it", async () => {
  const input = new PassThrough();
  const output = new PassThrough();
  const next = talk(output);
  const lines = standIn(["/nowhere/tisty"], input, output);
  const send = (message) => input.write(`${JSON.stringify({ jsonrpc: "2.0", ...message })}\n`);

  send({ id: 1, method: "initialize", params: { protocolVersion: "2025-11-25" } });
  const hello = await next();
  assert.equal(hello.result.protocolVersion, "2025-11-25");
  assert.match(hello.result.instructions, /tisty\.app\/docs\/installation/);

  send({ method: "notifications/initialized" });
  send({ id: 2, method: "tools/list" });
  assert.deepEqual((await next()).result.tools.map((tool) => tool.name), ["install_tisty"]);

  send({ id: 3, method: "tools/call", params: { name: "install_tisty", arguments: {} } });
  assert.match((await next()).result.content[0].text, /Looked in: \/nowhere\/tisty/);

  send({ id: 4, method: "resources/list" });
  assert.equal((await next()).error.code, -32601);
  lines.close();
});

test("with Tisty, the launcher hands stdio to `tisty mcp`", { skip: process.platform === "win32" }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "tisty-launch-"));
  const fake = join(dir, "tisty");
  writeFileSync(fake, '#!/bin/sh\nif [ "$1" = "--version" ]; then echo "tisty 9.9.9"; exit 0; fi\necho "args: $*"\nexec cat\n');
  chmodSync(fake, 0o755);
  const launcher = spawn(process.execPath, [fileURLToPath(LAUNCHER), "--extra"], { env: { ...process.env, TISTY_PATH: fake } });
  const lines = createInterface({ input: launcher.stdout });
  const line = () => new Promise((said) => lines.once("line", said));

  assert.equal(await line(), "args: mcp --extra");
  launcher.stdin.write("hello\n");
  assert.equal(await line(), "hello");
  launcher.stdin.end();
  assert.equal(await new Promise((done) => launcher.on("exit", done)), 0);
});
