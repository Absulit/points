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
export const PI = /*wgsl*/`const PI = 3.14159265;`;
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
export const TAU = /*wgsl*/`const TAU = PI * 2;`;
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
export const PHI = /*wgsl*/`const PHI = 1.61803398;`;
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
export const E = /*wgsl*/`const E = 2.71828182;`;

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
export const polar = /*wgsl*/`
fn polar(distance: f32, radians: f32) -> vec2f {
    return vec2f(distance * cos(radians), distance * sin(radians));
}
`;

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
export const rotateVector = /*wgsl*/`
fn rotateVector(p:vec2f, rads:f32 ) -> vec2f {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.y * s;
    let ynew = p.x * s + p.y * c;
    return vec2(xnew, ynew);
}
`;

/**
 * Angle between two points.
 * @type {String}
 * @param {vec2f} p1 first point position
 * @param {vec2f} p2 second poin position
 * @returns {f32} angle in radians
 */
export const angle = /*wgsl*/`
fn angle(p1:vec2f, p2:vec2f) -> f32 {
    let delta = p2 - p1;
    let distance = length(delta);
    return atan2(delta.y, delta.x);
}

`;
