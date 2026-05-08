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
     * @param {Points} points
     */
    init: async points => {
        const { storages } = points;
        const { FRAGMENT } = GPUShaderStage;
        const numObjects = 20;

        storages.variables.setType('Variables').setShaderStage(FRAGMENT);
        storages.objects.setType(`array<Object, ${numObjects}>`)
            .setShaderStage(FRAGMENT);
    },
    update: points => {

    }
}

export default base;