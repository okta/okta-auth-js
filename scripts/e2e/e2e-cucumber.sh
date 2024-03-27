#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

setup_sample_tests

export TEST_NAME=e2e

export ORG_OIE_ENABLED=true

export RUN_CUCUMBER=1

run_e2e
