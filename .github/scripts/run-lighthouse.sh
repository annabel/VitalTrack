#!/usr/bin/env bash
# ============================================================================
# run-lighthouse.sh — Run Lighthouse CI audit against a URL
# Usage: ./run-lighthouse.sh <url> [threshold]
# ============================================================================
set -euo pipefail

URL="${1:-}"
THRESHOLD="${2:-80}"

if [[ -z "$URL" ]]; then
  echo "::error::Usage: $0 <url> [threshold]"
  exit 1
fi

echo "Running Lighthouse audit on $URL (threshold: ${THRESHOLD})..."

# Check if lhci is available, otherwise fall back to npx
if command -v lhci &>/dev/null; then
  LHCI="lhci"
else
  LHCI="npx -y @lhci/cli"
fi

# Create temporary Lighthouse config
TMPDIR=$(mktemp -d)
cat > "$TMPDIR/lighthouserc.json" <<EOF
{
  "ci": {
    "collect": {
      "url": ["${URL}"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": $(echo "scale=2; $THRESHOLD / 100" | bc)}],
        "categories:accessibility": ["warn", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.9}],
        "categories:seo": ["warn", {"minScore": 0.9}]
      }
    }
  }
}
EOF

$LHCI autorun --config="$TMPDIR/lighthouserc.json" || EXIT_CODE=$?

rm -rf "$TMPDIR"

if [[ "${EXIT_CODE:-0}" -ne 0 ]]; then
  echo "::warning::Lighthouse audit completed with assertions below threshold"
  exit "${EXIT_CODE}"
fi

echo "✅ All Lighthouse scores meet thresholds"
