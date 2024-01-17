#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

# NOTE: this test suite runs against a separate test org on OK14
export USE_OK_14=1
setup_sample_tests

export SAMPLE_NAME=@okta/samples.express-embedded-auth-with-sdk
export MAX_INSTANCES=1

# NOTE: the command below evaluates to the same PASSWORD retrieved in setup-e2e, leaving commented just in case
# get_vault_secret_key devex/prod-js-idx-sdk-vars password PASSWORD

# based on run_sample_tests
create_log_group "E2E Test Run"
  # Run the tests
  if ! yarn workspace @okta/test.e2e.samples test:specs; then
    echo "tests failed! Exiting..."
    exit ${TEST_FAILURE}
  fi

  echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
  echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
  exit ${PUBLISH_TYPE_AND_RESULT_DIR}
finish_log_group $?
