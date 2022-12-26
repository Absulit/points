import { rand } from './random.js';


export const valueNoise = /*wgsl*/`
${rand}

const value_noise_cellsize = 64;

fn valueNoise(){
    _ = value_noise_data[0];


    for(var index = 0; index < i32(params.value_noise_data_length); index++){
        let dataP = &value_noise_data[index];
        (*dataP) = rand();
    }

}
`;