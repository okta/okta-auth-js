#!/bin/bash -xe

# Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
# This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export WIDGET_VERSION=""

# Add yarn to the $PATH so npm cli commands do not fail
export PATH="${PATH}:$(yarn global bin)"

# Install required node version
export NVM_DIR="/root/.nvm"
NODE_VERSION="${1:-v12.22.0}"
setup_service node $NODE_VERSION

cd ${OKTA_HOME}/${REPO}

if [ ! -z "$WIDGET_VERSION" ]; then
  echo "Installing WIDGET_VERSION: ${WIDGET_VERSION}"
  npm config set strict-ssl false

  if ! yarn add -DW --force https://artifacts.aue1d.saasure.com/artifactory/npm-topic/@okta/okta-signin-widget/-/@okta/okta-signin-widget-${WIDGET_VERSION}.tgz ; then
    echo "WIDGET_VERSION could not be installed: ${WIDGET_VERSION}"
    exit ${FAILED_SETUP}
  fi
  
  echo "WIDGET_VERSION installed: ${WIDGET_VERSION}"
fi

# Yarn does not utilize the npmrc/yarnrc registry configuration
# if a lockfile is present. This results in `yarn install` problems
# for private registries. Until yarn@2.0.0 is released, this is our current
# workaround.
#
# Related issues:
#  - https://github.com/yarnpkg/yarn/issues/5892
#  - https://github.com/yarnpkg/yarn/issues/3330

YARN_REGISTRY=https://registry.yarnpkg.com
OKTA_REGISTRY=${ARTIFACTORY_URL}/api/npm/npm-okta-master

# Replace yarn artifactory with Okta's
sed -i "s#${YARN_REGISTRY}#${OKTA_REGISTRY}#g" yarn.lock

# Install dependences. --ignore-scripts will prevent chromedriver from attempting to install
if ! yarn install --frozen-lockfile --ignore-scripts; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# Revert the original change
sed -i "s#${OKTA_REGISTRY}#${YARN_REGISTRY}#" yarn.lock

# Build
if ! yarn build; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi