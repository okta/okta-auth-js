#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/integration"

export ISSUER=https://oie-widget-tests.sigmanetcorp.us/oauth2/default
export USERNAME=george@acme.com
get_secret prod/okta-sdk-vars/password PASSWORD

# This client has refresh token enabled
export CLIENT_ID=0oa3n0cgbfiNvI6Aa0g7

if ! yarn test:integration; then
  echo "integration failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
