#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 89.0.4389.72-1

export TEST_NAME=@okta/test.app
export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"

export CI=true
export DBUS_SESSION_BUS_ADDRESS=/dev/null

# Configuration
# Remember to set this while running tests locally 
export ORG_OIE_ENABLED=true
get_vault_secret_key devex/auth-js-sdk-vars a18n_api_key A18N_API_KEY

# If this script is run as a bacon task, run against trexcloud environment
if [[ "${BACON_TASK}" == true ]]; then
  echo "Running tests against trexcloud org"
  export ISSUER=https://javascript-idx-sdk.trexcloud.com
  export SPA_CLIENT_ID=0oa3r92jj01DWBeWC0g7
  get_vault_secret_key devex/trex-js-idx-sdk-vars trex_idx_sdk_org_api_key OKTA_API_KEY
else
  echo "Running tests against production (ok12) org"
  export ISSUER=https://javascript-idx-sdk.okta.com
  export SPA_CLIENT_ID=0oa17suj5x9khaVH75d7
  get_vault_secret_key devex/prod-js-idx-sdk-vars prod_idx_sdk_org_api_key OKTA_API_KEY
fi

if ! yarn test:e2e:cucumber; then
  echo "Cucumber tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
