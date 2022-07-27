# Considering that your app version is stored in VERSION.md file
#
# Example: ./gitlab-changelog.sh
# Example: ./gitlab-changelog.sh <YOUR-GITLAB-PROJECT-ACCESS-TOKEN>

#!/bin/bash

app_version=$(cat VERSION.md)
latest=$(git describe --tags --abbrev=0)
branch=master

link=https://gitlab.infomaniak.ch/kchat/webapp/-/blob/${branch}/CHANGELOG.md

# You can retrieve env variables from script arguments (here 1st argument)
GITLAB_PROJECT_ACCESS_TOKEN=$1

response=$(curl --write-out '%{http_code}' --request POST --header "PRIVATE-TOKEN: ${GITLAB_PROJECT_ACCESS_TOKEN}" --data "version=${app_version}&branch=${branch}&from=${latest}&to=release" "https://gitlab.infomaniak.ch/api/v4/projects/3225/repository/changelog")

if [ $response == 200 ]
then echo "Updated changelog: ${link}"
else echo "An error occurred when requesting GitLab API"
fi;