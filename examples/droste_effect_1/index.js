import vert0 from './renderpass0/vert.js';
import compute0 from './renderpass0/compute.js';
import frag0 from './renderpass0/frag.js';

import vert1 from './renderpass1/vert.js';
import compute1 from './renderpass1/compute.js';
import frag1 from './renderpass1/frag.js';

import Points from 'points';
import { ShaderType } from 'points';
import { RenderPass } from 'points';


/**
 * Genuary 3: Droste Effect
 * http://roy.red/posts/droste/
 * https://github.com/ruby-processing/picrate-examples/blob/master/library/video/capture/data/droste.glsl
 */

const base = {

    renderPasses: [
        new RenderPass(vert0, frag0, compute0),
        new RenderPass(vert1, frag1, compute1)
    ],
    /**
     *
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.setSampler('imageSampler', null, ShaderType.FRAGMENT);
        points.setTexture2d('feedbackTexture', true);
        points.setStorage('variables', 'Variables');
        points.setStorage('colors', 'array<vec3f, 6>');
    },
    update: points => {
    }
}

export default base;