#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

setup_sample_tests

export SAMPLE_NAME=@okta/samples.express-embedded-sign-in-widget

run_sample_tests
