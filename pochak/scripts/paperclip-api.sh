#!/bin/bash
# Paperclip API wrapper script for agent heartbeats
# Usage: ./scripts/paperclip-api.sh <method> <endpoint> [body]
# Example: ./scripts/paperclip-api.sh GET /api/agents/me
# Example: ./scripts/paperclip-api.sh PATCH /api/issues/xxx '{"status":"done"}'

METHOD="${1:-GET}"
ENDPOINT="$2"
BODY="$3"

if [ -z "$PAPERCLIP_API_URL" ] || [ -z "$PAPERCLIP_API_KEY" ]; then
  echo '{"error":"PAPERCLIP_API_URL or PAPERCLIP_API_KEY not set"}'
  exit 1
fi

URL="${PAPERCLIP_API_URL}${ENDPOINT}"
RUN_HEADER=""
if [ -n "$PAPERCLIP_RUN_ID" ]; then
  RUN_HEADER="-H X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID"
fi

if [ "$METHOD" = "GET" ]; then
  curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" $RUN_HEADER "$URL"
elif [ -n "$BODY" ]; then
  curl -s -X "$METHOD" -H "Authorization: Bearer $PAPERCLIP_API_KEY" -H "Content-Type: application/json" $RUN_HEADER -d "$BODY" "$URL"
else
  curl -s -X "$METHOD" -H "Authorization: Bearer $PAPERCLIP_API_KEY" $RUN_HEADER "$URL"
fi
