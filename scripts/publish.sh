#!/bin/bash -ex

set +x    # ignore generic installation logs from setup/yarn add @okta/ci*
source ${OKTA_HOME}/${REPO}/scripts/setup.sh

REGISTRY="${ARTIFACTORY_URL}/api/npm/npm-topic"

export TEST_SUITE_TYPE="build"

# Install required dependencies
export PATH="${PATH}:$(yarn global bin)"
yarn global add @okta/ci-append-sha
yarn global add @okta/ci-pkginfo
set -x

if [ -n "${action_branch}" ];
then
  echo "Publishing from bacon task using branch ${action_branch}"
  TARGET_BRANCH=${action_branch}
else
  echo "Publishing from bacon testSuite using branch ${BRANCH}"
  TARGET_BRANCH=${BRANCH}
fi


pushd ./build

if ! ci-append-sha; then
  echo "ci-append-sha failed! Exiting..."
  exit ${FAILED_SETUP}
fi

npm config set @okta:registry ${REGISTRY}
if ! npm publish --registry ${REGISTRY}; then
  echo "npm publish failed! Exiting..."
  exit ${PUBLISH_ARTIFACTORY_FAILURE}
fi

FINAL_PUBLISHED_VERSION="$(ci-pkginfo -t pkgsemver)"
log_custom_message "Published Version" "${FINAL_PUBLISHED_VERSION}"

# upload artifact version to eng prod s3 to be used by downstream jobs
artifact_version="$(ci-pkginfo -t pkgname)@$(ci-pkginfo -t pkgsemver)"
if upload_job_data global artifact_version ${artifact_version}; then
  echo "Upload okta-auth-js job data artifact_version=${artifact_version} to s3!"
else
  # only echo the info since the upload is not crucial
  echo "Fail to upload okta-auth-js job data artifact_version=${artifact_version} to s3!" >&2
fi

popd

exit ${SUCCESS}