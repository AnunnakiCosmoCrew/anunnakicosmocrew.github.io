#!/usr/bin/env bash
# SessionStart setup for Claude Code cloud sessions: the EmirErs agent routines
# (AnunnakiCosmoCrew/emirers#26 and #79) and claude.ai/code. This installs the
# npm workspaces the checks need on the Node .nvmrc names, as ci.yml does
# (check, build:web, check:links).
# Installing here means the agent never has to run `npm ci` itself, which auto
# mode can refuse (Pelerin-web#279).
# It is a no-op anywhere else: local sessions never set CLAUDE_CODE_REMOTE.
# Fails open: a failed step prints the tail of its output and never blocks the
# session, so the agent sees why above its first command.
set -uo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"

# Run "$@"; on failure print what failed ($1) and the last lines of its output.
step() {
  local what=$1 out; shift
  out=$("$@" 2>&1) || { echo "cloud-setup: $what failed:"; printf '%s\n' "$out" | tail -n 15; return 1; }
}

# When $1/.nvmrc names a newer Node major than the session has, switch to it
# through nvm for this script and the rest of the session; otherwise warn.
use_node() {
  [ -f "$1/.nvmrc" ] || return 0
  local want have bin
  want=$(tr -dc '0-9.' < "$1/.nvmrc"); want=${want%%.*}
  have=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
  [ -n "$want" ] && [ "$have" -lt "$want" ] || return 0
  NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1 && step "nvm install $want" nvm install "$want"; then
    bin=$(dirname "$(nvm which "$want")")
    export PATH="$bin:$PATH"
    [ -n "${CLAUDE_ENV_FILE:-}" ] && echo "export PATH=\"$bin:\$PATH\"" >> "$CLAUDE_ENV_FILE"
  else
    echo "cloud-setup: .nvmrc wants Node $want but this session has Node $have and no nvm to switch; checks may fail"
  fi
}

# `npm ci` in $1 when node_modules is missing or older than the lockfile (a
# resumed session on a branch that changed dependencies). No lifecycle scripts:
# nothing here needs one.
npm_ci() {
  [ -f "$1/package-lock.json" ] || return 0
  if [ ! -d "$1/node_modules" ] || [ "$1/package-lock.json" -nt "$1/node_modules/.package-lock.json" ]; then
    (cd "$1" && step "npm ci in $1 (its checks will not run)" npm ci --ignore-scripts --no-audit --no-fund)
  fi
}

use_node "$ROOT"
npm_ci "$ROOT"
exit 0
