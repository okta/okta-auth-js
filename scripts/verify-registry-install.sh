#!/bin/bash

# NOTE: MUST BE RAN *AFTER* THE PUBLISH SUITE

# Install required node version
export REGISTRY="${ARTIFACTORY_URL}/npm-topic"

cd ${OKTA_HOME}/${REPO}

NODE_VERSION="${1:-v16.20.2}"
setup_service node $NODE_VERSION
# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
# setup_service yarn 1.22.22 /etc/pki/tls/certs/ca-bundle.crt

npm i -g yarn
yarn --version
yarn config set caFilePath /etc/pki/tls/certs/ca-bundle.crt

# Install required dependencies
yarn global add @okta/ci-append-sha
yarn global add @okta/ci-pkginfo

which yarn
export PATH="${PATH}:$(yarn global bin)"
which yarn

# Append a SHA to the version in package.json 
if ! ci-append-sha; then
  echo "ci-append-sha failed! Exiting..."
  exit $FAILED_SETUP
fi

# NOTE: hyphen rather than '@'
artifact_version="$(ci-pkginfo -t pkgname)-$(ci-pkginfo -t pkgsemver)"
published_tarball=${REGISTRY}/@okta/okta-auth-js/-/${artifact_version}.tgz

# verify npm install
mkdir npm-test
pushd npm-test
npm init -y

if ! npm i ${published_tarball}; then
  echo "npm install ${published_tarball} failed! Exiting..."
  exit ${FAILED_SETUP}
fi
echo "Done with npm installation test"
popd

# verify yarn classic install
mkdir yarn-classic-test
pushd yarn-classic-test
yarn init -y

filename=$(npm pack ./$published_tarball --json | jq .[0].filename)
echo $filename

if ! yarn add ${filename}; then
  echo "yarn-classic install ${filename} failed! Exiting..."
  # exit ${FAILED_SETUP}
fi
echo "Done with yarn classic installation test"
popd

# verify yarn v3 install
mkdir yarn-v3-test
pushd yarn-v3-test
# use yarn v3

which yarn
# removes yarn-classic from PATH
export PATH="${PATH%:*}"
which corepack
corepack enable
corepack prepare yarn@3.8.7 --activate
which yarn
yarn --version

yarn set version 3.8.7
yarn --version

yarn config set caFilePath /etc/pki/tls/certs/ca-bundle.crt
yarn config set npmAlwaysAuth true
yarn config set npmAuthToken $NPM_TOKEN

filename=$(npm pack $published_tarball --json | jq .[0].filename)
echo $filename

yarn init -y
# add empty lock file, so this dir can be a isolated project
touch yarn.lock

# if ! yarn add @okta/okta-auth-js@${published_tarball}; then
if ! yarn add ./${filename}; then
  echo "yarn-v3 install @okta/okta-auth-js@${published_tarball} failed! Exiting..."
  exit ${FAILED_SETUP}
fi
echo "Done with yarn v3 installation test"
popd

exit $SUCCESS
