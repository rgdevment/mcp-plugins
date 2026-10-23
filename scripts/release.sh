#!/usr/bin/env bash
# After a Tisty release: publish the LobeHub listing the daily workflow refreshed, or refresh it here first.
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
branch="chore/lobehub-$version"

if ! npx -y "$cli" auth status --output json 2>/dev/null | grep -q '"status": "authenticated"\|"status": "token expired"'; then
  echo "LobeHub needs you signed in first: npx -y $cli login" >&2
  exit 1
fi
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

git fetch -q origin
mkdir "$work/merged"
git show "origin/main:$listing/lhm.plugin.json" > "$work/merged/lhm.plugin.json"
if [ "$(node -p "require(process.argv[1]).version" "$work/merged/lhm.plugin.json")" = "$version" ]; then
  npx -y "$cli" plugin update --dir "$work/merged"
  echo "LobeHub has Tisty $version."
  exit 0
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "the working tree has changes; commit or set them aside first" >&2
  exit 1
fi

# The bundle carries the server for both systems, so no Tisty install is needed to read its tools.
gh release download "v$version" -R rgdevment/Tisty --dir "$work" \
  --pattern "tisty-mcp-$version.mcpb" --pattern SHA256SUMS
(cd "$work" && sha256sum --check --strict --ignore-missing SHA256SUMS)
unzip -q "$work/tisty-mcp-$version.mcpb" 'server/*' -d "$work/bundle"
case "$(uname -s)" in
  MINGW* | MSYS* | CYGWIN*) server="$work/bundle/server/tisty.exe" ;;
  *) server="$work/bundle/server/tisty"; chmod +x "$server" ;;
esac

git switch -q -c "$branch" --no-track origin/main
node scripts/lobehub.mjs "$version" "$server"
git add "$listing/lhm.plugin.json"
git commit -q -m "chore(listings): LobeHub lists Tisty $version"

npx -y "$cli" plugin update --dir "$listing"

echo
echo "LobeHub has Tisty $version. Open the pull request with:"
echo "  git push -u origin $branch"
echo "  gh pr create --base main --head $branch --title \"chore(listings): LobeHub lists Tisty $version\" --body \"The LobeHub manifest regenerated from Tisty $version's server and published with lhm plugin update.\""
