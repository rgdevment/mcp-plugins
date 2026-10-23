#!/usr/bin/env bash
# After a Tisty release: publish to LobeHub the listing the LobeHub workflow refreshed and you merged.
#   scripts/release.sh 1.33.0
set -euo pipefail

cd "$(dirname "$0")/.."

version="${1:-}"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "usage: scripts/release.sh <Tisty version, like 1.33.0>" >&2
  exit 2
fi

cli="@lobehub/market-cli@0.0.43"
listing="listings/lobehub/tisty"

if ! npx -y "$cli" auth status --output json 2>/dev/null | grep -q '"status": "authenticated"\|"status": "token expired"'; then
  echo "LobeHub needs you signed in first: npx -y $cli login" >&2
  exit 1
fi

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

git fetch -q origin
git show "origin/main:$listing/lhm.plugin.json" > "$work/lhm.plugin.json"
merged=$(node -p "require(process.argv[1]).version" "$work/lhm.plugin.json")
if [ "$merged" != "$version" ]; then
  echo "main lists Tisty $merged on LobeHub, not $version. Refresh it and merge that pull request first:" >&2
  echo "  gh workflow run lobehub.yml -R rgdevment/mcp-plugins" >&2
  exit 1
fi

npx -y "$cli" plugin update --dir "$work"
echo "LobeHub has Tisty $version."
