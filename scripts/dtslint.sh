#!/bin/bash -xe

cp ./scripts/types/index.d.ts ./build/
cp ./scripts/types/tsconfig.json ./build/
cp ./scripts/types/tslint.json ./build/

dtslint ./build
