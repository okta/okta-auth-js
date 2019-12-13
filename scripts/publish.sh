#!/bin/bash -xe

echo "attempting npm publish"

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

# Copy README, CHANGELOG, and CONTRIBUTING to the package directory so they will be published with the the package on npm
cp ./*.md ./packages/okta-auth-js/

node $OKTA_HOME/$REPO/scripts/publish_artifact.js

exit $SUCCESS