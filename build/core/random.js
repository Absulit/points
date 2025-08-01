/* @ts-self-types="./random.d.ts" */
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
const random = /*wgsl*/`

var<private> a:i32 = 1664525;
var<private> c:i32 = 1013904223;
var<private> m = pow(2, 32);
var<private> seed:i32 = 958736;

fn nextRand() -> i32 {
    seed = (a * seed + c) % i32(m);
    return seed;
}

fn random() -> f32 {
    return f32(nextRand()) / f32(m) / .5;
}

`;

/**
 * Random number that returns a `vec2f`.
 * Use `rand_seed:vec2f` to change seed.
 * @type {String}
 * @return `f32` equivalent to `rand_seed.y` and `rand_seed` is the result.
 */
const rand = /*wgsl*/`
var<private> rand_seed : vec2<f32>;

fn rand() -> f32 {
    rand_seed.x = fract(cos(dot(rand_seed, vec2<f32>(23.14077926, 232.61690225))) * 136.8168);
    rand_seed.y = fract(cos(dot(rand_seed, vec2<f32>(54.47856553, 345.84153136))) * 534.7645);
    return rand_seed.y;
}
`;

/**
 * Random number from `vec2f` param
 * @type {String}
 * @param {vec2f} co `vec2f` vector
 */
const rand2 = /*wgsl*/`
fn rand2(co: vec2<f32>) -> f32 {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}
`;

export { rand, rand2, random };
