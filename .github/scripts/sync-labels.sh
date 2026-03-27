#!/usr/bin/env bash
# ============================================================================
# sync-labels.sh — Sync GitHub labels from a YAML definition file
# Usage: ./sync-labels.sh [labels_file]
# ============================================================================
set -euo pipefail

LABELS_FILE="${1:-.github/labels.yml}"
REPO="${GITHUB_REPOSITORY:-}"

if [[ -z "$REPO" ]]; then
  echo "::error::GITHUB_REPOSITORY not set. Run inside GitHub Actions."
  exit 1
fi

if [[ ! -f "$LABELS_FILE" ]]; then
  echo "::error::Labels file '$LABELS_FILE' not found."
  exit 1
fi

echo "Syncing labels from $LABELS_FILE to $REPO..."

# Parse YAML labels (expects format: - name: "label" color: "hex" description: "...")
CREATED=0
UPDATED=0
ERRORS=0

# Simple line-based YAML parser for flat label lists
NAME="" COLOR="" DESC=""
while IFS= read -r line; do
  if [[ "$line" =~ ^[[:space:]]*-[[:space:]]*name:[[:space:]]*\"?([^\"]+)\"? ]]; then
    # If we have a pending label, create/update it
    if [[ -n "$NAME" ]]; then
      if gh label create "$NAME" --color "$COLOR" --description "$DESC" -R "$REPO" 2>/dev/null; then
        CREATED=$((CREATED + 1))
        echo "  Created: $NAME"
      elif gh label edit "$NAME" --color "$COLOR" --description "$DESC" -R "$REPO" 2>/dev/null; then
        UPDATED=$((UPDATED + 1))
        echo "  Updated: $NAME"
      else
        ERRORS=$((ERRORS + 1))
        echo "  ::warning::Failed: $NAME"
      fi
    fi
    NAME="${BASH_REMATCH[1]}"
    COLOR="ededed"
    DESC=""
  elif [[ "$line" =~ ^[[:space:]]*color:[[:space:]]*\"?#?([0-9a-fA-F]+)\"? ]]; then
    COLOR="${BASH_REMATCH[1]}"
  elif [[ "$line" =~ ^[[:space:]]*description:[[:space:]]*\"?([^\"]+)\"? ]]; then
    DESC="${BASH_REMATCH[1]}"
  fi
done < "$LABELS_FILE"

# Handle last label
if [[ -n "$NAME" ]]; then
  if gh label create "$NAME" --color "$COLOR" --description "$DESC" -R "$REPO" 2>/dev/null; then
    CREATED=$((CREATED + 1))
  elif gh label edit "$NAME" --color "$COLOR" --description "$DESC" -R "$REPO" 2>/dev/null; then
    UPDATED=$((UPDATED + 1))
  else
    ERRORS=$((ERRORS + 1))
  fi
fi

echo ""
echo "Summary: $CREATED created, $UPDATED updated, $ERRORS errors"
