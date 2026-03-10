import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { RenderPass } from 'points';

let data = [];
let rands;

const random2 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800)
    ],
    init: async points => {
        points.setUniform('randNumber', 0);
        points.setUniform('randNumber2', 0);
        // let data = [];
        for (let k = 0; k < 800 * 800; k++) {
            data.push(Math.random());
        }
        // .stream if the data is going to be updated constantly
        rands = points.setStorage('rands', 'array<f32>')
            .setValue(data).stream = true;
        points.setSampler('feedbackSampler');
        points.setTexture2d('feedbackTexture', true);
        points.setBindingTexture('outputTex', 'computeTexture');
    },
    update: points => {
        const { randNumber, randNumber2 } = points.params;
        randNumber.value = Math.random();
        randNumber2.value = Math.random();

        for (let k = 0; k < 800 * 800; k++) {
            data[k] = Math.random();
        }
        // alternative to update use .stream
        // it seems this call is not necessary because
        // `data` already updates the value 🤷‍♂️
        // rands.setValue(data)
    }
}

export default random2;