#!/usr/bin/env bash
# ============================================================================
# update-badges.sh — Regenerate status badges in README.md
# Usage: ./update-badges.sh [readme_path]
# ============================================================================
set -euo pipefail

README="${1:-README.md}"
REPO="${GITHUB_REPOSITORY:-}"

if [[ ! -f "$README" ]]; then
  echo "::error::File '$README' not found."
  exit 1
fi

if [[ -z "$REPO" ]]; then
  echo "::warning::GITHUB_REPOSITORY not set — using placeholder"
  REPO="owner/repo"
fi

echo "Updating badges in $README..."

BADGE_BLOCK="<!-- BADGES:START -->
[![CI](https://github.com/${REPO}/actions/workflows/ci.yml/badge.svg)](https://github.com/${REPO}/actions/workflows/ci.yml)
[![CodeQL](https://github.com/${REPO}/actions/workflows/codeql.yml/badge.svg)](https://github.com/${REPO}/actions/workflows/codeql.yml)
[![License](https://img.shields.io/github/license/${REPO})](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/${REPO})](https://github.com/${REPO}/commits/main)
<!-- BADGES:END -->"

if grep -q "<!-- BADGES:START -->" "$README"; then
  # Replace existing badge block
  TEMP=$(mktemp)
  awk '
    /<!-- BADGES:START -->/ { skip=1; next }
    /<!-- BADGES:END -->/ { skip=0; next }
    !skip { print }
  ' "$README" > "$TEMP"

  # Insert new badge block at the position of the first heading or top
  if grep -qn "^# " "$TEMP"; then
    LINE=$(grep -n "^# " "$TEMP" | head -1 | cut -d: -f1)
    { head -n "$LINE" "$TEMP"; echo "$BADGE_BLOCK"; tail -n +"$((LINE + 1))" "$TEMP"; } > "$README"
  else
    { echo "$BADGE_BLOCK"; echo ""; cat "$TEMP"; } > "$README"
  fi
  rm "$TEMP"
  echo "✅ Updated existing badge block"
else
  # Insert after first heading
  if grep -qn "^# " "$README"; then
    LINE=$(grep -n "^# " "$README" | head -1 | cut -d: -f1)
    TEMP=$(mktemp)
    { head -n "$LINE" "$README"; echo ""; echo "$BADGE_BLOCK"; tail -n +"$((LINE + 1))" "$README"; } > "$TEMP"
    mv "$TEMP" "$README"
  else
    TEMP=$(mktemp)
    { echo "$BADGE_BLOCK"; echo ""; cat "$README"; } > "$TEMP"
    mv "$TEMP" "$README"
  fi
  echo "✅ Inserted new badge block"
fi
