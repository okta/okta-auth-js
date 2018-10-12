#!/bin/bash

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

export TEST_SUITE_TYPE="jsunit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/unit"

if ! yarn test:report; then
  echo "unit failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
