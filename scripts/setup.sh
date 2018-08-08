#!/bin/bash

cd ${OKTA_HOME}/${REPO}

# Add yarn to the $PATH so cli commands do not fail
export PATH="${PATH}:$(yarn global bin)"

# Install required dependencies
npm install -g @okta/ci-update-package
npm install -g @okta/ci-pkginfo

if ! npm install --no-optional --unsafe-perm; then
  echo "npm install failed! Exiting..."
  exit ${FAILED_SETUP}
fi
