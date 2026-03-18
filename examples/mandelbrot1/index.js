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
        const { uniforms } = points;
        points.scaleMode = ScaleMode.FIT;
        uniforms.scale = options.scale;
        uniforms.numIterations = options.numIterations;
        points.setStorage('variables', 'Variable')
            .setShaderStage(GPUShaderStage.FRAGMENT);
        // folder.add(options, 'numIterations', 1, 1024, .0001).name('numIterations');
        folder.open();

        // points.setStorage('logger', 'f32', true, GPUShaderStage.FRAGMENT);
    },
    update: points => {
        // const { uniforms } = points;
        // uniforms.numIterations = options.numIterations;
    },
    read: async points => {
        // const result = await points.readStorage('logger');
        // console.log(result[0]);
    }
}

export default base;
