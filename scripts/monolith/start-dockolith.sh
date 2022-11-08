#!/bin/bash -e

# Dockolith should be installed before running this script

pushd ./scripts/dockolith
  source ./scripts/docker-monolith.sh
  echo $DOCKER_HOST_CONTAINER_IP
popd
