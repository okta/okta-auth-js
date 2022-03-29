#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 89.0.4389.72-1

export TEST_NAME=@okta/test.app
export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"

export ISSUER=https://oie-signin-widget.okta.com/oauth2/default
export USERNAME=george@acme.com
get_secret prod/okta-sdk-vars/password PASSWORD

export CI=true
export DBUS_SESSION_BUS_ADDRESS=/dev/null
# Remember to set this while running tests locally 
export ORG_OIE_ENABLED=true 

# This client has refresh token enabled
export CLIENT_ID=0oa8lrg7ojTsbJgRQ696
export REFRESH_TOKEN=true

export FB_USERNAME=ycfjikukbl_1613767309@tfbnw.net 
get_secret prod/okta-sdk-vars/fb_password FB_PASSWORD

# Run the tests
if ! yarn test:e2e; then
  echo "OIE e2e tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
