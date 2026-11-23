/**
 * original: Author :  Stefan Gustavson (stefan.gustavson@liu.se)<br>
 * https://github.com/ashima/webgl-noise/blob/master/src/classicnoise2D.glsl<br>
 *<br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/classicnoise2d
 */
/**
 * Classic Perlin Noise
 * @type {String}
 * @param {vec2f} P point
 * @return `f32`
 *
 * @example
 * // js
 * import { cnoise } from 'points/classicnoise2d';
 *
 * // wgsl string
 * ${cnoise}
 * let value = cnoise(uvr);
 */
declare const cnoise: string;
/**
 * Classic Perlin Noise, periodic variant
 * @type {String}
 * @param {vec2f} P point
 * @param {vec2f} rep point
 * @return `f32`
 *
 * @example
 * // js
 * import { pnoise } from 'points/classicnoise2d';
 *
 * // wgsl string
 * ${pnoise}
 * let value = pnoise(uvr);
 */
declare const pnoise: string;
export { cnoise, pnoise };
