#!/usr/bin/env bash
# SessionStart setup for Claude Code cloud sessions (EmirErs routines and
# claude.ai/code), AnunnakiCosmoCrew/emirers#26 and #79. Cloud VMs are Ubuntu 24.04
# with Node 22, Java 21, Rust and Python preinstalled; this installs the
# npm workspaces the checks need, as ci.yml does (check, build:web, check:links).
# Installing here means the agent never has to run `npm ci` itself, which auto
# mode can refuse (Pelerin-web#279).
# It is a no-op anywhere else: local sessions never set CLAUDE_CODE_REMOTE.
# Fails open, so a failed install never blocks the session (the agent then
# sees the error above its first command).
set -uo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"

# `npm ci` in $1 when node_modules is missing or older than the lockfile (a
# resumed session on a branch that changed dependencies). No lifecycle scripts:
# nothing here needs one.
npm_ci() {
  [ -f "$1/package-lock.json" ] || return 0
  if [ ! -d "$1/node_modules" ] || [ "$1/package-lock.json" -nt "$1/node_modules/.package-lock.json" ]; then
    (cd "$1" && npm ci --ignore-scripts --no-audit --no-fund >/dev/null 2>&1) || echo "cloud-setup: npm ci failed in $1; its checks will not run"
  fi
}

npm_ci "$ROOT"
exit 0
