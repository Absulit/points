// original article on compute shaders
// https://developer.chrome.com/articles/gpu-compute/

import compute from './compute.js';

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

        let resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * (2 + firstMatrix[0] * secondMatrix[1]);
        points.addStorage('resultMatrix', 1, 'Matrix', resultMatrixBufferSize, true);
    },
    update: async points => {

    },
    read: async points => {
        let result = await points.readStorage('resultMatrix');
        console.log(result);
    }
}

export default data1;