export default [
  {
    input: 'src/entries.js',
    output: {
      file: 'build/points.module.js',
      format: 'esm',
      banner: '/* @ts-self-types="./points.module.d.ts" */'
    },
    plugins: []
  },
  {
    input: [
      'src/core/animation.js',
      'src/core/audio.js',
      'src/core/cellular2d.js',
      'src/core/classicnoise2d.js',
      'src/core/color.js',
      'src/core/debug.js',
      'src/core/defaultConstants.js',
      'src/core/defaultFunctions.js',
      'src/core/defaultStructs.js',
      'src/core/defaultVertexStructs.js',
      'src/core/effects.js',
      'src/core/image.js',
      'src/core/math.js',
      'src/core/noise2d.js',
      'src/core/random.js',
      'src/core/sdf.js',
      'src/core/valuenoise.js',
      'src/core/voronoi.js',
    ],
    output: {
      dir: 'build/core',
      format: 'esm',
      banner: '/* @ts-self-types="./../points.module.d.ts" */'
    }
  }
];
