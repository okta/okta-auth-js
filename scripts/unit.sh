#!/bin/bash

# Install current version of Chrome
setup_service google-chrome-stable 79.0.3945.88-1

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/unit"

# build is required to run E2E tests
if ! yarn build; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi

if ! yarn test:unit; then
  echo "unit failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
