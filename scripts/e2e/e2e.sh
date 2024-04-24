#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

setup_e2e

# overrides
export ISSUER=https://oie-signin-widget.okta.com/oauth2/default

export TEST_NAME=e2e

# This client has refresh token enabled
export CLIENT_ID=0oa8lrg7ojTsbJgRQ696
export REFRESH_TOKEN=true
export ORG_OIE_ENABLED=true 

run_e2e
