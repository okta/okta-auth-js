#!/bin/bash

DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source $DIR/setup.sh

# setup for e2e tests
create_log_group "E2E Env Setup"
if [ -n "${TEST_SUITE_ID}" ]; then
# if running on bacon
  setup_service java 1.8.222
  setup_service google-chrome-stable 106.0.5249.61-1

  export CI=true
else
# if running locally
  # https://gist.github.com/mihow/9c7f559807069a03e302605691f85572
  export $(cat $DIR/../.bacon.env | xargs)    # this might not work if the .ini files contains special characters

  # moves `testenv` so it does not change env of test apps ran during e2e tests
  mv $DIR/../testenv $DIR/../testenv.bak
  trap "mv $DIR/../testenv.bak $DIR/../testenv &>/dev/null" EXIT SIGINT SIGKILL SIGSTOP

  # TODO: remove this after https://oktainc.atlassian.net/browse/OKTA-541393
  export CI=true
fi
finish_log_group $?

setup_e2e () {
  create_log_group "E2E Setup"
  export DBUS_SESSION_BUS_ADDRESS=/dev/null
  export TEST_SUITE_TYPE="junit"
  export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"

  export ISSUER=https://samples-javascript.okta.com/oauth2/default
  export USERNAME=george@acme.com
  get_secret prod/okta-sdk-vars/password PASSWORD
  finish_log_group $?
}

run_e2e () {
  create_log_group "E2E Test Run"
  if [ -n "${RUN_CUCUMBER}" ]; then
    if ! yarn test:e2e:cucumber; then
      echo "Cucumber tests failed! Exiting..."
      exit ${TEST_FAILURE}
    fi
  else
    if ! yarn test:e2e; then
      echo "OIE e2e tests failed! Exiting..."
      exit ${TEST_FAILURE}
    fi
  fi
  finish_log_group $?

  echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
  echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
  exit ${PUBLISH_TYPE_AND_RESULT_DIR}
}

setup_sample_tests () {
  create_log_group "E2E Setup"
  export DBUS_SESSION_BUS_ADDRESS=/dev/null
  export TEST_SUITE_TYPE="junit"
  export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"

  export USERNAME=mary@acme.com
  get_secret prod/okta-sdk-vars/password PASSWORD

  export ORG_OIE_ENABLED=true
  get_vault_secret_key devex/auth-js-sdk-vars a18n_api_key A18N_API_KEY

  # If this script is run as a bacon task, run against trexcloud environment
  if [[ "${BACON_TASK}" == true ]]; then
    echo "Running tests against trexcloud org"
    export ISSUER=https://javascript-idx-sdk.trexcloud.com
    export CLIENT_ID=0oa3r1keeeFFb7VMG0g7
    export SPA_CLIENT_ID=0oa3r92jj01DWBeWC0g7
    get_vault_secret_key devex/trex-js-idx-sdk-vars trex_client_secret CLIENT_SECRET
    get_vault_secret_key devex/trex-js-idx-sdk-vars trex_idx_sdk_org_api_key OKTA_API_KEY
  else
    if [ -n "$USE_OK_14" ]; then
      echo "Running tests against production (ok14) org"
      export CLIENT_ID=0oax3dcx0sak1KKb9696
      export ISSUER=https://javascript-idx-sdk-new.okta.com
      export ISSUER_IDFIRST=https://javascript-idx-sdk-idfirst.okta.com
      get_vault_secret_key devex/prod-js-idx-sdk-vars prod_client_secret_new CLIENT_SECRET
      get_vault_secret_key devex/prod-js-idx-sdk-vars prod_idx_sdk_org_api_key_new OKTA_API_KEY
      get_vault_secret_key devex/prod-js-idx-sdk-vars prod_idx_idfirst_sdk_org_api_key OKTA_API_KEY_IDFIRST
    else
      echo "Running tests against production (ok12) org"
      export ISSUER=https://javascript-idx-sdk.okta.com
      export CLIENT_ID=0oav2oxnlYjULp0Cy5d6
      export SPA_CLIENT_ID=0oa17suj5x9khaVH75d7
      get_vault_secret_key devex/prod-js-idx-sdk-vars prod_client_secret CLIENT_SECRET
      get_vault_secret_key devex/prod-js-idx-sdk-vars prod_idx_sdk_org_api_key OKTA_API_KEY
    fi
  fi
  finish_log_group $?
}

run_sample_tests () {
  create_log_group "E2E Test Run"
  # Run the tests
  if ! yarn test:samples; then
    echo "tests failed! Exiting..."
    exit ${TEST_FAILURE}
  fi
  finish_log_group $?

  echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
  echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
  exit ${PUBLISH_TYPE_AND_RESULT_DIR}
}
