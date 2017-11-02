#!/bin/bash

cd ${OKTA_HOME}/${REPO}

# Use newer, faster npm
npm install -g npm@4.0.2

# Install required dependencies
npm install -g @okta/ci-update-package
npm install -g @okta/ci-pkginfo

if ! npm install --no-optional --unsafe-perm; then
  echo "npm install failed! Exiting..."
  exit ${FAILED_SETUP}
fi
