#!/bin/bash

DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source $DIR/setup.sh

# Monolith version to test against
DEFAULT_BUILDVERSION="2022.12.2-begin-259-gdeb54c572369"
export MONOLITH_BUILDVERSION="${MONOLITH_BUILDVERSION:-$DEFAULT_BUILDVERSION}"

set +e
if [ -n "${TEST_SUITE_ID}" ]; then
# if running on bacon
  setup_service java 1.8.222
  setup_service google-chrome-stable 106.0.5249.61-1

  export CI=true
fi
set -e

create_dockolith_test_org () {
  # Start monolith
  create_log_group "Install/Start Monolith"
  source ./scripts/monolith/install-dockolith.sh
  source ./scripts/monolith/start-dockolith.sh
  finish_log_group $?

  # Create test org and save environment variables in "testenv"
  create_log_group "Create Test Org"
  # Add widget test host to /etc/hosts
  export TEST_ORG_SUBDOMAIN="authjs-test-1"

  if [[ -n ${DOCKOLITH_CI} ]]; then
    # this command does not work locally
    echo "${DOCKER_HOST_CONTAINER_IP} ${TEST_ORG_SUBDOMAIN}.okta1.com" >> /etc/hosts
  fi

  source ./scripts/monolith/create-e2e-env.sh
  finish_log_group $?
}

# https://stackoverflow.com/questions/29966449/what-is-the-bash-equivalent-to-pythons-if-name-main
# only run this block when script is executed directly (similar to python's __name__ == 'main')
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    create_dockolith_test_org "$@"
fi
