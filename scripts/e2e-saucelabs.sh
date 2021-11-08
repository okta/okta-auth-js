#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

setup_service java 1.8.222
setup_service google-chrome-stable 89.0.4389.72-1

export TRAVIS=true # work-around to run tests on saucelabs instead of chrome

# run e2e tests with test/e2e/sauce.wdio.conf.js config
export RUN_SAUCE_TESTS=true
export SAUCE_USERNAME=OktaSignInWidget
get_vault_secret_key devex/sauce-labs accessKey SAUCE_ACCESS_KEY

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"
export CI=true
export DBUS_SESSION_BUS_ADDRESS=/dev/null

echo "Running tests against production (ok12) org"
export ISSUER=https://samples-javascript.okta.com/oauth2/default
export CLIENT_ID=0oa1xyzajgPFGWlLP4x7
export USERNAME=george@acme.com
get_secret prod/okta-sdk-vars/password PASSWORD
get_secret prod/okta-sdk-vars/idx_sdk_e2e_apiKey OKTA_API_KEY

# Run the tests
if ! yarn test:e2e; then
  echo "e2e tests on Sauce Labs failed! Exiting..."
  exit ${PUBLISH_TYPE_AND_RESULT_DIR_BUT_ALWAYS_FAIL}
fi

exit ${PUBLISH_TYPE_AND_RESULT_DIR};