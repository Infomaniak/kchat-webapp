#!/bin/bash

# latest=$(git describe --abbrev=0 --tags `git rev-list --tags --skip=1  --max-count=1`)

GITLAB_PROJECT_ACCESS_TOKEN=$1
GITLAB_PROJECT_TAG=$2
MILESTONE=$3
NOTIFY_CHANNEL=$4

postchangelog=$(curl --write-out '%{http_code}' --request POST --header "PRIVATE-TOKEN: ${GITLAB_PROJECT_ACCESS_TOKEN}" --data "version=${GITLAB_PROJECT_TAG}" "https://gitlab.infomaniak.ch/api/v4/projects/3225/repository/changelog")
changelog=$(curl --request GET --header "PRIVATE-TOKEN: ${GITLAB_PROJECT_ACCESS_TOKEN}" --data "version=${GITLAB_PROJECT_TAG}" "https://gitlab.infomaniak.ch/api/v4/projects/3225/repository/changelog" | jq -r '.notes')
release=$(curl --write-out '%{http_code}' --request POST --header "PRIVATE-TOKEN: ${GITLAB_PROJECT_ACCESS_TOKEN}" --data "name=${GITLAB_PROJECT_TAG}&tag_name=${GITLAB_PROJECT_TAG}&description=${changelog}&milestones=${MILESTONE}" "https://gitlab.infomaniak.ch/api/v4/projects/3225/releases")

commit_url="https://gitlab.infomaniak.ch/kchat/webapp/-/commit/"
mr_url="https://gitlab.infomaniak.ch/kchat/webapp/-/merge_requests/"

format1=${changelog//kchat\/webapp@/${commit_url}}
format2=${format1//kchat\/webapp!/${mr_url}}
data=$(jq -n --arg text "$format2" '{"text": $text, "blocks": [{}]}')
notify=$(curl -f -X POST -H "Content-Type: application/json" --data "$data" --silent --output /dev/null $4)

echo $notify


# slack=$(curl https://slack.com/api/files.upload -F token="${SLACK_API_TOKEN}" -F channels="${SLACK_NOTIFY_CHANNEL}" -F title="Webapp Release ${GITLAB_PROJECT_TAG}" -F filetype="post" -F content="${format2}")

# echo slack

