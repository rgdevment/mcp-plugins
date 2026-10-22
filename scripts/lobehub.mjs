// LobeHub only publishes for a signed-in person, so this refreshes the manifest and the person runs `lhm plugin update`.
import { execFileSync, execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MARKET_CLI = "@lobehub/market-cli@0.0.43";
const AT = "listings/lobehub/tisty/lhm.plugin.json";
// A profile of its own, so reading the tools never opens the door on anybody's real data.
const PROFILE = "lobehub-listing";

const [version, tisty] = process.argv.slice(2);
if (!/^\d+\.\d+\.\d+$/.test(version ?? "") || !tisty) {
  console.error("usage: node scripts/lobehub.mjs <version, like 1.33.0> <path-to-tisty>");
  process.exit(2);
}

if (/\s/.test(tisty)) {
  console.error(`the server's path cannot hold spaces, because LobeHub's CLI takes it as one command: ${tisty}`);
  process.exit(2);
}

const said = execFileSync(tisty, ["--version"], { encoding: "utf8" }).trim();
if (said !== `tisty ${version}`) {
  console.error(`${tisty} says «${said}», not tisty ${version}: point at the release being listed`);
  process.exit(1);
}

const owner = JSON.parse(readFileSync(AT, "utf8"));
const scratch = mkdtempSync(join(tmpdir(), "lobehub-"));
try {
  // init infers the description from package.json when the server does not give one.
  writeFileSync(join(scratch, "package.json"), JSON.stringify({ description: owner.description }));
  // npx needs a shell on Windows, which splits on spaces: the whole server command goes as one quoted word.
  execSync(
    `npx -y ${MARKET_CLI} plugin init --stdio "${tisty} mcp" --dir "${scratch}" --force`,
    { stdio: "inherit", env: { ...process.env, TISTY_PROFILE: PROFILE } },
  );
  const fresh = JSON.parse(readFileSync(join(scratch, "lhm.plugin.json"), "utf8"));
  const next = {
    ...owner,
    version,
    icon: owner.icon.replace(/\/v\d+\.\d+\.\d+\//, `/v${version}/`),
    tools: fresh.tools ?? [],
    resources: fresh.resources ?? [],
    prompts: fresh.prompts ?? [],
  };
  writeFileSync(AT, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`${AT}: ${version}, ${next.tools.length} tool(s)`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
