#!/usr/bin/env bash
# ============================================================================
# check-bundle-size.sh — Fail CI if production bundle exceeds size budget
# Usage: ./check-bundle-size.sh [max_kb] [dist_dir]
# ============================================================================
set -euo pipefail

MAX_KB="${1:-500}"
DIST="${2:-dist}"

if [[ ! -d "$DIST" ]]; then
  echo "::error::Directory '$DIST' does not exist. Run the build first."
  exit 1
fi

echo "Checking bundle size in $DIST (limit: ${MAX_KB}KB)..."

TOTAL=0
while IFS= read -r file; do
  SIZE=$(wc -c < "$file")
  SIZE_KB=$(( SIZE / 1024 ))
  TOTAL=$(( TOTAL + SIZE ))
  printf "  %6dKB  %s\n" "$SIZE_KB" "$file"
done < <(find "$DIST" -type f -name '*.js' -o -name '*.css' | sort)

TOTAL_KB=$(( TOTAL / 1024 ))
echo ""
echo "Total: ${TOTAL_KB}KB / ${MAX_KB}KB"

if (( TOTAL_KB > MAX_KB )); then
  echo "::error::Bundle size ${TOTAL_KB}KB exceeds budget of ${MAX_KB}KB"
  exit 1
fi

echo "✅ Bundle size within budget"
