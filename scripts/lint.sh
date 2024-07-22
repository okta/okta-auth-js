#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

export TEST_SUITE_TYPE="checkstyle"
export TEST_RESULT_FILE_DIR="${REPO}/build2"

if ! yarn test:types; then
  echo "tstyche failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

if ! yarn lint:report; then
  echo "lint failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

# TODO: fix types in @okta/test.app
# JIRA: https://oktainc.atlassian.net/browse/OKTA-529625
# if ! yarn workspace @okta/test.app validate; then
#   echo "test.app validate failed! Exiting..."
#   exit ${TEST_FAILURE}
# fi

mkdir -p ${TEST_RESULT_FILE_DIR}
if ! yarn verify:package 2> ${TEST_RESULT_FILE_DIR}/verify-package-error.log; then
  echo "verify package failed! Exiting..."
  value=`cat ${TEST_RESULT_FILE_DIR}/verify-package-error.log`
  log_custom_message "Verification Failed" "${value}"
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_SUCCEED_IF_NO_RESULTS}
