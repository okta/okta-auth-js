#!/bin/bash -xe

# Creates a test org and outputs environment variables to a file named "testenv.local" in the project root

#yarn workspace @okta/test.support monolith:create-env
pushd ./test/support
  yarn ts-node ./monolith/create-e2e-env.ts
popd

cat testenv.local >> testenv
echo "updated testenv"
