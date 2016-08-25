#!/bin/bash -vx
JOB_NAME=`basename $0`
LOGDIRECTORY=/tmp/ci-builder
mkdir -p $LOGDIRECTORY
LOGFILE=$LOGDIRECTORY/$JOB_NAME.log
exec > >(tee $LOGFILE)
exec 2>&1
set -e

# Bacon does not pass a parameter, so default to the one we want (deploy)
TASK="${1:-deploy}"

BUILD_TEST_SUITE_ID=3F0829AF-4448-4399-AD9F-3C50E919E2CF
LINT_TEST_SUITE_ID=7AFFE3F0-D801-4975-AE6A-EA64FFAE2ACC
UNIT_TEST_SUITE_ID=4962DE6E-2055-440E-9CDD-B539C3D37784
PUBLISH_TEST_SUITE_ID=31958EB8-0116-4978-ABD9-F04D3D396628

REGISTRY="https://artifacts.aue1d.saasure.com/artifactory/api/npm/npm-okta"

function usage() {
  OUTPUTCODE=$1
  echo """
USAGE:
    ./okta-auth-js-build.sh {TASK}

    Example:
    ./okta-auth-js-build.sh build

TASKS:
    help              Prints this guide.
    build             Builds and runs unit tests.
    deploy            Publishes sdk to NPM after successful build
                      Requires valid Artifactory credentials.
"""
  [ -z $OUTPUTCODE ] && OUTPUTCODE=0
  exit $OUTPUTCODE
}

function build() {
  start_test_suite ${BUILD_TEST_SUITE_ID}
  if npm install; then
    echo "Finishing up test suite $BUILD_TEST_SUITE_ID"
    finish_test_suite "build"
  else
    echo "Build failed"
    finish_failed_test_suite "build"
    exit 1
  fi
}

function lint() {
  start_test_suite ${LINT_TEST_SUITE_ID}
  if npm run lint:report; then
    echo "Finishing up test suite $LINT_TEST_SUITE_ID"
    finish_test_suite "checkstyle" "okta-auth-js/build2/"
  else
    echo "Lint failed"
    finish_failed_test_suite "checkstyle" "okta-auth-js/build2/"
  fi
}

function unit() {
  start_test_suite ${UNIT_TEST_SUITE_ID}
  if npm test; then
    echo "Finishing up test suite $UNIT_TEST_SUITE_ID"
    finish_test_suite "jsunit" "okta-auth-js/build2/reports/jasmine/"
  else
    echo "Unit failed"
    finish_failed_test_suite "jsunit" "okta-auth-js/build2/reports/jasmine/"
  fi
}

function publish() {
  # Always publish a version to our npm registry:
  # If topic branch, will create an alpha prerelease version
  # If master branch, will create a beta prerelease version
  start_test_suite ${PUBLISH_TEST_SUITE_ID}
  echo "Updating the version number, and publishing"
  if npm run ci-update-package -- --branch=${BRANCH} && npm publish --registry ${REGISTRY}; then
    DATALOAD=$(npm run ci-pkginfo:dataload --silent)
    artifactory_curl -X PUT -u ${ARTIFACTORY_USER}:${ARTIFACTORY_PASSWORD} ${DATALOAD} -v -f
    echo "Publish Success"
    finish_test_suite "no-test-suite" "."
  else
    echo "Publish Failed"
    finish_failed_test_suite "no-test-suite" "."
  fi
}

case $TASK in
  help)
    usage
    ;;
  build)
    build
    lint
    unit
    ;;
  deploy)
    build
    lint
    unit
    publish
    ;;
  *)
    usage $TASK
    ;;
esac
