#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 89.0.4389.72-1

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"
export CI=true
export DBUS_SESSION_BUS_ADDRESS=/dev/null

# Configuration
# Remember to set this while running tests locally 
export MAX_INSTANCES=1
export SAMPLE_NAME=@okta/samples.express-embedded-auth-with-sdk
export ORG_OIE_ENABLED=true 
export USERNAME=mary@acme.com
get_vault_secret_key devex/prod-js-idx-sdk-vars password PASSWORD
get_vault_secret_key devex/auth-js-sdk-vars a18n_api_key A18N_API_KEY

# If this script is run as a bacon task, run against trexcloud environment
if [[ "${BACON_TASK}" == true ]]; then
  echo "Running tests against trexcloud org"
  export ISSUER=https://javascript-idx-sdk.trexcloud.com
  export ISSUER_IDFIRST=https://javascript-idx-sdk-idfirst.trexcloud.com
  export CLIENT_ID=0oa3r1keeeFFb7VMG0g7
  get_vault_secret_key devex/trex-js-idx-sdk-vars trex_client_secret CLIENT_SECRET
  get_vault_secret_key devex/trex-js-idx-sdk-vars trex_idx_sdk_org_api_key OKTA_API_KEY
  get_vault_secret_key devex/trex-js-idx-sdk-vars trex_idx_idfirst_sdk_org_api_key OKTA_API_KEY_IDFIRST
else
  echo "Running tests against production (ok14) org"
  export ISSUER=https://javascript-idx-sdk-new.okta.com
  export ISSUER_IDFIRST=https://javascript-idx-sdk-idfirst.okta.com
  export CLIENT_ID=0oax3dcx0sak1KKb9696
  get_vault_secret_key devex/prod-js-idx-sdk-vars prod_client_secret_new CLIENT_SECRET
  get_vault_secret_key devex/prod-js-idx-sdk-vars prod_idx_sdk_org_api_key_new OKTA_API_KEY
  get_vault_secret_key devex/prod-js-idx-sdk-vars prod_idx_idfirst_sdk_org_api_key OKTA_API_KEY_IDFIRST
fi

# Run the tests
if ! yarn test:samples; then
  echo "tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
