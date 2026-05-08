import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { RenderPass } from 'points';

let data = [];

const random2 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800)
    ],
    /**
     * @param {Points} points
     */
    init: async points => {
        const { storages } = points;
        // let data = [];
        for (let k = 0; k < 800 * 800; k++) {
            data.push(Math.random());
        }
        // .stream if the data is going to be updated constantly
        storages.rands.setType('array<f32>').setValue(data).stream = true;

        points.setSampler('feedbackSampler');
        points.setTexture2d('feedbackTexture', true);
        points.setBindingTexture('outputTex', 'computeTexture');
    },
    update: points => {
        for (let k = 0; k < 800 * 800; k++) {
            data[k] = Math.random();
        }
        // alternative to update use .stream
        // it seems this call is not necessary because
        // `data` already updates the value 🤷‍♂️
        // storages.rands.setValue(data)
    }
}

export default random2;