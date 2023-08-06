import Points from './../../src/absulit.points.module.js';
import RenderPass from '../../src/RenderPass.js';

import renderPass0 from './pass0/index.js';

const base = {
    renderPasses: [
        renderPass0
    ],
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        // points.addUniform('up')
    },
    update: points => {

    }
}

export default base;