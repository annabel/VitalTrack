#!/usr/bin/env bash
# ============================================================================
# cleanup-artifacts.sh — Remove stale build artifacts and caches
# Usage: ./cleanup-artifacts.sh [days_old]
# ============================================================================
set -euo pipefail

DAYS="${1:-7}"
REPO="${GITHUB_REPOSITORY:-}"

if [[ -z "$REPO" ]]; then
  echo "::error::GITHUB_REPOSITORY not set. Run inside GitHub Actions."
  exit 1
fi

echo "Cleaning artifacts older than ${DAYS} days in ${REPO}..."

CUTOFF=$(date -u -d "-${DAYS} days" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null \
  || date -u -v-"${DAYS}"d +%Y-%m-%dT%H:%M:%SZ)

ARTIFACTS=$(gh api "repos/${REPO}/actions/artifacts" \
  --paginate \
  --jq ".artifacts[] | select(.created_at < \"${CUTOFF}\" and .expired == false) | .id")

if [[ -z "$ARTIFACTS" ]]; then
  echo "No stale artifacts found."
  exit 0
fi

COUNT=0
while IFS= read -r id; do
  echo "  Deleting artifact $id..."
  gh api --method DELETE "repos/${REPO}/actions/artifacts/${id}" || true
  COUNT=$((COUNT + 1))
done <<< "$ARTIFACTS"

echo ""
echo "✅ Deleted $COUNT artifact(s)"
