import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from './../../src/absulit.points.module.js';
import RenderPass from '../../src/RenderPass.js';

const base = {
    renderPasses: [
        new RenderPass(vert, frag, compute)
    ],
    /**
     *
     * @param {Points} points
     */
    init: async points => {

    },
    update: points => {

    }
}

export default base;