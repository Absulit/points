/**
 * original: Author :  Stefan Gustavson (stefan.gustavson@liu.se)<br>
 * https://github.com/ashima/webgl-noise/blob/master/src/cellular2D.glsl<br>
 *<br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/cellular2d
 */
/**
 * Cellular noise
 * @type {String}
 * @param {vec2f} P position
 * @returns {vec2f} noise in the specified position
 *
 * @example
 * // js
 * import { cellular } from 'points/cellular2d';
 *
 * // wgsl string
 * ${cellular}
 * let value = cellular(uvr);
 *
 */
export const cellular: string;
