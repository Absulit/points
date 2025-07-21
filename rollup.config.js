export default {
  input: 'src/entries.js',
  output: {
    file: 'build/points.module.js',
    format: 'esm',
    banner: '/* @ts-self-types="./points.module.d.ts" */'
  },
  plugins: []
};
