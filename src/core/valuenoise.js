/**
 * Value noise methods.
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/valuenoise
 */

import { rand } from './random.js';

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
export const valueNoise = /*wgsl*/`
${rand}

const value_noise_cellsize = 64;

fn valueNoise(){
    let width = i32(params.screen.x);
    let height = i32(params.screen.y);
    let cellSize = 64;
    _ = value_noise_data[0];

    for(var index = 0; index < i32(params.value_noise_data_length); index++){
        let x = index % width;
        let y = index / width;

        if(x % cellSize == 0 && y % cellSize == 0){

            let rx = x / cellSize;
            let ry = y / cellSize;

            let randomDataIndex = rx + (ry * width);

            let dataP = &value_noise_data[randomDataIndex];
            (*dataP) = rand();
        }
    }
}
`;
