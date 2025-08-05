/**
 * Random number that returns a `vec2f`.<br>
 * You have to set the `rand_seed` before calling `rand()`.
 * @type {String}
 * @return {f32} equivalent to `rand_seed.y` and `rand_seed` is the result.
 *
 * @example
 * // js
 * import { rand } from 'points/random';
 * rand_seed.x = .01835255;
 *
 * // wgsl string
 * ${rand}
 * let value = rand();
 */
export const rand: string;
/**
 * Random number from `vec2f` param
 * @type {String}
 * @param {vec2f} co `vec2f` vector
 * @returns {f32}
 *
 * @example
 * // js
 * import { rand2 } from 'points/random';
 *
 * // wgsl string
 * ${rand2}
 * let value = rand2(uvr);
 */
export const rand2: string;
/**
 * Various random functions.
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/random
 */
/**
 * Single random number.
 * Use `seed` to change seed.
 * @type {String}
 * @return {f32}
 *
 * @example
 * // js
 * import { random } from 'points/random';
 *
 * // wgsl string
 * ${random}
 * let value = random();
 *
 */
export const random: string;
