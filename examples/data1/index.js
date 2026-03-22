// original article on compute shaders
// https://developer.chrome.com/articles/gpu-compute/

import Points from 'points';
import compute from './compute.js';

let read = false;

const data1 = {
    compute,
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        const { storages } = points;
        read = false;
        const firstMatrix = [
            2 /* rows */, 4 /* columns */,
            1, 2, 3, 4,
            5, 6, 7, 8
        ];

        storages.firstMatrix.setType('Matrix').setValue(firstMatrix);

        const secondMatrix = [
            4 /* rows */, 2 /* columns */,
            1, 2,
            3, 4,
            5, 6,
            7, 8
        ];

        storages.secondMatrix.setType('Matrix').setValue(secondMatrix);

        // original lines as reference:
        // let resultMatrixBufferSize = 2 + firstMatrix[0] * secondMatrix[1];
        // console.log(resultMatrixBufferSize);
        storages.resultMatrix.setType('Matrix').setReadable(true);

        // reading the result with an event
        points.addEventListener('result_test', data => {
            // const [a, b, c, d] = data;
            // console.log('---- result', a, b, c, d);
        }, 4);

    },
    update: async points => {

    },
    read: async points => {
        if (!read) {
            read = true;
            const { storages } = points;
            let [a, b, c, d] = await storages.resultMatrix.read();
            console.log(a, b, c, d);
        }
    }
}

export default data1;
