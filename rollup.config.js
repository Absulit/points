export default [
  {
    input: 'src/RenderPass.js',
    output: {
      file: 'build/RenderPass.js',
      format: 'esm',
      banner: '/* @ts-self-types="./RenderPass.d.ts" */'
    },
    plugins: []
  },
  {
    input: 'src/ShaderType.js',
    output: {
      file: 'build/ShaderType.js',
      format: 'esm',
      banner: '/* @ts-self-types="./ShaderType.d.ts" */'
    },
    plugins: []
  },
  {
    input: 'src/RenderPasses.js',
    output: {
      file: 'build/RenderPasses.js',
      format: 'esm',
      banner: '/* @ts-self-types="./RenderPasses.d.ts" */'
    },
    external: [
      './core/RenderPasses/color/index.js',
      './core/RenderPasses/grayscale/index.js',
      './core/RenderPasses/chromaticAberration/index.js',
      './core/RenderPasses/pixelate/index.js',
      './core/RenderPasses/lensDistortion/index.js',
      './core/RenderPasses/filmgrain/index.js',
      './core/RenderPasses/bloom/index.js',
      './core/RenderPasses/blur/index.js',
      './core/RenderPasses/waves/index.js',
      './absulit.points.module.js',
      './RenderPass.js',
    ],
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


