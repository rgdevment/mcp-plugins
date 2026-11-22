#!/usr/bin/env bash
# Prints the Tisty version LobeHub's page shows, «none» when there is no page, and nothing when it cannot be told.
set -euo pipefail

page="${1:-}"
if [ -z "$page" ]; then
  echo "usage: scripts/lobehub-shows.sh <LobeHub page of the plugin>" >&2
  exit 2
fi

body=$(mktemp)
trap 'rm -f "$body"' EXIT

code=$(curl -s -o "$body" -w '%{http_code}' "$page")
case "$code" in
  200) sed -nE 's/^[|] Version +[|] *([0-9.]+).*/\1/p' "$body" ;;
  404) echo "none" ;;
  *) echo "::warning::LobeHub answered $code, so there is nothing to compare" >&2 ;;
esac
