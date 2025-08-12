#!/usr/bin/env bash

clear

rm -rf ./build/

npx rollup -c

./node_modules/.bin/swc build/points.js --out-file build/points.min.js
# ./node_modules/.bin/swc build/RenderPass.js --out-file build/RenderPass.min.js
# ./node_modules/.bin/swc build/ShaderType.js --out-file build/ShaderType.min.js
# ./node_modules/.bin/swc build/RenderPasses.js --out-file build/RenderPasses.min.js

./node_modules/.bin/swc build/core/animation.js --out-file build/core/animation.min.js
./node_modules/.bin/swc build/core/audio.js --out-file build/core/audio.min.js
./node_modules/.bin/swc build/core/color.js --out-file build/core/color.min.js
./node_modules/.bin/swc build/core/debug.js --out-file build/core/debug.min.js
./node_modules/.bin/swc build/core/effects.js --out-file build/core/effects.min.js
./node_modules/.bin/swc build/core/image.js --out-file build/core/image.min.js
./node_modules/.bin/swc build/core/math.js --out-file build/core/math.min.js
./node_modules/.bin/swc build/core/noise2d.js --out-file build/core/noise2d.min.js
./node_modules/.bin/swc build/core/classicnoise2d.js --out-file build/core/classicnoise2d.min.js
./node_modules/.bin/swc build/core/random.js --out-file build/core/random.min.js
./node_modules/.bin/swc build/core/sdf.js --out-file build/core/sdf.min.js




# this needs to be added for JSR
echo '/* @ts-self-types="./points.d.ts" */' | cat - build/points.min.js > temp && mv temp build/points.min.js


list="animation audio color debug effects image math noise2d classicnoise2d random sdf"

for item in $list; do
    echo '/* @ts-self-types="./'$item'.d.ts" */' | cat - build/core/$item.min.js > temp && mv temp build/core/$item.min.js
done


npx tsc

npm publish --dry-run
npx jsr publish --dry-run --allow-dirty

rm -rf ./apidocs/
mkdir apidocs
npx jsdoc -c jsdoc.json

