#!/usr/bin/env bash

rm -rf ./build/

npx rollup -c

swc build/points.module.js --out-file build/points.min.js
swc build/RenderPass.module.js --out-file build/RenderPass.min.js
swc build/ShaderType.module.js --out-file build/ShaderType.min.js
swc build/RenderPasses.module.js --out-file build/RenderPasses.min.js

swc build/core/animation.js --out-file build/core/animation.min.js
swc build/core/audio.js --out-file build/core/audio.min.js
swc build/core/color.js --out-file build/core/color.min.js
swc build/core/debug.js --out-file build/core/debug.min.js
swc build/core/effects.js --out-file build/core/effects.min.js
swc build/core/image.js --out-file build/core/image.min.js
swc build/core/math.js --out-file build/core/math.min.js
swc build/core/noise2d.js --out-file build/core/noise2d.min.js
swc build/core/classicnoise2d.js --out-file build/core/classicnoise2d.min.js
swc build/core/random.js --out-file build/core/random.min.js
swc build/core/sdf.js --out-file build/core/sdf.min.js




# this needs to be added for JSR
echo '/* @ts-self-types="./points.module.d.ts" */' | cat - build/points.min.js > temp && mv temp build/points.min.js

npx tsc

# jsr publish --dry-run --allow-dirty