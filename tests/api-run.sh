#!/usr/bin/env bash
# Fresh local D1 + wrangler dev, seed one legacy doc, run tests/api.mjs
set -e
pkill -f "wrangler dev" 2>/dev/null || true; sleep 1; rm -rf .wrangler/state
(npx wrangler dev --local --port 8799 --var ACCESS_PIN:1234 > /tmp/wrangler-api-test.log 2>&1 &)
for i in $(seq 1 60); do curl -s localhost:8799/api/auth/status >/dev/null 2>&1 && break; sleep 1; done
npx wrangler d1 execute fuel-lift-log --local --command "INSERT INTO docs (id,value,updated) VALUES ('settings','{}',1)" >/dev/null
node tests/api.mjs; s=$?; pkill -f "wrangler dev" || true; exit $s
