// original article on compute shaders
// https://developer.chrome.com/articles/gpu-compute/

import compute from './compute.js';

let read = false;

const data1 = {
    compute,
    init: async points => {

        const firstMatrix = [
            2 /* rows */, 4 /* columns */,
            1, 2, 3, 4,
            5, 6, 7, 8
        ];

        points.addStorageMap('firstMatrix', firstMatrix, 'Matrix');

        const secondMatrix = [
            4 /* rows */, 2 /* columns */,
            1, 2,
            3, 4,
            5, 6,
            7, 8
        ];

        points.addStorageMap('secondMatrix', secondMatrix, 'Matrix');

        let resultMatrixBufferSize = 2 + firstMatrix[0] * secondMatrix[1];
        console.log(resultMatrixBufferSize);
        points.addStorage('resultMatrix', 1, 'Matrix', true);
    },
    update: async points => {

    },
    read: async points => {
        if(!read){
            let result = await points.readStorage('resultMatrix');
            console.log(result);
            read = true;
        }
    }
}

export default data1;