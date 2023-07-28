#!/bin/bash

set -eo pipefail

cd ${OKTA_HOME}/${REPO}

if ! sast_scan;
then
  exit ${FAILURE}
fi

exit ${SUCCESS}