#!/bin/bash
set -e -u -o pipefail
cd "$(dirname "$0")"
. .e2erc

# Initialize Playwright report directory
mme2e_log "Prepare Playwright: clean and initialize report and logs directory"
${MME2E_DC_SERVER} exec -T -u "$MME2E_UID" -- playwright bash <<EOF
cd e2e-tests/playwright
rm -rf logs playwright-report test-results storage_state
mkdir -p logs
touch logs/mattermost.log
EOF

# # Install Playwright dependencies
# mme2e_log "Prepare Playwright: install dependencies"
# # ${MME2E_DC_SERVER} exec -T -u "$MME2E_UID" -- playwright bash <<EOF
# ${MME2E_DC_SERVER} exec -T -- playwright bash <<EOF
# cd e2e-tests/playwright
# npm i --cache /tmp/empty-cache -g yarn
# export NPM_TOKEN=npm_token
# yarn config set cacheFolder /tmp/empty-cache
# yarn
# EOF

# Enable next line to debug Playwright
# export DEBUG=pw:protocol,pw:browser,pw:api

# Run Playwright test
# Note: Run on chrome but eventually will enable to all projects which include firefox and ipad.
${MME2E_DC_SERVER} exec -i -u "$MME2E_UID" -- playwright bash -c "cd e2e-tests/playwright && npm run test -- --project=chrome" | tee ../playwright/logs/playwright.log

# Collect server logs
${MME2E_DC_SERVER} logs --no-log-prefix -- server >../playwright/logs/mattermost.log 2>&1
