#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 85.0.4183.102-1

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"

export ISSUER=https://oie-widget-tests.sigmanetcorp.us/oauth2/default
export USERNAME=george@acme.com
get_secret prod/okta-sdk-vars/password PASSWORD

export CI=true
export DBUS_SESSION_BUS_ADDRESS=/dev/null
export ORG_OIE_ENABLED=true

# build is required to run E2E tests
if ! yarn build; then
  echo "build failed! Exiting..."
  exit ${TEST_FAILURE}
fi

# This client has refresh token enabled
export CLIENT_ID=0oa3n0cgbfiNvI6Aa0g7
export REFRESH_TOKEN=true

if ! yarn test:e2e; then
  echo "OIE e2e tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
