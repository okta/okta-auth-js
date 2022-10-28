#!/bin/bash

export LOCAL_MONOLITH=true
LOCAL_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)

source $LOCAL_DIR/../setup-dockolith.sh

create_dockolith_test_org

setup_e2e

# overrides
export ISSUER=https://oie-signin-widget.okta.com/oauth2/default

export TEST_NAME=@okta/test.app

export REFRESH_TOKEN=true
export ORG_OIE_ENABLED=true

export RUN_CUCUMBER=1

# re-export env vars in .bacon.env
set -a
source $LOCAL_DIR/../../.bacon.env
set +a

# TODO: use clientId
export CLIENT_ID=$SPA_CLIENT_ID

run_e2e
