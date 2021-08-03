#!/bin/bash -x

# TODO: enable specs for spa/web apps after figuring out how to properly map org/policy to specs
# Test specs/*
if ! yarn test:specs; then
  echo "Specs tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi

# Test features/*
if ! yarn test:features; then
  echo "Features tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi
