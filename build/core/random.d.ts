/**
 * Random number that returns a `vec2f`.
 * Use `rand_seed:vec2f` to change seed.
 * @type {String}
 * @return `f32` equivalent to `rand_seed.y` and `rand_seed` is the result.
 */
export const rand: string;
/**
 * Random number from `vec2f` param
 * @type {String}
 * @param {vec2f} co `vec2f` vector
 */
export const rand2: string;
/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/random
 */
/**
 * Single random number.
 * Use `seed` to change seed.
 * @type {String}
 * @return `f32`
 */
export const random: string;
