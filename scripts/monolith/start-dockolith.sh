#!/bin/bash -e

# Dockolith should be installed before running this script

if [[ -z "${CI}" ]]; then
  echo "This script only runs on CI, for now"
  exit 1
fi

pushd ./scripts/dockolith
source ./scripts/docker-monolith.sh
echo $DOCKER_HOST_CONTAINER_IP
popd