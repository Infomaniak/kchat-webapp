#!/bin/bash
set -e -u -o pipefail
cd "$(dirname "$0")"
. .e2erc

mme2e_log "Loading variables from .env.cypress"
if ! [ -f .env.cypress ]; then
  mme2e_log "Error: .env.cypress is required to exist, for the test cycle to be generated. Aborting." >&2
  exit 1
fi
set -a
. .env.cypress

mme2e_log "Generating the test cycle on the Automation Dashboard"
cd ../cypress
# shellcheck disable=SC2086
exec node --trace-warnings generate_test_cycle.js $TEST_FILTER
