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
export ORG_OIE_ENABLED=true 
export USERNAME=mary@acme.com
get_secret prod/okta-sdk-vars/password PASSWORD
get_vault_secret_key devex/auth-js-sdk-vars a18n_api_key A18N_API_KEY
export FB_USERNAME=js_ekdtypn_user@tfbnw.net
get_secret prod/okta-sdk-vars/fb_password FB_PASSWORD

# Pull testenv.yml file
aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/okta-sdk-vars/testenv.yml $OKTA_HOME/$REPO/testenv.yml
#get_secret prod/okta-sdk-vars/testenv.yml TESTENV_YML
#echo $TESTENV_YML > $OKTA_HOME/$REPO/testenv.yml

# If this script is run as a bacon task, run against trexcloud environment
if [[ "${BACON_TASK}" == true ]]; then
  echo "Running tests against trexcloud org"
  export ISSUER=https://javascript-idx-sdk.trexcloud.com/oauth2/default
  export CLIENT_ID=0oa3r92jj01DWBeWC0g7
  get_vault_secret_key devex/trex-js-idx-sdk-vars trex_client_secret CLIENT_SECRET
  get_vault_secret_key devex/trex-js-idx-sdk-vars trex_idx_sdk_e2e_apiKey OKTA_API_KEY
else
  echo "Running tests against production (ok12) org"
  export SPA_CLIENT_ID=0oa17suj5x9khaVH75d7
  export ISSUER=https://javascript-idx-sdk.okta.com/oauth2/default
  export CLIENT_ID=0oav2oxnlYjULp0Cy5d6
  get_vault_secret_key devex/js-idx-sdk-vars client_secret CLIENT_SECRET
  get_secret prod/okta-sdk-vars/idx_sdk_e2e_apiKey OKTA_API_KEY
fi

# Run the tests
if ! yarn test:samples; then
  echo "tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
