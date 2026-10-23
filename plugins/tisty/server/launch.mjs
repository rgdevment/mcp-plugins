import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";

export const INSTALL = "https://www.tisty.app/docs/installation/";
const { version: VERSION } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

/** Where a Tisty install leaves its `tisty` command, most likely first; TISTY_PATH alone when it is set. */
export function places({ env = process.env, platform = process.platform, home = homedir(), windowsLocal } = {}) {
  if (env.TISTY_PATH) return [env.TISTY_PATH];
  const paths = platform === "win32" ? path.win32 : path.posix;
  const onPath = (name) =>
    (env.PATH ?? env.Path ?? "").split(paths.delimiter).filter(Boolean).map((dir) => paths.join(dir, name));
  let found = [];
  if (platform === "win32") {
    const local = env.LOCALAPPDATA ?? path.win32.join(home, "AppData", "Local");
    found = [
      path.win32.join(local, "Microsoft", "WindowsApps", "tisty.exe"),
      path.win32.join(local, "Programs", "Tisty", "tisty.exe"),
      ...onPath("tisty.exe"),
    ];
  } else if (platform === "darwin") {
    found = [
      "/Applications/Tisty.app/Contents/MacOS/tisty",
      path.posix.join(home, "Applications", "Tisty.app", "Contents", "MacOS", "tisty"),
      "/opt/homebrew/bin/tisty",
      "/usr/local/bin/tisty",
      ...onPath("tisty"),
    ];
  } else {
    // Tisty has no Linux build; inside WSL the Windows install is the one to reach.
    const local = windowsLocal ?? (env.WSL_DISTRO_NAME ? wslLocalAppData() : undefined);
    if (local) {
      found = [
        path.posix.join(local, "Microsoft", "WindowsApps", "tisty.exe"),
        path.posix.join(local, "Programs", "Tisty", "tisty.exe"),
      ];
    }
    found.push(...onPath("tisty"), ...onPath("tisty.exe"));
  }
  return [...new Set(found)];
}

function wslLocalAppData() {
  const asked = spawnSync("cmd.exe", ["/d", "/c", "echo %LOCALAPPDATA%"], { encoding: "utf8", timeout: 5000 });
  const windows = asked.stdout?.trim();
  if (asked.status !== 0 || !windows || windows.includes("%")) return undefined;
  const converted = spawnSync("wslpath", ["-u", windows], { encoding: "utf8", timeout: 5000 });
  return converted.status === 0 ? converted.stdout.trim() : undefined;
}

/** The version a `tisty --version` answer names, or undefined. */
export function versionOf(said) {
  const match = /^tisty (\d+)\.(\d+)\.(\d+)(-\S+)?\s*$/.exec(said ?? "");
  return match ? { parts: match.slice(1, 4).map(Number), pre: match[4] ?? "" } : undefined;
}

export function newer(a, b) {
  for (let i = 0; i < 3; i++) if (a.parts[i] !== b.parts[i]) return a.parts[i] > b.parts[i];
  if (a.pre === b.pre) return false;
  if (!a.pre) return true;
  if (!b.pre) return false;
  return a.pre.localeCompare(b.pre, "en", { numeric: true }) > 0;
}

/** The place whose Tisty answers with the newest version; the earlier place wins a tie. */
export function newest(candidates, ask = askVersion) {
  let best;
  for (const file of candidates) {
    const version = versionOf(ask(file));
    if (version && (!best || newer(version, best.version))) best = { file, version };
  }
  return best?.file;
}

function askVersion(file) {
  const asked = spawnSync(file, ["--version"], { encoding: "utf8", timeout: 10_000, windowsHide: true });
  return asked.status === 0 ? asked.stdout.trim() : undefined;
}

export function run(file, args) {
  const server = spawn(file, ["mcp", ...args], { stdio: "inherit", windowsHide: true });
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.kill(signal));
  server.on("error", (why) => {
    console.error(`tisty-mcp: ${file} could not start: ${why.message}`);
    process.exit(1);
  });
  server.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
}

export function missing(looked) {
  return [
    "Tisty is not installed on this computer, or not where this launcher looks, so its tools are not available.",
    `Install it from ${INSTALL}: on Windows from the Microsoft Store or the installer, on macOS with \`brew install --cask rgdevment/tap/tisty\`.`,
    "Open it once, turn assistants on in Settings › Assistants, then restart this assistant.",
    "If Tisty is installed somewhere else, set TISTY_PATH to the full path of its `tisty` command.",
    `Looked in: ${looked.length ? looked.join(", ") : "nowhere (no place known for this system)"}.`,
  ].join("\n");
}

/** Without Tisty, a server of one tool that tells the person how to get it. */
export function standIn(looked, input = process.stdin, output = process.stdout) {
  const message = missing(looked);
  const answer = (id, result) => output.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
  const refuse = (id, code, text) =>
    output.write(`${JSON.stringify({ jsonrpc: "2.0", id, error: { code, message: text } })}\n`);
  const lines = createInterface({ input });
  lines.on("line", (line) => {
    let request;
    try {
      request = JSON.parse(line);
    } catch {
      return refuse(null, -32700, "not JSON");
    }
    if (request.id === undefined) return;
    switch (request.method) {
      case "initialize":
        return answer(request.id, {
          protocolVersion: request.params?.protocolVersion ?? "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: { name: "tisty", version: VERSION },
          instructions: message,
        });
      case "ping":
        return answer(request.id, {});
      case "tools/list":
        return answer(request.id, {
          tools: [
            {
              name: "install_tisty",
              title: "How to install Tisty",
              description:
                "Tisty is not installed on this computer, so its tools are missing. Call this for the steps to install it and tell the person.",
              inputSchema: { type: "object", properties: {}, additionalProperties: false },
            },
          ],
        });
      case "tools/call":
        if (request.params?.name !== "install_tisty") return refuse(request.id, -32602, "unknown tool");
        return answer(request.id, { content: [{ type: "text", text: message }] });
      default:
        return refuse(request.id, -32601, `${request.method} is not available until Tisty is installed`);
    }
  });
  return lines;
}
