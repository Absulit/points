import vert from './vert.js';
import frag from './frag.js';
import Points, { ShaderType } from 'points';

const options = {
    scale: 0.53,
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
        points.setUniform('scale', options.scale);
        points.setUniform('numIterations', options.numIterations);
        points.setStorage('variables', 'Variable', false, ShaderType.FRAGMENT);
        folder.add(options, 'scale', -1, 1000, .0001).name('scale');
        folder.add(options, 'numIterations', 1, 1024, .0001).name('numIterations');
        folder.open();
    },
    update: points => {
        points.setUniform('scale', options.scale);
        points.setUniform('numIterations', options.numIterations);
    }
}

export default base;
