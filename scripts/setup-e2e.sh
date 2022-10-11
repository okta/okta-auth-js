#!/bin/bash

DIR=$(dirname "${BASH_SOURCE[0]}")

source $DIR/setup.sh

# setup for e2e tests
if [ -n "${TEST_SUITE_ID}" ]; then
# if running on bacon
  setup_service java 1.8.222
  setup_service google-chrome-stable 106.0.5249.61-1

  export CI=true
else
# if running locally
  . $DIR/../testenv
fi

setup_e2e () {
  export DBUS_SESSION_BUS_ADDRESS=/dev/null
  export TEST_SUITE_TYPE="junit"
  export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"

  export ISSUER=https://samples-javascript.okta.com/oauth2/default
  export USERNAME=george@acme.com
  get_secret prod/okta-sdk-vars/password PASSWORD
}

run_e2e () {
  # Run the tests
  if ! yarn test:e2e; then
    echo "OIE e2e tests failed! Exiting..."
    exit ${TEST_FAILURE}
  fi

  if [ -z "${RUN_CUCUMBER}" ]; then
    if ! yarn test:e2e:cucumber; then
      echo "Cucumber tests failed! Exiting..."
      exit ${TEST_FAILURE}
    fi
  fi

  echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
  echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
  exit ${PUBLISH_TYPE_AND_RESULT_DIR}
}



setup_sample_tests () {
  echo 'foo'
}