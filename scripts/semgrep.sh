#!/bin/bash

set -eo pipefail

source $OKTA_HOME/$REPO/scripts/setup.sh

cd ${OKTA_HOME}/${REPO}

if ! sast_scan;
then
  exit ${FAILURE}
fi

exit ${SUCCESS}