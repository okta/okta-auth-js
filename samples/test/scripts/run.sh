#!/bin/bash -x

# Test features/*
if ! yarn test:features; then
  echo "Features tests failed! Exiting..."
  exit ${TEST_FAILURE}
fi
