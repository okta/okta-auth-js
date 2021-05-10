#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 89.0.4389.72-1

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"
export CI=true
export DBUS_SESSION_BUS_ADDRESS=/dev/null

# Configuration
export ORG_OIE_ENABLED=true
export REFRESH_TOKEN=true
export ISSUER=https://oie-widget-tests.sigmanetcorp.us/oauth2/default
export USERNAME=george@acme.com
export WEB_CLIENT_ID=0oa3mvgsvrEdck9GO0g7
export SPA_CLIENT_ID=0oa3n0cgbfiNvI6Aa0g7
export FB_USERNAME=ycfjikukbl_1613767309@tfbnw.net 
get_secret prod/okta-sdk-vars/password PASSWORD
get_secret prod/okta-sdk-vars/fb_password FB_PASSWORD
get_secret prod/okta-sdk-vars/client_secret CLIENT_SECRET

# Pull testenv.yml file
get_secret prod/okta-sdk-vars/testenv.yml TESTENV_YML
echo $TESTENV_YML > $OKTA_HOME/$REPO/testenv.yml

# Run the tests
if ! yarn test:samples; then
  echo "tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
