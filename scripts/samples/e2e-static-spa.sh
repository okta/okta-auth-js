#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

setup_sample_tests

export SAMPLE_NAME=@okta/samples.static-spa

whoami
ls -al ./build/dist

run_sample_tests
