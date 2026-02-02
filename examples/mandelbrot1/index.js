import vert from './vert.js';
import frag from './frag.js';
import Points, { ScaleMode } from 'points';

const options = {
    numIterations: 40,
}

const base = {
    vert,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.scaleMode = ScaleMode.FIT;
        points.setUniform('scale', options.scale);
        points.setUniform('numIterations', options.numIterations);
        points.setStorage('variables', 'Variable', false, GPUShaderStage.FRAGMENT);
        // folder.add(options, 'numIterations', 1, 1024, .0001).name('numIterations');
        folder.open();

        // points.setStorage('logger', 'f32', true, GPUShaderStage.FRAGMENT);
    },
    update: points => {
        // points.setUniform('numIterations', options.numIterations);
    },
    read: async points => {
        // const result = await points.readStorage('logger');
        // console.log(result[0]);
    }
}

export default base;
