import vert0 from './renderpass0/vert.js';
import frag0 from './renderpass0/frag.js';

import vert1 from './renderpass1/vert.js';
import frag1 from './renderpass1/frag.js';

import Points from 'points';
import { RenderPass } from 'points';


/**
 * Genuary 3: Droste Effect
 * http://roy.red/posts/droste/
 * https://github.com/ruby-processing/picrate-examples/blob/master/library/video/capture/data/droste.glsl
 */

// TODO: do colors requires a 0 at the end? (padding)
const colors = [
    248,208,146, 0,
    21, 144, 151, 0,
    56, 164, 140, 0,
    26, 86, 120, 0,
    37, 36, 93, 0,
    87, 28, 86, 0,
].map(i => i / 255);

const base = {

    renderPasses: [
        new RenderPass(vert0, frag0),
        new RenderPass(vert1, frag1)
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.setSampler('imageSampler', null, GPUShaderStage.FRAGMENT);
        points.setTexture2d('feedbackTexture', true);
        points.setStorageMap('colors', colors, 'array<vec3f, 6>');
    },
    update: points => {
    }
}

export default base;