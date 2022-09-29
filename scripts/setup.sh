#!/bin/bash -xe

# Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
# This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export WIDGET_VERSION=""

# Add yarn to the $PATH so npm cli commands do not fail
export PATH="${PATH}:$(yarn global bin)"

# Install required node version
export NVM_DIR="/root/.nvm"
NODE_VERSION="${1:-v14.18.0}"
setup_service node $NODE_VERSION
# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt

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

# Install dependences. --ignore-scripts will prevent chromedriver from attempting to install
if ! yarn install --frozen-lockfile --ignore-scripts; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# Build
if ! yarn build; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi
