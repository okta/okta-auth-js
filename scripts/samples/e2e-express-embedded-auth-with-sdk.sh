#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

# NOTE: this test suite runs against a separate test org on OK14
export USE_OK_14=1
setup_sample_tests

export SAMPLE_NAME=@okta/samples.express-embedded-auth-with-sdk
export MAX_INSTANCES=2

# NOTE: the command belong evaluates to the same PASSWORD retrieved in setup-e2e, leaving commented just in case
# get_vault_secret_key devex/prod-js-idx-sdk-vars password PASSWORD

run_sample_tests