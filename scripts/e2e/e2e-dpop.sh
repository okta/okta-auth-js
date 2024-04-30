#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

setup_e2e

export TEST_NAME=e2e-dpop

export ISSUER=https://oie-signin-widget.okta.com
export CLIENT_ID=0oact2w7c2FiHEeoi697
export SPA_CLIENT_ID=0oact2w7c2FiHEeoi697
export ORG_OIE_ENABLED=true 

run_e2e

export REFRESH_TOKEN=true

run_e2e
