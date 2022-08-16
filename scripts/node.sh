#!/usr/bin/env bash

# install yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | (OUT=$(apt-key add - 2>&1) || echo $OUT)
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt-get update
apt-get -y install --no-install-recommends yarn