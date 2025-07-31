export const E: "const E = 2.71828182;";
export const PHI: "const PHI = 1.61803398;";
/**
 * Math utils
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/math
 */
export const PI: "const PI = 3.14159265;";
export const TAU: "const TAU = PI * 2;";
/**
 * Using polar coordinates, calculates the final point as `vec2<f32>`
 * @type {String}
 * @param {f32} distance distance from origin
 * @param {f32} radians Angle in radians
 */
export const polar: string;
/**
 * Rotates a vector an amount of radians
 * @type {String}
 * @param {vec2f} p vector to rotate
 * @param {f32} rads angle in radians
 */
export const rotateVector: string;
