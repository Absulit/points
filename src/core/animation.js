/**
 * Utilities for animation
 */

/**
 * @type {String}
 * Animates `sin()` over `params.time` and a provided `speed`.
 * The value is not normalized, so in the range -1..1
 * @param {f32} speed
 */
export const fusin = /*wgsl*/`
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
export const fucos = /*wgsl*/`
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
export const fnusin = /*wgsl*/`
fn fnusin(speed: f32) -> f32{
    return (sin(params.time * speed) + 1.) * .5;
}
`;