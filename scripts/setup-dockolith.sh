#!/bin/bash

export LOCAL_MONOLITH=true
export DOCKOLITH_BRANCH=${DOCKOLITH_BRANCH:-dockolith-1.6.0}

SCRIPTS_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source $SCRIPTS_DIR/setup-common.sh
cd ${OKTA_HOME}/${REPO}

if [ -n "${TEST_SUITE_ID}" ]; then
# if running on bacon
  # setup_service java 1.8.322
  echo $TEST_SUITE_ID
  echo 'Installing chrome and java'
  set +e
  setup_service google-chrome-stable 106.0.5249.61-1
  set -e

  export CI=true
fi

# function setup::create_dockolith_test_org () {
cd ${OKTA_HOME}/${REPO}


create_log_group "Yarn Install"
setup::install;
finish_log_group $?

create_log_group "Yarn Build"
setup::build;
finish_log_group $?

# Start monolith
create_log_group "Install/Start Monolith"
source ./scripts/monolith/install-dockolith.sh
export DOCKOLITH_HOME="${OKTA_HOME}/${REPO}/scripts/dockolith"
source ./scripts/monolith/start-dockolith.sh
docker exec -it mono_app cat /etc/hosts
finish_log_group $?

# Create test org and save environment variables in "testenv"
create_log_group "Create Test Org"
# Add widget test host to /etc/hosts
export TEST_ORG_SUBDOMAIN="authjs-test-1"

if [[ -n ${DOCKOLITH_CI} ]]; then
  # this command does not work locally
  echo "${DOCKER_HOST_CONTAINER_IP} ${TEST_ORG_SUBDOMAIN}.okta1.com" >> /etc/hosts
  echo "${DOCKER_HOST_CONTAINER_IP} ${TEST_ORG_SUBDOMAIN}-admin.okta1.com" >> /etc/hosts
fi

source ./scripts/monolith/create-e2e-env.sh
export ORG_OIE_ENABLED=true
finish_log_group $?
# }
# 
# # https://stackoverflow.com/questions/29966449/what-is-the-bash-equivalent-to-pythons-if-name-main
# # only run this block when script is executed directly (similar to python's __name__ == 'main')
# if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
#     create_dockolith_test_org "$@"
# fi
