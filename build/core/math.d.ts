/**
 * Math utils
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/math
 */
/**
 * PI is the ratio of a circle's circumference to its diameter.
 *
 * @see https://en.wikipedia.org/wiki/Pi
 *
 * @example
 * // js
 * import { PI } from 'points/math';
 *
 * // wgsl string
 * ${PI}
 * let value = PI * 3;
 */
declare const PI = "const PI=3.14159265;";
/**
 * TAU  is the ratio of a circle's circumference to its radius.
 *
 * @see https://en.wikipedia.org/wiki/Tau_(mathematics)
 *
 * @example
 * // js
 * import { TAU } from 'points/math';
 *
 * // wgsl string
 * ${TAU}
 * let value = TAU / 3.5;
 */
declare const TAU = "const TAU=6.2831853;";
/**
 * PHI is the Golden Ratio
 *
 * @see https://en.wikipedia.org/wiki/Golden_ratio
 *
 * @example
 * // js
 * import { PHI } from 'points/math';
 *
 * // wgsl string
 * ${PHI }
 * let value = PHI + 3;
 */
declare const PHI = "const PHI=1.61803398;";
/**
 * E is a mathematical constant approximately equal to 2.71828
 * that is the base of the natural logarithm and exponential function.
 * It is sometimes called Euler's number, after the Swiss mathematician Leonhard Euler.
 *
 * @see https://en.wikipedia.org/wiki/E_(mathematical_constant)
 *
 * @example
 * // js
 * import { E } from 'points/math';
 *
 * // wgsl string
 * ${E}
 * let value = E - 1.3;
 */
declare const E = "const E=2.71828182;";
/**
 * Using polar coordinates, calculates the final point as `vec2f`
 * @type {String}
 * @param {f32} distance distance from origin
 * @param {f32} radians Angle in radians
 *
 * @example
 * // js
 * import { polar } from 'points/math';
 *
 * // wgsl string
 * ${polar}
 * let value = polar(distance, radians);
 */
declare const polar: string;
/**
 * Rotates a vector an amount of radians
 * @type {String}
 * @param {vec2f} p vector to rotate
 * @param {f32} rads angle in radians
 *
 * @example
 * // js
 * import { rotateVector } from 'points/math';
 *
 * // wgsl string
 * ${rotateVector}
 * let value = rotateVector(position, radians);
 */
declare const rotateVector: string;
/**
 * Angle between two points.
 * @type {String}
 * @param {vec2f} p1 first point position
 * @param {vec2f} p2 second poin position
 * @returns {f32} angle in radians
 */
declare const angle: string;
/**
 * Creates a Matrix rotated in the X axis by an angle in radians.
 * @type {String}
 * @param {f32} rads angle
 * @returns {mat4x4f}
 */
declare const rotXAxis: string;
/**
 * Creates a Matrix rotated in the Y axis by an angle in radians.
 * @type {String}
 * @param {f32} rads angle
 * @returns {mat4x4f}
 */
declare const rotYAxis: string;
/**
 * Creates a Matrix rotated in the Z axis by an angle in radians.
 * @type {String}
 * @param {f32} rads angle
 * @returns {mat4x4f}
 */
declare const rotZAxis: string;
export { E, PHI, PI, TAU, angle, polar, rotXAxis, rotYAxis, rotZAxis, rotateVector };
