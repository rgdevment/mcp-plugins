#!/usr/bin/env node
// Starts the MCP server of the Tisty installed here, so the server always matches the app and its data.
import { newest, places, run, standIn } from "./launch.mjs";

const looked = places();
const tisty = newest(looked);
if (tisty) {
  run(tisty, process.argv.slice(2));
} else {
  console.error("tisty-mcp: Tisty was not found; answering with how to install it");
  standIn(looked);
}
