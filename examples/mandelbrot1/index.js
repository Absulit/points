import vert from './vert.js';
import frag from './frag.js';
import Points from 'points';

const options = {
    scale: 0.53,
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
        folder.add(options, 'scale', -1, 1, .0001).name('scale');
        folder.open();
    },
    update: points => {
        points.setUniform('scale', options.scale);
    }
}

export default base;
