/**
 * original: Author : Ian McEwan, Ashima Arts.
 * https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/noise2d
 */
/**
 * Noise
 * @type {String}
 * @param {vec2f} v usually the uv
 * @return `f32`
 */
export const snoise: string;
