#!/usr/bin/env bash
# assets/check-pages.sh
#
# Browser-verify the LIVE GitHub Pages deployment matches the source.
# Run after any push to main, after waiting ~60s for Pages to rebuild.
#
# Checks:
#   - Every page returns HTTP 200
#   - Hub hero says "Seven systems" (the drift-rule count)
#   - shared.css is served (HTTP 200, content-type text/css)
#   - Each spoke's hub-links lists all N siblings
#   - Spoke end-marks on ALL N spokes match the count
#
# Usage:  ./assets/check-pages.sh
# Exit:   0 on success, 1 on any live-site drift
#
# Scope (intentionally narrow):
#   - Live-site reachability and copy drift
#   - Does NOT re-run the source-side check-links.js (that's local)
#   - Does NOT validate visual rendering (no headless browser)

set -euo pipefail

BASE="https://kajica2.github.io/kai-systems"
SPOKES=(terminal os video music chatterbot-tts trumpet twin)
FAIL=0

# Cache the page body for a spoke (one curl per spoke).
fetch_page() {
  curl -s --max-time 15 "$BASE/$1/"
}

# Hub-link to a sibling is present if either form exists in the page:
#   Format A: href="../<spoke>/index.html"  (terminal/video/music/chatterbot-tts/os)
#   Format B: href="../<spoke>/"            (trumpet/twin)
# Use grep -F (fixed-string) to avoid regex-escaping hell in bash.
has_hub_link() {
  local page="$1"
  local other="$2"
  echo "$page" | grep -qF "../${other}/index.html" && return 0
  echo "$page" | grep -qF "../${other}/\"" && return 0
  return 1
}

echo "Verifying live Pages deployment at $BASE"
echo

# --- 1. Hub status + hero copy ------------------------------------------

echo "[hub]"
HUB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$BASE/" || echo "000")
if [ "$HUB_STATUS" != "200" ]; then
  echo "  x hub returned HTTP $HUB_STATUS (expected 200)"
  FAIL=1
else
  echo "  ok HTTP 200"
fi

HUB_BODY=$(fetch_page "")
if echo "$HUB_BODY" | grep -q "<h1>Seven systems\."; then
  echo "  ok hero says 'Seven systems.'"
else
  echo "  x hero drift - did not find '<h1>Seven systems.'"
  FAIL=1
fi

# --- 2. shared.css served ------------------------------------------------

echo "[assets/shared.css]"
CSS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$BASE/assets/shared.css" || echo "000")
CSS_TYPE=$(curl -sI --max-time 15 "$BASE/assets/shared.css" | grep -i '^content-type:' | tr -d '\r' | awk '{print $2}')
if [ "$CSS_STATUS" = "200" ] && [[ "$CSS_TYPE" == text/css* ]]; then
  echo "  ok HTTP 200, content-type text/css"
else
  echo "  x HTTP $CSS_STATUS, content-type '$CSS_TYPE'"
  FAIL=1
fi

# --- 3. Every spoke reachable + hub-links complete ----------------------

for spoke in "${SPOKES[@]}"; do
  echo "[$spoke]"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$BASE/$spoke/" || echo "000")
  if [ "$STATUS" != "200" ]; then
    echo "  x returned HTTP $STATUS"
    FAIL=1
    continue
  fi
  echo "  ok HTTP 200"

  PAGE=$(fetch_page "$spoke")

  # Hub-links completeness
  for other in "${SPOKES[@]}"; do
    if [ "$other" = "$spoke" ]; then continue; fi
    if ! has_hub_link "$PAGE" "$other"; then
      echo "  x missing hub-link to sibling: $other"
      FAIL=1
    fi
  done

  # End-mark check (all 7 spokes ship one as of 2026-08-03 reconciliation)
  if echo "$PAGE" | grep -q "Seven stacks. One philosophy"; then
    echo "  ok end-mark matches"
  else
    echo "  x end-mark drift - expected 'Seven stacks. One philosophy'"
    FAIL=1
  fi
done

# --- 4. Report -----------------------------------------------------------

echo
if [ "$FAIL" -ne 0 ]; then
  echo "FAIL - live deployment has drift. Wait 60s for Pages rebuild and retry."
  exit 1
fi

echo "PASS - live deployment matches source."
echo "  hub:        200, hero says 'Seven systems.'"
echo "  assets:     shared.css 200, text/css"
echo "  spokes:     all 7 reachable, hub-links complete"
echo "  end-marks:  all 7 match"