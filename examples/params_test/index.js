import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from '../../src/absulit.points.module.js';

const base = {
    vert,
    compute,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        points.addStorageMap('test', [1,0,0,.5], 'vec4f');
        points.addStorage('test2', 1, 'vec4f', 4);
    },
    update: points => {

    }
}

export default base;