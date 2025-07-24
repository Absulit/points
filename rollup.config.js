export default [
  {
    input: 'src/RenderPass.js',
    output: {
      file: 'build/RenderPass.module.js',
      format: 'esm',
      banner: '/* @ts-self-types="./RenderPass.module.d.ts" */'
    },
    plugins: []
  },
  {
    input: 'src/ShaderType.js',
    output: {
      file: 'build/ShaderType.module.js',
      format: 'esm',
      banner: '/* @ts-self-types="./ShaderType.module.d.ts" */'
    },
    plugins: []
  },
  {
    input: 'src/RenderPasses.js',
    output: {
      file: 'build/RenderPasses.module.js',
      format: 'esm',
      banner: '/* @ts-self-types="./RenderPasses.module.d.ts" */'
    },
    plugins: []
  },
  {
    input: 'src/entries.js',
    output: {
      file: 'build/points.module.js',
      format: 'esm',
      // banner: `
      //   /* @ts-self-types="./RenderPass.module.d.ts" */
      //   /* @ts-self-types="./points.module.d.ts" */
      // `
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
      // banner: '/* @ts-self-types="./../points.module.d.ts" */'
    }
  },
];


