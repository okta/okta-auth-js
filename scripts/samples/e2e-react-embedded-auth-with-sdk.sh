#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

setup_sample_tests

export SAMPLE_NAME=@okta/samples.react-embedded-auth-with-sdk

run_sample_tests
