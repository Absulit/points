import { rand } from './random.js';


export const valueNoise = /*wgsl*/`
${rand}

const value_noise_cellsize = 64;

fn valueNoise(){
    let width = i32(params.screenWidth);
    let height = i32(params.screenHeight);
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