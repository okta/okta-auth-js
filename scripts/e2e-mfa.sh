#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 89.0.4389.72-1

export TEST_NAME=@okta/test.app.react-mfa-v1
export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"

export ISSUER=https://samples-javascript.okta.com/oauth2/default
export USERNAME=email-login@email.ghostinspector.com
get_secret prod/okta-sdk-vars/password PASSWORD
get_vault_secret_key devex/auth-js-sdk-vars security_question_answer SECURITY_QUESTION_ANSWER
get_vault_secret_key devex/auth-js-sdk-vars a18n_api_key A18N_API_KEY

export CI=true
export DBUS_SESSION_BUS_ADDRESS=/dev/null

# This client has MFA (security question) enabled
export SPA_CLIENT_ID=0oa41zpqqxar7OFl84x7
export MFA_ENABLED=true

# Run the tests
if ! yarn test:e2e; then
  echo "MFA e2e tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
