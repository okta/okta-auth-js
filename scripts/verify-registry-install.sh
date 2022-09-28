#!/bin/bash

# NOTE: MUST BE RAN *AFTER* THE PUBLISH SUITE

# Install required node version
export REGISTRY="https://artifacts.aue1d.saasure.com/artifactory/npm-topic"

cd ${OKTA_HOME}/${REPO}

# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt

# Install required dependencies
yarn global add @okta/ci-append-sha
yarn global add @okta/ci-pkginfo

export PATH="${PATH}:$(yarn global bin)"
export TEST_SUITE_TYPE="build"

# Append a SHA to the version in package.json 
if ! ci-append-sha; then
  echo "ci-append-sha failed! Exiting..."
  exit $FAILED_SETUP
fi

# NOTE: hyphen rather than '@'
artifact_version="$(ci-pkginfo -t pkgname)-$(ci-pkginfo -t pkgsemver)"
published_tarball=${REGISTRY}/@okta/okta-auth-js/-/${artifact_version}.tgz

# verify npm install
mkdir npm-installation-test
pushd npm-installation-test
npm init -y

if ! npm i ${published_tarball}; then
  echo "npm install ${published_tarball} failed! Exiting..."
  exit ${FAILED_SETUP}
fi
popd

# verify yarn classic install
mkdir yarn-classic-test
pushd yarn-classic-test
yarn init -y

if ! yarn add ${published_tarball}; then
  echo "yarn-classic install ${published_tarball} failed! Exiting..."
  exit ${FAILED_SETUP}
fi
popd

# verify yarn classic install
mkdir yarn-classic-test
pushd yarn-classic-test
yarn init -y

if ! yarn; then
  echo "install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

if ! yarn add ${published_tarball}; then
  echo "install ${published_tarball} failed! Exiting..."
  exit ${FAILED_SETUP}
fi
popd

# verify yarn v3 install
mkdir yarn-v3-test
pushd yarn-v3-test
# use yarn v3
yarn set version stable
yarn init -y

if ! yarn add ${published_tarball}; then
  echo "yarn-v3 install ${published_tarball} failed! Exiting..."
  exit ${FAILED_SETUP}
fi
popd

exit $SUCCESS
