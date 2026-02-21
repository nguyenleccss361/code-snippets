#!/usr/bin/env bash

set -euo pipefail

PROMPT="Ultrathink. You're a principal engineer. Do not ask me any questions. We need to improve the quality of this codebase.  Implement improvements to codebase quality."
MAX_ITERS="200"

for i in $(seq 1 "$MAX_ITERS"); do
  claude --dangerously-skip-permissions -p "$PROMPT"

  git add -A

  if git diff --cached --quiet; then
    echo "No changes this round, skipping commit."
  else
    git commit --no-verify -m "yolo run #$i: $PROMPT"
  fi
done
