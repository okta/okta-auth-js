#!/bin/bash -xe

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

REGISTRY="${ARTIFACTORY_URL}/api/npm/npm-topic"

export TEST_SUITE_TYPE="build"

# Install required dependencies
export PATH="${PATH}:$(yarn global bin)"
yarn global add @okta/ci-append-sha

if [ -n "${action_branch}" ];
then
  echo "Publishing from bacon task using branch ${action_branch}"
  TARGET_BRANCH=${action_branch}
else
  echo "Publishing from bacon testSuite using branch ${BRANCH}"
  TARGET_BRANCH=${BRANCH}
fi

# Copy README, CHANGELOG, and CONTRIBUTING to the package directory so they will be published with the the package on npm
cp ./*.md ./packages/okta-auth-js/

pushd ./packages/okta-auth-js

if ! ci-append-sha; then
  echo "ci-append-sha failed! Exiting..."
  exit ${FAILED_SETUP}
fi

npm config set @okta:registry ${REGISTRY}
if ! npm publish --registry ${REGISTRY}; then
  echo "npm publish failed! Exiting..."
  exit ${PUBLISH_ARTIFACTORY_FAILURE}
fi

popd

exit ${SUCCESS}