#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")" && pwd)"
node "$ROOT/tools/tw-kit.mjs" test p2 all
