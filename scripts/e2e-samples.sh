#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 89.0.4389.72-1

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"
export CI=true
export DBUS_SESSION_BUS_ADDRESS=/dev/null

# Configuration
export ISSUER=https://javascript-idx-sdk.okta.com/oauth2/default
export USERNAME=mary@acme.com
export CLIENT_ID=0oav2oxnlYjULp0Cy5d6
export SPA_CLIENT_ID=0oa17suj5x9khaVH75d7
get_secret prod/okta-sdk-vars/password PASSWORD
get_secret prod/okta-sdk-vars/client_secret CLIENT_SECRET
get_secret prod/okta-sdk-vars/a18n_apiKey A18N_API_KEY
get_secret prod/okta-sdk-vars/idx_sdk_e2e_apiKey OKTA_API_KEY
export FB_USERNAME=js_ekdtypn_user@tfbnw.net
get_secret prod/okta-sdk-vars/fb_password FB_PASSWORD

# Pull testenv.yml file
aws s3 --quiet --region us-east-1 cp s3://ci-secret-stash/prod/okta-sdk-vars/testenv.yml $OKTA_HOME/$REPO/testenv.yml
#get_secret prod/okta-sdk-vars/testenv.yml TESTENV_YML
#echo $TESTENV_YML > $OKTA_HOME/$REPO/testenv.yml

# Run the tests
if ! yarn test:samples; then
  echo "tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
