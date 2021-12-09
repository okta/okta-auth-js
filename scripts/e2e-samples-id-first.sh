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

export ISSUER=https://javascript-idx-sdk-idfirst.okta.com/oauth2/default
export CLIENT_ID=0oaai5vlbZFkuOCEw696
export SPA_CLIENT_ID=0oaaiacb400eLGTmE696
get_vault_secret_key devex/auth-js-sdk-vars prod_idx_sdk_org_api_key OKTA_API_KEY
get_vault_secret_key devex/auth-js-sdk-vars prod_idx_sdk_org_client_secret CLIENT_SECRET

sed "s|REPLACE_ISSUER|"$ISSUER"|g;s|REPLACE_DEFAULT_CLIENT_ID|"$CLIENT_ID"|g; \
     s|REPLACE_DEFAULT_CLIENT_SECRET|"$CLIENT_SECRET"|g;s|REPLACE_USERNAME|"$USERNAME"|g; \
     s|REPLACE_PASSWORD|"$PASSWORD"|g;s|REPLACE_A18N_API_KEY|"$A18N_API_KEY"|g; \ 
     s|REPLACE_OKTA_API_KEY|"$OKTA_API_KEY"|g;s|REPLACE_MFA_CLIENT_ID|"$MFA_CLIENT_ID"|g; \
     s|REPLACE_MFA_CLIENT_SECRET|"$MFA_CLIENT_SECRET"|g;s|REPLACE_CUSTOM_CLIENT_ID|"$CUSTOM_CLIENT_ID"|g; \
     s|REPLACE_CUSTOM_CLIENT_SECRET|"$CUSTOM_CLIENT_SECRET"|g;" $OKTA_HOME/$REPO/_testenv.yml > $OKTA_HOME/$REPO/testenv.yml

# Run the features tests against id first org
if ! yarn workspace @okta/test.e2e.samples test:features; then
  echo "tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
