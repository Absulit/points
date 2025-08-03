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
export const cnoise: string;
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
export const pnoise: string;
