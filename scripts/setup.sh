#!/bin/bash

cd ${OKTA_HOME}/${REPO}

# Revert the cache-min setting, since the internal cache does not apply to
# these repos (and causes problems in lookups)
npm config set cache-min 10

# Use newer, faster npm
npm install -g npm@4.0.2

if ! npm install --unsafe-perm; then
  echo "npm install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

