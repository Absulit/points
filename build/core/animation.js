/* @ts-self-types="./../points.module.d.ts" */
/**
 * Utilities for animation
 * @module
 */

/**
 * @typedef {number} f32
 * Float 32
 */

/**
 * @type {String}
 * Animates `sin()` over `params.time` and a provided `speed`.
 * The value is not normalized, so in the range -1..1
 * @param {f32} speed
 */
const fusin = /*wgsl*/`
fn fusin(speed: f32) -> f32{
    return sin(params.time * speed);
}
`;

/**
 * @type {String}
 * Animates `cos()` over `params.time` and a provided `speed`.
 * The value is not normalized, so in the range -1..1
 * @param {f32} speed
 */
const fucos = /*wgsl*/`
fn fucos(speed: f32) -> f32{
    return cos(params.time * speed);
}
`;

/**
 * @type {String}
 * Animates `sin()` over `params.time` and a provided `speed`.
 * The value is normalized, so in the range 0..1
 * @param {f32} speed
 */
const fnusin = /*wgsl*/`
fn fnusin(speed: f32) -> f32{
    return (sin(params.time * speed) + 1.) * .5;
}
`;

export { fnusin, fucos, fusin };
