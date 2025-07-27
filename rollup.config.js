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
      banner: '/* @ts-self-types="./points.module.d.ts" */'
    },
    plugins: []
  },
  {
    input: {
      animation: 'src/core/animation.js',
      audio: 'src/core/audio.js',
      cellular2d: 'src/core/cellular2d.js',
      classicnoise2d: 'src/core/classicnoise2d.js',
      color: 'src/core/color.js',
      debug: 'src/core/debug.js',
      defaultConstants: 'src/core/defaultConstants.js',
      defaultFunctions: 'src/core/defaultFunctions.js',
      defaultStructs: 'src/core/defaultStructs.js',
      defaultVertexStructs: 'src/core/defaultVertexStructs.js',
      effects: 'src/core/effects.js',
      image: 'src/core/image.js',
      math: 'src/core/math.js',
      noise2d: 'src/core/noise2d.js',
      random: 'src/core/random.js',
      sdf: 'src/core/sdf.js',
      valuenoise: 'src/core/valuenoise.js',
      voronoi: 'src/core/voronoi.js',
    },
    output: {
      dir: 'build/core',
      format: 'esm',
      entryFileNames: '[name].js',
      banner: chunk => `/* @ts-self-types="./${chunk.name}.d.ts" */`,
    }
  },
];


