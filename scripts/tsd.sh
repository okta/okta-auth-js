#!/bin/bash -xe

cp ./scripts/types/index.d.ts ./build/
cp ./scripts/types/index.test-d.ts ./build/
cp ./scripts/types/tsconfig.json ./build/

tsd
