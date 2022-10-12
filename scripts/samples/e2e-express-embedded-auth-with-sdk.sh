#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

export USE_OK_14=1
setup_sample_tests

export SAMPLE_NAME=@okta/samples.express-embedded-auth-with-sdk
export MAX_INSTANCES=2

# TODO: confirm following line no longer needed
# get_vault_secret_key devex/prod-js-idx-sdk-vars password PASSWORD

run_sample_tests