#!/bin/bash -x

# TODO: enable specs for spa/web apps after figuring out how to properly map org/policy to specs
# Test specs/*
yarn test:specs

# Test features/*
yarn test:features
