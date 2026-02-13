import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { RenderPass, ScaleMode } from 'points';
import { structs } from './structs.js';

const options = {
    speed: 1,
}

const r0 = new RenderPass(vert, frag, compute, 1, 1, 1);

const base = {
    renderPasses: [
        r0
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.scaleMode = ScaleMode.FIT;
        points.import(structs);

        // points.setStorage('colorInput', 'vec4f');
        // points.setStorage('colorOutput', 'vec4f');
        points.setStorageSwap('buffer', 'array<f32, 64>');


        points.setUniform('speed', options.speed);
        folder.add(options, 'speed', -1, 1, .0001).name('speed');

        points.addEventListener('event', data => {
            console.log(data[0]);

        }, 4)

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setUniform('speed', options.speed);
        points.swap()
    }
}

export default base;