#!/bin/bash
# SC2034: <variable> appears unused.
# https://www.shellcheck.net/wiki/SC2034
# shellcheck disable=SC2034
# shellcheck disable=SC2086,SC2223

set -e -u -o pipefail
cd "$(dirname "$0")"
. .e2erc

# Default or assert variables required by the save_report.js script, and document optional variables
: ${FULL_REPORT:=false} # Valid values: true, false
: ${TYPE:=NONE}         # Valid values: PR, RELEASE, MASTER, MASTER_UNSTABLE, CLOUD, CLOUD_UNSTABLE, NONE (which is the same as omitting it); also known as REPORT_TYPE
: ${WEBHOOK_URL:-}      # Optional. Mattermost webhook to post the report back to
: ${RELEASE_DATE:-}     # Optional. If set, its value will be included in the report as the release date of the tested artifact
if [ "$TYPE" = "PR" ]; then
  # In this case, we expect the PR number to be present in the BRANCH variable
  BRANCH_REGEX='^server-pr-[0-9]+$'
  if ! grep -qE "${BRANCH_REGEX}"<<<"$BRANCH"; then
    mme2e_log "Error: when using TYPE=PR, the BRANCH variable should respect regex '$BRANCH_REGEX'. Aborting." >&2
    exit 1
  fi
  export PULL_REQUEST="https://github.com/mattermost/mattermost/pull/${BRANCH##*-}"
fi

# Env vars used during the test. Their values will be included in the report
: ${TEST:?} # See E2E tests' readme; usually set to 'cypress'
: ${BRANCH:?} # May be either a ref, a commit hash, or 'server-pr-PR_NUMBER' (if TYPE=PR)
: ${BUILD_ID:?}
: ${SERVER:?} # May be either 'onprem' or 'cloud'
: ${MM_ENV:-}

# Populate intermediate variables
export BUILD_TAG="${SERVER_IMAGE##*/}"
export MM_DOCKER_IMAGE="${BUILD_TAG%%:*}" # NB: the 'mattermostdevelopment/' prefix is assumed
export MM_DOCKER_TAG="${BUILD_TAG##*:}"
export SERVER_TYPE="${SERVER}"

if [ -n "${TM4J_API_KEY:-}" ]; then
  # Set additional variables required for Zephyr reporting
  if grep -q 'UNSTABLE' <<<"$TYPE"; then
    export TEST_SUITE=prod
  else
    export TEST_SUITE=unstable
  fi
  if [ "$TYPE" = "RELEASE" ]; then
    export SERVER_ARTIFACT_TYPE=release
  else
    export SERVER_ARTIFACT_TYPE=master
    export TEST_IS_DAILY=yes
  fi
  export TM4J_ENABLE=true
  export JIRA_PROJECT_KEY=MM
  export TM4J_ENVIRONMENT_NAME="${TEST@u}/${BROWSER@u}/${SERVER_ARTIFACT_TYPE}-${SERVER_TYPE}-ent${TEST_IS_DAILY:+-${TEST_SUITE}}"
  # Assert that the test type is among the ones supported by Zephyr, and select the corresponding folderId
  case "${SERVER}-${TYPE}" in
  onprem-RELEASE)
    export TM4J_FOLDER_ID="2014475" ;;
  onprem-MASTER)
    export TM4J_FOLDER_ID="2014476" ;;
  onprem-MASTER_UNSTABLE)
    export TM4J_FOLDER_ID="2014478" ;;
  cloud-RELEASE)
    export TM4J_FOLDER_ID="2014474" ;;
  cloud-CLOUD)
    export TM4J_FOLDER_ID="2014479" ;;
  cloud-CLOUD_UNSTABLE)
    export TM4J_FOLDER_ID="2014481" ;;
  *)
    mme2e_log "Error: unsupported Zephyr environment for the requested report (SERVER=${SERVER}, TYPE=${TYPE}). Aborting." >&2
    exit 1
  esac
  : ${TEST_CYCLE_LINK_PREFIX:?}
  : ${TM4J_CYCLE_KEY:-}  # Optional. Populated automatically by the reporting script
  : ${TM4J_CYCLE_NAME:-} # Optional. Populated automatically by the reporting script
  mme2e_log "TMJ4 integration enabled. Environment: $TM4J_ENVIRONMENT_NAME"
fi

if [ -n "${DIAGNOSTIC_WEBHOOK_URL:-}" ]; then
  : ${DIAGNOSTIC_USER_ID:?}
  : ${DIAGNOSTIC_TEAM_ID:?}
  mme2e_log "Diagnostic report upload enabled."
fi

if [ -n "${AWS_S3_BUCKET:-}" ]; then
  : ${AWS_ACCESS_KEY_ID:?}
  : ${AWS_SECRET_ACCESS_KEY:?}
  mme2e_log "S3 report upload enabled."
fi

cd ../cypress/
if [ ! -d "results/" ]; then
  mme2e_log "Error: 'results/' directory does not exist. Aborting report generation." >&2
  exit 1
fi

npm i
node save_report.js
