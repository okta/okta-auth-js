#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

setup_e2e

# overrides
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e-saucelabs"

# run e2e tests with test/e2e/sauce.wdio.conf.js config
export CLIENT_ID=0oa1xyzajgPFGWlLP4x7
get_vault_secret_key devex/sauce-labs accessKey SAUCE_ACCESS_KEY

export RUN_SAUCE_TESTS=true
export SAUCE_USERNAME=OktaSignInWidget

run_e2e