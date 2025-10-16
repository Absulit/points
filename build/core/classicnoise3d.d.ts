/**
 * original: Author :  Stefan Gustavson (stefan.gustavson@liu.se)<br>
 * https://github.com/ashima/webgl-noise/blob/master/src/classicnoise3D.glsl<br>
 *<br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/classicnoise3d
 */
/**
 * Classic Perlin noise, periodic variant
 * @type {String}
 * @param {vec3f} P position
 * @returns {f32}
 *
 * @example
 * // js
 * import { pnoise3 } from 'points/classicnoise3d';
 *
 * // wgsl string
 * ${pnoise3}
 * let value = pnoise3(xyz);
 */
export const pnoise3: string;
