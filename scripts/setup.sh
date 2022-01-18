#!/bin/bash -xe

# Add yarn to the $PATH so npm cli commands do not fail
export PATH="${PATH}:$(yarn global bin)"

# Install required node version
export NVM_DIR="/root/.nvm"
setup_service node v12.13.0

cd ${OKTA_HOME}/${REPO}

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

# DO NOT MERGE - BETA VERSION - DO NOT MERGE
echo "Installing BETA VERSION"
cd ${OKTA_HOME}/${REPO}

npm config set strict-ssl false
yarn add -DW --no-lockfile https://artifacts.aue1d.saasure.com/artifactory/npm-topic/@okta/okta-signin-widget/-/@okta/okta-signin-widget-5.17.0-g48b4537.tgz

# Sample should use beta version, not CDN
export SELF_HOSTED_WIDGET="1"

echo "BETA VERSION installed"
# End BETA VERSION


