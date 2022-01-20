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

# If this script is run as a bacon task, run against trexcloud environment
if [[ "${BACON_TASK}" == true ]]; then
  echo "Running tests against trexcloud org"
  export ISSUER=https://javascript-idx-sdk.trexcloud.com/oauth2/default
  export CLIENT_ID=0oa3r1keeeFFb7VMG0g7
  export SPA_CLIENT_ID=0oa3r92jj01DWBeWC0g7
  get_vault_secret_key devex/trex-js-idx-sdk-vars trex_client_secret CLIENT_SECRET
  get_vault_secret_key devex/trex-js-idx-sdk-vars trex_idx_sdk_org_api_key OKTA_API_KEY
  get_vault_secret_key devex/trex-js-idx-sdk-vars trex_mfa_client_id MFA_CLIENT_ID
  get_vault_secret_key devex/trex-js-idx-sdk-vars trex_mfa_client_secret MFA_CLIENT_SECRET
  get_vault_secret_key devex/trex-js-idx-sdk-vars trex_mfa_client_id CUSTOM_CLIENT_ID
  get_vault_secret_key devex/trex-js-idx-sdk-vars trex_mfa_client_secret CUSTOM_CLIENT_SECRET
else
  echo "Running tests against production (ok12) org"
  export ISSUER=https://javascript-idx-sdk.okta.com/oauth2/default
  export CLIENT_ID=0oav2oxnlYjULp0Cy5d6
  export SPA_CLIENT_ID=0oa17suj5x9khaVH75d7
  get_vault_secret_key devex/prod-js-idx-sdk-vars prod_client_secret CLIENT_SECRET
  get_vault_secret_key devex/prod-js-idx-sdk-vars prod_idx_sdk_org_api_key OKTA_API_KEY
  get_vault_secret_key devex/prod-js-idx-sdk-vars prod_mfa_client_id MFA_CLIENT_ID
  get_vault_secret_key devex/prod-js-idx-sdk-vars prod_mfa_client_secret MFA_CLIENT_SECRET
  get_vault_secret_key devex/prod-js-idx-sdk-vars prod_custom_client_id CUSTOM_CLIENT_ID
  get_vault_secret_key devex/prod-js-idx-sdk-vars prod_custom_client_secret CUSTOM_CLIENT_SECRET
  get_vault_secret_key devex/prod-js-idx-sdk-vars prod_totp_client_id TOTP_CLIENT_ID
  get_vault_secret_key devex/prod-js-idx-sdk-vars prod_totp_client_secret TOTP_CLIENT_SECRET
fi

cp $OKTA_HOME/$REPO/_testenv.yml $OKTA_HOME/$REPO/testenv.yml
sed -i "s|REPLACE_ISSUER|"$ISSUER"|g"                              $OKTA_HOME/$REPO/testenv.yml 
sed -i "s|REPLACE_DEFAULT_CLIENT_ID|"$CLIENT_ID"|g"                $OKTA_HOME/$REPO/testenv.yml 
sed -i "s|REPLACE_DEFAULT_CLIENT_SECRET|"$CLIENT_SECRET"|g"        $OKTA_HOME/$REPO/testenv.yml 
sed -i "s|REPLACE_USERNAME|"$USERNAME"|g"                          $OKTA_HOME/$REPO/testenv.yml 
sed -i "s|REPLACE_PASSWORD|"$PASSWORD"|g"                          $OKTA_HOME/$REPO/testenv.yml 
sed -i "s|REPLACE_A18N_API_KEY|"$A18N_API_KEY"|g"                  $OKTA_HOME/$REPO/testenv.yml 
sed -i "s|REPLACE_OKTA_API_KEY|"$OKTA_API_KEY"|g"                  $OKTA_HOME/$REPO/testenv.yml 
sed -i "s|REPLACE_MFA_CLIENT_ID|"$MFA_CLIENT_ID"|g"                $OKTA_HOME/$REPO/testenv.yml 
sed -i "s|REPLACE_MFA_CLIENT_SECRET|"$MFA_CLIENT_SECRET"|g"        $OKTA_HOME/$REPO/testenv.yml 
sed -i "s|REPLACE_CUSTOM_CLIENT_ID|"$CUSTOM_CLIENT_ID"|g"          $OKTA_HOME/$REPO/testenv.yml 
sed -i "s|REPLACE_CUSTOM_CLIENT_SECRET|"$CUSTOM_CLIENT_SECRET"|g"  $OKTA_HOME/$REPO/testenv.yml 
sed -i "s|REPLACE_TOTP_CLIENT_ID|"$TOTP_CLIENT_ID"|g"              $OKTA_HOME/$REPO/testenv.yml 
sed -i "s|REPLACE_TOTP_CLIENT_SECRET|"$TOTP_CLIENT_SECRET"|g"      $OKTA_HOME/$REPO/testenv.yml 

# Run the tests
if ! yarn test:samples; then
  echo "tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
