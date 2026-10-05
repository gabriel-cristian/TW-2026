#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")" && pwd)"
command -v node >/dev/null 2>&1 || { echo "STOP  Node.js is not on PATH."; exit 2; }
node "$ROOT/tools/tw-kit.mjs" env
