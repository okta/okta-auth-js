#!/bin/bash

LOCAL_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)

export CI=true
export SKIP_SETUP_BUILD=1
source $LOCAL_DIR/../setup-dockolith.sh

create_dockolith_test_org

create_log_group "E2E Setup"
export DBUS_SESSION_BUS_ADDRESS=/dev/null
export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"

# NOTE: exports which are used to control test and/or test app behavior have been 
# moved to test/support/monolith/create-e2e-env.ts (output via testenv.local)

# re-export testenv
set -a
source $LOCAL_DIR/../../testenv
set +a

export TEST_NAME=@okta/test.app
finish_log_group $?

create_log_group "E2E Test Run"
if ! yarn test:e2e; then
  echo "Cucumber tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi
finish_log_group $?

create_log_group "E2E Cucumber Test Run"
if ! yarn test:e2e:cucumber; then
  echo "Cucumber tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi
finish_log_group $?

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
