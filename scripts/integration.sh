#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/unit"

export CI=true
export ISSUER=https://oie-signin-widget.okta.com
export USERNAME=george@acme.com
get_secret prod/okta-sdk-vars/password PASSWORD
get_vault_secret_key devex/okta-signin-widget web_client_secret CLIENT_SECRET
get_vault_secret_key devex/okta-signin-widget web_private_key_jwk JWK
get_vault_secret_key devex/okta-signin-widget web_private_key_pem PEM

# This client has refresh token enabled
export CLIENT_ID=0oa8lrg7ojTsbJgRQ696
export WEB_CLIENT_ID=0oa8ls36zUZj7oFJ2696
export WEB_PRIVATE_KEY_CLIENT_ID=0oa2pea6upKkLmWn1697

if ! yarn test:integration; then
  echo "integration failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
