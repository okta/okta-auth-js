#!/bin/bash

# Monolith version to test against
export MONOLITH_BUILDVERSION=2022.10.1-begin-254-gaefef87dfc4e

set +e
source $(dirname "${BASH_SOURCE[0]}")/setup-e2e.sh
set -e
export LOCAL_MONOLITH=true
export CI=true

# if [ -n "${TEST_SUITE_ID}" ]; then
# # if running on bacon
# else
# # if running locally

# fi

# Start monolith
create_log_group "Install/Start Monolith"
source ./scripts/monolith/install-dockolith.sh
source ./scripts/monolith/start-dockolith.sh
finish_log_group $?

# Create test org and save environment variables in "testenv"
create_log_group "Create Test Org"
# Add widget test host to /etc/hosts
export TEST_ORG_SUBDOMAIN="authjs-test-1"
echo "${DOCKER_HOST_CONTAINER_IP} ${TEST_ORG_SUBDOMAIN}.okta1.com" >> /etc/hosts
cat /etc/hosts
source ./scripts/monolith/create-env.sh
export ORG_OIE_ENABLED=true
finish_log_group $?