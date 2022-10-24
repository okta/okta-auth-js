#!/bin/bash -xe

# Warning! This script will overwrite your "testenv" file.
# Run bootstrap script to create apps/users needed for E2E tests
# Write environment variables to testenv file

# Get API token, if necessary
if [[ -z "${OKTA_CLIENT_TOKEN}" ]]; then
  source ./scripts/monolith/get-token.sh
fi

# Creates a test org and outputs environment variables to a file named "testenv.local" in the project root
yarn workspace @okta/test.support monolith:create-env
# cat testenv.local >> testenv
# echo "updated testenv"