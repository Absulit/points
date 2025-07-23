/**
 * @type {String}
 * Random number that returns a `vec2f`.
 * Use `rand_seed:vec2f` to change seed.
 * @return `f32` equivalent to `rand_seed.y` and `rand_seed` is the result.
 */
export const rand: string;
/**
 * @type {String}
 * Random number from `vec2f` param
 * @param {vec2f} co `vec2f` vector
 */
export const rand2: string;
/**
 * @type {String}
 * Single random number.
 * Use `seed` to change seed.
 * @return `f32`
 */
export const random: string;
