#!/bin/bash

LOCAL_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)

source $LOCAL_DIR/../setup-dockolith.sh

create_dockolith_test_org

create_log_group "E2E Setup"
export DBUS_SESSION_BUS_ADDRESS=/dev/null
export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/build2/reports/e2e"

# NOTE: exports which are used to control test and/or test app behavior have been 
# moved to test/support/monolith/create-e2e-env.ts (output via testenv.local)

# re-export testenv
set -a
source $LOCAL_DIR/../../testenv
set +a

export TEST_NAME=@okta/test.app
finish_log_group $?

run_e2e
