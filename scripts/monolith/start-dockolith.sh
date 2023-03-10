#!/bin/bash -xe

if [ -z "${DOCKOLITH_CI}" ]; then # Local
  # remove all running containers and networks before running
  source ${DOCKOLITH_HOME}/scripts/smoke-docker.sh

  # clear all tmp files
  rm -rf ${DOCKOLITH_TMP}
fi

source ${DOCKOLITH_HOME}/scripts/lib/dockolith/setup-dockolith.sh

dockolith::setup;

create_log_group "Setup"
dockolith::setup;
finish_log_group $?

#Set the spring config profiles. this determines which config files are loaded
# http://localhost:8100/okta/ci,ci_test_shared_credentials
# web credentials for CCS in bootstrap-ci.properties
# special "widget" profile is used to load locally built widget version
export MONOLITH_PROFILES_ACTIVE="ci_test_shared_credentials,ci,widget"

create_log_group "Start Tomcat"
dockolith::start_tomcat;
finish_log_group $?

create_log_group "Verify Webapp"
export DOCKER_HOST_CONTAINER_IP=$(docker inspect --format='{{.NetworkSettings.Networks.monolith_network.IPAddress}}' mono_dockerhost)
update_hosts_entry $DOCKER_HOST_CONTAINER_IP cdn.okta1.com
update_hosts_entry $DOCKER_HOST_CONTAINER_IP rain.okta1.com
update_hosts_entry $DOCKER_HOST_CONTAINER_IP backdoorentry.okta1.com

curl http://backdoorentry.okta1.com:1802
finish_log_group $?


create_log_group "Bootstrap"
export METRIC_TO_LOG=bootstrap_db
if ! log_metric_wrapper dockolith::bootstrap;
then
    echo "bootstrap failed!"
    # move_logs_tmp_api
    # log_extra_dir_as_zip ${TMP_LOGS_LOCATION} run_logs.zip
    exit ${BUILD_FAILURE}
fi
finish_log_group $?
