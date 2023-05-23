#!/bin/bash -e

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

export TEST_SUITE_TYPE="checkstyle"
export TEST_RESULT_FILE_DIR="${REPO}/build2"

create_log_group "test:types"
if ! yarn test:types; then
  echo "tsd failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi
finish_log_group $?

create_log_group "lint_report"
if ! yarn lint:report; then
  # run `yarn lint` so the linting errors appear in the bacon logs
  yarn lint
  echo "lint failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi
finish_log_group $?

# TODO: fix types in @okta/test.app
# JIRA: https://oktainc.atlassian.net/browse/OKTA-529625
# if ! yarn workspace @okta/test.app validate; then
#   echo "test.app validate failed! Exiting..."
#   exit ${TEST_FAILURE}
# fi

create_log_group "verify:package"
mkdir -p ${TEST_RESULT_FILE_DIR}
if ! yarn verify:package 2> ${TEST_RESULT_FILE_DIR}/verify-package-error.log; then
  echo "verify package failed! Exiting..."
  value=`cat ${TEST_RESULT_FILE_DIR}/verify-package-error.log`
  log_custom_message "Verification Failed" "${value}"
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi
finish_log_group $?

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_SUCCEED_IF_NO_RESULTS}
