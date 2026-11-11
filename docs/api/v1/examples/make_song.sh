#!/usr/bin/env sh
# Make a song with the Plenio Song API and download its files - curl and jq.
#
#   ./make_song.sh "a night drive through a rainy city" synthwave
#
# PLENIO_API sets another address (default http://127.0.0.1:8188/plenio/api/v1). The guide: docs/api/README.md.
set -eu

API="${PLENIO_API:-http://127.0.0.1:8188/plenio/api/v1}"
ORIGIN=$(printf '%s' "$API" | sed -E 's#^(https?://[^/]+).*#\1#')
DESCRIPTION="${1:-a summer night at the lake with friends}"
GENRE="${2:-}"
KEY="make-song-$(date +%s)-$$"

REQUEST=$(jq -n --arg d "$DESCRIPTION" --arg g "$GENRE" '{
  template: "yue2-song",
  fields: ({description: $d, vocals: "sung", length: "short (about 1:30)", "finish.cover_art": true}
           + (if $g == "" then {} else {genre: $g} end)),
  client: {name: "make_song.sh"}
}')

# the same Idempotency-Key again never makes a second song
JOB=$(curl -sS -X POST "$API/jobs" -H "Content-Type: application/json" -H "Idempotency-Key: $KEY" -d "$REQUEST")
ID=$(printf '%s' "$JOB" | jq -r '.id // empty')
if [ -z "$ID" ]; then
  printf '%s\n' "$JOB" | jq '.error'
  exit 1
fi
echo "job $ID"

STATUS=$(printf '%s' "$JOB" | jq -r .status)
while [ "$STATUS" != "succeeded" ] && [ "$STATUS" != "failed" ] && [ "$STATUS" != "cancelled" ]; do
  JOB=$(curl -sS "$API/jobs/$ID?wait=30")      # answers when something changes, or after 30 s
  STATUS=$(printf '%s' "$JOB" | jq -r .status)
  echo "$STATUS $(printf '%s' "$JOB" | jq -r '.stage.text // ""')"
done

if [ "$STATUS" != "succeeded" ]; then
  printf '%s\n' "$JOB" | jq '.error'
  exit 1
fi
mkdir -p songs
printf '%s' "$JOB" | jq -r '.result.files[] | [.name, .url] | @tsv' | while IFS="$(printf '\t')" read -r NAME URL; do
  curl -sS -o "songs/$NAME" "$ORIGIN$URL"
  echo "saved songs/$NAME"
done
