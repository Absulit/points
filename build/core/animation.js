/* @ts-self-types="./animation.d.ts" */
/**
 * Utilities for animation.
 * <br>
 * Functions that use sine and `params.time` to increase and decrease a value over time.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/animation
 * @example
 * ```js
 * const a = 1;
 * ```
 */

/**
 * Animates `sin()` over `params.time` and a provided `speed`.
 * The value is not normalized, so in the range -1..1
 * @type {String}
 * @param {f32} speed
 * @example
 * // js
 * import { fusin } from 'points/animation';
 *
 * // wgsl string
 * ${fusin}
 * let value = fusin(2.);
 */
const fusin = /*wgsl*/`
fn fusin(speed: f32) -> f32{
    return sin(params.time * speed);
}
`;

/**
 * Animates `cos()` over `params.time` and a provided `speed`.
 * The value is not normalized, so in the range -1..1
 * @type {String}
 * @param {f32} speed
 * @example
 * // js
 * import { fucos } from 'points/animation';
 *
 * // wgsl string
 * ${fucos}
 * let value = fucos(2.);
 */
const fucos = /*wgsl*/`
fn fucos(speed: f32) -> f32{
    return cos(params.time * speed);
}
`;

/**
 * Animates `sin()` over `params.time` and a provided `speed`.
 * The value is normalized, so in the range 0..1
 * @type {String}
 * @param {f32} speed
 * @example
 * // js
 * import { fnusin } from 'points/animation';
 *
 * // wgsl string
 * ${fnusin}
 * let value = fnusin(2.);
 */
const fnusin = /*wgsl*/`
fn fnusin(speed: f32) -> f32{
    return (sin(params.time * speed) + 1.) * .5;
}
`;

export { fnusin, fucos, fusin };
