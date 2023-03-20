import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from './../../src/absulit.points.module.js';


let resultMatrixBufferSize = null;
let storageItem = null;

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

        points.addStorageMap('firstMatrix', firstMatrix, 'Matrix', ShaderType.COMPUTE);

        const secondMatrix = [
            4 /* rows */, 2 /* columns */,
            1, 2,
            3, 4,
            5, 6,
            7, 8
        ];

        points.addStorageMap('secondMatrix', secondMatrix, 'Matrix', ShaderType.COMPUTE);

        resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * (2 + firstMatrix[0] * secondMatrix[1]);
        points.addStorage('resultMatrix', 1, 'Matrix', resultMatrixBufferSize, ShaderType.COMPUTE, true);

        storageItem = points.readStorage('resultMatrix', resultMatrixBufferSize);



    },
    update: async points => {

    },
    read: async points => {
        await storageItem.buffer.mapAsync(GPUMapMode.READ)
        const arrayBuffer = storageItem.buffer.getMappedRange();
        console.log(new Float32Array(arrayBuffer));
    }
}

export default data1;