/**
 * Math utils
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/math
 */

export const PI = /*wgsl*/`const PI = 3.14159265;`;
export const TAU = /*wgsl*/`const TAU = PI * 2;`;
export const PHI = /*wgsl*/`const PHI = 1.61803398;`;
export const E = /*wgsl*/`const E = 2.71828182;`;

/**
 * Using polar coordinates, calculates the final point as `vec2<f32>`
 * @type {String}
 * @param {f32} distance distance from origin
 * @param {f32} radians Angle in radians
 */
export const polar = /*wgsl*/`
fn polar(distance: f32, radians: f32) -> vec2<f32> {
    return vec2<f32>(distance * cos(radians), distance * sin(radians));
}
`;

/**
 * Rotates a vector an amount of radians
 * @type {String}
 * @param {vec2f} p vector to rotate
 * @param {f32} rads angle in radians
 */
export const rotateVector = /*wgsl*/`
fn rotateVector(p:vec2<f32>, rads:f32 ) -> vec2<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.y * s;
    let ynew = p.x * s + p.y * c;
    return vec2(xnew, ynew);
}
`;
