#!/bin/bash

DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)

source $DIR/../setup-dockolith.sh

# setup_e2e

# overrides

export TEST_NAME=@okta/test.app

export REFRESH_TOKEN=true
export ORG_OIE_ENABLED=true 

# export RUN_CUCUMBER=1

# re-export env vars in .bacon.env
# export $(cat $DIR/../.bacon.env | xargs)
set -a
source $DIR/../.bacon.env
set +a

# TODO: use clientId
export CLIENT_ID=$SPA_CLIENT_ID

create_log_group "E2E Test Run"
if ! yarn test:e2e:cucumber; then
  echo "OIE e2e tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi
finish_log_group $?

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
