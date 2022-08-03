#!/bin/bash

latest=$(git describe --abbrev=0 --tags `git rev-list --tags --skip=1  --max-count=1`)

GITLAB_PROJECT_ACCESS_TOKEN=$1
GITLAB_PROJECT_TAG=$2

response=$(curl --write-out '%{http_code}' --request POST --header "PRIVATE-TOKEN: ${GITLAB_PROJECT_ACCESS_TOKEN}" --data "version=${GITLAB_PROJECT_TAG}&from=${latest}" "https://gitlab.infomaniak.ch/api/v4/projects/3225/repository/changelog")

echo $response
