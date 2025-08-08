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
export const valueNoise: "\n\nvar<private> rand_seed : vec2f;\n\nfn rand() -> f32 {\n    rand_seed.x = fract(cos(dot(rand_seed, vec2f(23.14077926, 232.61690225))) * 136.8168);\n    rand_seed.y = fract(cos(dot(rand_seed, vec2f(54.47856553, 345.84153136))) * 534.7645);\n    return rand_seed.y;\n}\n\n\nconst value_noise_cellsize = 64;\n\nfn valueNoise(){\n    let width = i32(params.screen.x);\n    let height = i32(params.screen.y);\n    let cellSize = 64;\n    _ = value_noise_data[0];\n\n    for(var index = 0; index < i32(params.value_noise_data_length); index++){\n        let x = index % width;\n        let y = index / width;\n\n        if(x % cellSize == 0 && y % cellSize == 0){\n\n            let rx = x / cellSize;\n            let ry = y / cellSize;\n\n            let randomDataIndex = rx + (ry * width);\n\n            let dataP = &value_noise_data[randomDataIndex];\n            (*dataP) = rand();\n        }\n    }\n}\n";
