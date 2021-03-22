#!/bin/bash -xe

cp ./test/types/index.d.ts ./build/
cp ./test/types/index.test-d.ts ./build/
cp ./test/types/tsconfig.json ./build/

tsd
