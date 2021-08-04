#!/bin/bash -x

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
