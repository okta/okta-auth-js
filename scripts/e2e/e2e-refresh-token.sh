#!/bin/bash

source $(dirname "${BASH_SOURCE[0]}")/../setup-e2e.sh

setup_e2e

# This client has refresh token enabled
export CLIENT_ID=0oapmwm72082GXal14x6
export REFRESH_TOKEN=true

run_e2e
