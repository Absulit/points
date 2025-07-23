/**
 * Float 32
 */
export type f32 = number;
/**
 * @type {String}
 * Animates `sin()` over `params.time` and a provided `speed`.
 * The value is normalized, so in the range 0..1
 * @param {f32} speed
 */
export const fnusin: string;
/**
 * @type {String}
 * Animates `cos()` over `params.time` and a provided `speed`.
 * The value is not normalized, so in the range -1..1
 * @param {f32} speed
 */
export const fucos: string;
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
export const fusin: string;
