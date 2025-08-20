import vert from './vert.js';

import compute from './pass0/compute.js';
import frag from './pass0/frag.js';

import compute2 from './pass1/compute.js';
import frag2 from './pass1/frag.js';
import Points, { RenderPass } from 'points';

const options = {
    val: 0,
    bool: false,
    color1: '#FF0000', // CSS string
    color2: [0, 128, 255], // RGB array
    color3: [0, 128, 255, 0.3], // RGB with alpha
    color4: { h: 350, s: 0.9, v: 0.3 }, // Hue, saturation, value
    color5: { r: 115, g: 50.9, b: 20.3, a: .1 }, // r, g, b object
}

const base = {

    renderPasses: [
        new RenderPass(vert, frag, compute, 800,800,1),
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