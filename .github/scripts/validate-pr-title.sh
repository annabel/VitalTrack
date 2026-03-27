#!/usr/bin/env bash
# ============================================================================
# validate-pr-title.sh — Enforce conventional commit format on PR titles
# Usage: ./validate-pr-title.sh "feat: add new widget"
# ============================================================================
set -euo pipefail

TITLE="${1:-${PR_TITLE:-}}"

if [[ -z "$TITLE" ]]; then
  echo "::error::No PR title provided. Pass as argument or set PR_TITLE env var."
  exit 1
fi

# Conventional commit prefixes
PATTERN="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,72}$"

echo "Validating PR title: \"$TITLE\""

if [[ "$TITLE" =~ $PATTERN ]]; then
  echo "✅ PR title follows conventional commit format"
  echo ""
  echo "  Type:  ${BASH_REMATCH[1]}"
  [[ -n "${BASH_REMATCH[2]:-}" ]] && echo "  Scope: ${BASH_REMATCH[2]}"
else
  echo "::error::PR title does not match conventional commit format."
  echo ""
  echo "Expected: <type>(<scope>): <description>"
  echo ""
  echo "Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert"
  echo "Max length: 72 characters"
  echo ""
  echo "Examples:"
  echo "  feat: add dark mode toggle"
  echo "  fix(chart): correct weekly average calculation"
  echo "  docs: update contributing guide"
  exit 1
fi
