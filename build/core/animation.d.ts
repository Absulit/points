/**
 * Animates `sin()` over `params.time` and a provided `speed`.
 * The value is normalized, so in the range 0..1
 * @type {String}
 * @param {f32} speed
 * @example
 * let value = fnusin(2.);
 */
export const fnusin: string;
/**
 * Animates `cos()` over `params.time` and a provided `speed`.
 * The value is not normalized, so in the range -1..1
 * @type {String}
 * @param {f32} speed
 * @example
 * let value = fucos(2.);
 */
export const fucos: string;
/**
 * Utilities for animation.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/animation
 */
/**
 * Animates `sin()` over `params.time` and a provided `speed`.
 * The value is not normalized, so in the range -1..1
 * @type {String}
 * @param {f32} speed
 * @example
 * let value = fusin(2.);
 */
export const fusin: string;
