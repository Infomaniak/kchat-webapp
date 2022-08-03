# Considering that your app version is stored in VERSION.md file
#
# Example: ./gitlab-changelog.sh
# Example: ./gitlab-changelog.sh <YOUR-GITLAB-PROJECT-ACCESS-TOKEN>

#!/bin/bash

latest=$(git describe --abbrev=0 --tags `git rev-list --tags --skip=1  --max-count=1`)

# You can retrieve env variables from script arguments (here 1st argument)
GITLAB_PROJECT_ACCESS_TOKEN=$1
GITLAB_PROJECT_TAG=$2
MILESTONE=$3

response=$(curl --request GET --header "PRIVATE-TOKEN: ${GITLAB_PROJECT_ACCESS_TOKEN}" --data "version=${GITLAB_PROJECT_TAG}" "https://gitlab.infomaniak.ch/api/v4/projects/3225/repository/changelog" | jq -r '.notes')
request=$(curl --write-out '%{http_code}' --request POST --header "PRIVATE-TOKEN: ${GITLAB_PROJECT_ACCESS_TOKEN}" --data "name=${GITLAB_PROJECT_TAG}&tag_name=${GITLAB_PROJECT_TAG}&description=${response}&milestones=${MILESTONE}" "https://gitlab.infomaniak.ch/api/v4/projects/3225/releases")

echo $response
# if [ $response == 200 ]
# then echo "Updated changelog: ${link}"
# else echo "An error occurred when requesting GitLab API"
# fi;