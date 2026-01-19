#!/bin/bash

# Ralph Loop Runner - Autonomous Claude Code execution
# Usage: ./ralph.sh <project-name> [max-iterations]

set -e

PROJECT_NAME="${1:-}"
MAX_ITERATIONS="${2:-50}"

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: ./ralph.sh <project-name> [max-iterations]"
  echo ""
  echo "Available projects:"
  ls -d */ 2>/dev/null | sed 's/\///' || echo "  (no projects found)"
  exit 1
fi

PROJECT_DIR=".claude/ralph/$PROJECT_NAME"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: Project directory not found: $PROJECT_DIR"
  exit 1
fi

PROMPT_FILE="$PROJECT_DIR/PROMPT.md"
PRD_FILE="$PROJECT_DIR/PRD.json"
PROGRESS_FILE="$PROJECT_DIR/progress.txt"

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: PROMPT.md not found in $PROJECT_DIR"
  exit 1
fi

# Extract completion promise from PRD.json
COMPLETION_PROMISE=$(grep -o '"completion_promise": "[^"]*"' "$PRD_FILE" | cut -d'"' -f4)

echo "========================================"
echo "  Ralph Loop - $PROJECT_NAME"
echo "========================================"
echo "Max iterations: $MAX_ITERATIONS"
echo "Completion signal: <promise>$COMPLETION_PROMISE</promise>"
echo "----------------------------------------"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo ">>> Iteration $i of $MAX_ITERATIONS"
  echo "----------------------------------------"

  # Run Claude Code with the prompt
  OUTPUT=$(claude --print "$PROMPT_FILE" 2>&1) || true

  echo "$OUTPUT"

  # Check for completion signal
  if echo "$OUTPUT" | grep -q "<promise>$COMPLETION_PROMISE</promise>"; then
    echo ""
    echo "========================================"
    echo "  PROJECT COMPLETE!"
    echo "========================================"
    echo "Completion signal received after $i iterations"
    exit 0
  fi

  # Brief pause between iterations
  sleep 2
done

echo ""
echo "========================================"
echo "  MAX ITERATIONS REACHED"
echo "========================================"
echo "Ran $MAX_ITERATIONS iterations without completion signal"
echo "Check progress.txt for current state"
exit 1
