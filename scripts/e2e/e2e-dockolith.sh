#!/bin/bash

DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)

source $DIR/../setup-e2e.sh

setup_e2e

# overrides

export TEST_NAME=@okta/test.app

export REFRESH_TOKEN=true
export ORG_OIE_ENABLED=true 

# export RUN_CUCUMBER=1

# re-export env vars in .bacon.env
export $(cat $DIR/../.bacon.env | xargs)

# TODO: use clientId
export CLIENT_ID=$SPA_CLIENT_ID

run_e2e
