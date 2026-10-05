#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"
TARGET="$ROOT/05_MOODLE_SUBMISSION/FORMULAR_S01_RO.html"
if [[ ! -f "$TARGET" ]]; then echo "STOP: missing $TARGET" >&2; exit 2; fi
if command -v open >/dev/null 2>&1; then open "$TARGET"
elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$TARGET" >/dev/null 2>&1 &
else echo "Open manually: $TARGET"; fi
