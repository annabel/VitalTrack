#!/usr/bin/env bash
# ============================================================================
# notify-deploy.sh — Post a deployment notification to a webhook
# Usage: ./notify-deploy.sh <environment> <url> [status]
# ============================================================================
set -euo pipefail

ENV="${1:-production}"
URL="${2:-}"
STATUS="${3:-success}"
WEBHOOK_URL="${DEPLOY_WEBHOOK_URL:-}"

if [[ -z "$WEBHOOK_URL" ]]; then
  echo "::warning::DEPLOY_WEBHOOK_URL not set — skipping notification"
  exit 0
fi

SHA="${GITHUB_SHA:-$(git rev-parse HEAD)}"
SHORT_SHA="${SHA:0:7}"
ACTOR="${GITHUB_ACTOR:-$(whoami)}"
RUN_URL="${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-local}/actions/runs/${GITHUB_RUN_ID:-0}"

PAYLOAD=$(cat <<EOF
{
  "environment": "${ENV}",
  "status": "${STATUS}",
  "url": "${URL}",
  "commit": "${SHORT_SHA}",
  "actor": "${ACTOR}",
  "run_url": "${RUN_URL}",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
)

echo "Sending deploy notification for ${ENV} (${STATUS})..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$WEBHOOK_URL")

if [[ "$HTTP_CODE" -ge 200 && "$HTTP_CODE" -lt 300 ]]; then
  echo "✅ Notification sent (HTTP $HTTP_CODE)"
else
  echo "::warning::Notification failed (HTTP $HTTP_CODE)"
fi
