#!/usr/bin/env bash

rm -rf ./build/

npx rollup -c

swc build/points.module.js \
  --out-file build/points.min.js

# this needs to be added for JSR
echo '/* @ts-self-types="./points.module.d.ts" */' | cat - build/points.min.js > temp && mv temp build/points.min.js

npx tsc

# jsr publish --dry-run --allow-dirty