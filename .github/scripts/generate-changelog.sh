#!/usr/bin/env bash
# ============================================================================
# generate-changelog.sh — Build a changelog from conventional commits
# Usage: ./generate-changelog.sh [since_tag]
# ============================================================================
set -euo pipefail

SINCE="${1:-$(git describe --tags --abbrev=0 2>/dev/null || echo '')}"

if [[ -n "$SINCE" ]]; then
  echo "## Changes since $SINCE"
  RANGE="${SINCE}..HEAD"
else
  echo "## All Changes"
  RANGE="HEAD"
fi

echo ""

declare -A SECTIONS=(
  ["feat"]="### ✨ Features"
  ["fix"]="### 🐛 Bug Fixes"
  ["perf"]="### ⚡ Performance"
  ["docs"]="### 📝 Documentation"
  ["chore"]="### 🔧 Chores"
  ["refactor"]="### ♻️ Refactors"
  ["test"]="### 🧪 Tests"
  ["ci"]="### 🤖 CI"
)

for prefix in feat fix perf docs chore refactor test ci; do
  COMMITS=$(git log "$RANGE" --oneline --grep="^${prefix}" 2>/dev/null || true)
  if [[ -n "$COMMITS" ]]; then
    echo "${SECTIONS[$prefix]}"
    echo ""
    while IFS= read -r line; do
      HASH=$(echo "$line" | awk '{print $1}')
      MSG=$(echo "$line" | cut -d' ' -f2-)
      echo "- ${MSG} (\`${HASH}\`)"
    done <<< "$COMMITS"
    echo ""
  fi
done
