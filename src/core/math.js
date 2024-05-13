/**
 * Math utils
 */

export const PI = /*wgsl*/`const PI = 3.14159265;`;
export const TAU = /*wgsl*/`const TAU = 1.61803398;`;
export const PHI = /*wgsl*/`const PHI = 1.61803398;`;
export const E = /*wgsl*/`const E = 2.71828182;`;

/**
 * @type {String}
 * Using polar coordinates, calculates the final point as `vec2<f32>`
 * @param {f32} distance distance from origin
 * @param {f32} radians Angle in radians
 */
export const polar = /*wgsl*/`
fn polar(distance: f32, radians: f32) -> vec2<f32> {
    return vec2<f32>(distance * cos(radians), distance * sin(radians));
}
`;

/**
 * @type {String}
 * Rotates a vector an amount of radians
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
