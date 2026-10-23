#!/usr/bin/env bash
# Tisty's releases carry no bare server, so this builds the one a tag ships, stamped as its release stamps it.
#   scripts/build-tisty.sh 1.33.0 [folder]   prints the path of the built `tisty`
set -euo pipefail

version="${1:-}"
folder="${2:-tisty-source}"
if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "usage: scripts/build-tisty.sh <Tisty version, like 1.33.0> [folder]" >&2
  exit 2
fi

git clone -q --depth 1 --branch "v$version" https://github.com/rgdevment/Tisty.git "$folder" >&2
cd "$folder"
cargo fetch --locked >&2
sed -i.bak -e "s/^version = .*/version = \"$version\"/" Cargo.toml && rm -f Cargo.toml.bak
cargo update --workspace --offline >&2
cargo build --release --locked -p tisty-cli >&2
built="$PWD/target/release/tisty"
test "$("$built" --version)" = "tisty $version"
echo "$built"
