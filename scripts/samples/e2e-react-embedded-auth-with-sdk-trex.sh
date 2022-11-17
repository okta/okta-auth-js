#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

export BACON_TASK="true" # to run tests against trexcloud org
setup_sample_tests

export SAMPLE_NAME=@okta/samples.react-embedded-auth-with-sdk
export TREX=true

run_sample_tests
