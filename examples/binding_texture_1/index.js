import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import compute2 from './compute2.js';
import frag2 from './frag2.js';
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
        new RenderPass(vert, frag, compute),
        new RenderPass(vert, frag2, compute2),
    ],
    /**
     *
     * @param {Points} points
     */
    init: async (points, folder) => {

    },
    update: points => {

    }
}

export default base;