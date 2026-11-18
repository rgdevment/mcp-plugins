#!/usr/bin/env node
// Hands what the assistant sent to the Tisty installed here; a hook never fails the assistant's turn.
import { hooked, host, places } from "./launch.mjs";

const MOMENTS = new Set(["start", "tool", "edit", "stop"]);

async function heardAll(input) {
  const chunks = [];
  for await (const chunk of input) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function main() {
  const [client, moment] = process.argv.slice(2);
  const heard = await heardAll(process.stdin);
  if (!client || !MOMENTS.has(moment)) return;
  const said = await hooked(places(), ["hook", host(client), moment], heard);
  if (said) await new Promise((done) => process.stdout.write(said, done));
}

main()
  .catch(() => {})
  .finally(() => {
    process.exitCode = 0;
  });
