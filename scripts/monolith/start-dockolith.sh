#!/bin/bash -e

# Dockolith should be installed before running this script

if [[ -n "${TEST_SUITE_ID}" ]]; then
  pushd ./scripts/dockolith
    source ./scripts/docker-monolith.sh
    echo $DOCKER_HOST_CONTAINER_IP
  popd
else
  echo "Skipping `start-dockolith`. This script only runs on CI, for now"
fi
