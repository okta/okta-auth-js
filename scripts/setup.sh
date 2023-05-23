#!/bin/bash -e

# Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
# This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export WIDGET_VERSION=""

SCRIPTS_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source $SCRIPTS_DIR/setup-common.sh

create_log_group "Yarn Install"
setup::install;
finish_log_group $?

create_log_group "Yarn Build"
setup::build;
finish_log_group $?
