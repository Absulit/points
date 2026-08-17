/**
 * Value noise methods.
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/valuenoise
 */
/**
 * Implementation of a value noise function.<br>
 * [value noise](https://en.wikipedia.org/wiki/Value_noise)
 *
 * @example
 * // js
 * import { valueNoise } from 'points/valuenoise';
 *
 * // wgsl string
 * ${valueNoise}
 * let value = valueNoise();
 */
declare const valueNoise: string;
export { valueNoise };
