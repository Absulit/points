import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
const data1 = {
    vert,
    compute,
    frag,
    init: async points => {

        const firstMatrix = [
            2 /* rows */, 4 /* columns */,
            1, 2, 3, 4,
            5, 6, 7, 8
        ];

        points.addStorageMap('firstMatrix', firstMatrix, 'f32');

        const secondMatrix = [
            4 /* rows */, 2 /* columns */,
            1, 2,
            3, 4,
            5, 6,
            7, 8
        ];

        points.addStorageMap('secondMatrix', secondMatrix, 'f32');

    },
    update: points => {

    }
}

export default data1;