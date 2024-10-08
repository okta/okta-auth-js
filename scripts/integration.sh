#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/unit"

export CI=true
export ISSUER=https://javascript-idx-sdk-idfirst.okta.com
export USERNAME=george@acme.com
get_terminus_secret "/" password PASSWORD

# for myaccount password API testing
export PASSWORDLESS_USERNAME=password.optional@mailinator.com
get_terminus_secret "/" a18n_api_key A18N_API_KEY

# This client has refresh token enabled and password optional
export CLIENT_ID=0oa3b5fp4h02UIrjZ697

create_log_group "Integration Test Run"
if ! yarn test:integration; then
  echo "integration failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
finish_log_group $?