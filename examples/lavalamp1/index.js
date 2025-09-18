import Points from 'points';
import { RenderPass } from 'points';

import vert1 from './vert.js';
import frag1 from './frag.js';


/**
 * Genuary 12: Lava Lamp
 *
 */

const base = {
    renderPasses: [
        new RenderPass(vert1, frag1),
    ],
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        const numObjects = 20;
        points.setStorage('variables', 'Variables', false, GPUShaderStage.FRAGMENT);
        points.setStorage('objects', `array<Object, ${numObjects}>`, false, GPUShaderStage.FRAGMENT);
    },
    update: points => {

    }
}

export default base;