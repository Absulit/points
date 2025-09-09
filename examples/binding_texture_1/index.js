import vert from './vert.js';

import compute from './pass0/compute.js';
import frag from './pass0/frag.js';

import compute2 from './pass1/compute.js';
import frag2 from './pass1/frag.js';
import Points, { RenderPass } from 'points';

const base = {

    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800, 1),
        new RenderPass(vert, frag2, compute2),
    ],
    /**
     *
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.setSampler('imageSampler', null);
        points.setBindingTexture('writeTexture', 'readTexture');
        points.setTexture2d('renderLayer0', true, 0);

        points.setBindingTexture('a', 'b', 0, 1);
    },
    update: points => {

    }
}

export default base;