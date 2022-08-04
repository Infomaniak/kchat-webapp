#!/bin/bash

latest=$(git describe --abbrev=0 --tags `git rev-list --tags --skip=1  --max-count=1`)

GITLAB_PROJECT_ACCESS_TOKEN=$1
GITLAB_PROJECT_TAG=$2
MILESTONE=$3

postchangelog=$(curl --write-out '%{http_code}' --request POST --header "PRIVATE-TOKEN: ${GITLAB_PROJECT_ACCESS_TOKEN}" --data "version=${GITLAB_PROJECT_TAG}" "https://gitlab.infomaniak.ch/api/v4/projects/3225/repository/changelog")
changelog=$(curl --request GET --header "PRIVATE-TOKEN: ${GITLAB_PROJECT_ACCESS_TOKEN}" --data "version=${GITLAB_PROJECT_TAG}" "https://gitlab.infomaniak.ch/api/v4/projects/3225/repository/changelog" | jq -r '.notes')
release=$(curl --write-out '%{http_code}' --request POST --header "PRIVATE-TOKEN: ${GITLAB_PROJECT_ACCESS_TOKEN}" --data "name=${GITLAB_PROJECT_TAG}&tag_name=${GITLAB_PROJECT_TAG}&description=${changelog}&milestones=${MILESTONE}" "https://gitlab.infomaniak.ch/api/v4/projects/3225/releases")
data=$(jq -n --arg text "$changelog" '{"text": $text, "blocks": [{"type": "section", "text": {"type": "mrkdwn", "text": $text}}]}')
notify=$(curl -f -X POST -H "Content-Type: application/json" --data "$data" --silent --output /dev/null ${SLACK_WEBHOOK_URL})


echo $postchangelog
echo $changelog
echo $release
echo $notify

