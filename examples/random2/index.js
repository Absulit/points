import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import RenderPass from 'renderpass';

let data = [];

const random2 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800)
    ],
    init: async points => {
        points.setUniform('randNumber', 0);
        points.setUniform('randNumber2', 0);
        // let data = [];
        for (let k = 0; k < 800*800; k++) {
            data.push(Math.random());
        }
        points.setStorageMap('rands', data, 'array<f32>');
        points.setSampler('feedbackSampler');
        points.setTexture2d('feedbackTexture', true);
        points.setBindingTexture('outputTex', 'computeTexture');
    },
    update: points => {
        points.setUniform('randNumber', Math.random());
        points.setUniform('randNumber2', Math.random());
        // data = [];
        for (let k = 0; k < 800*800; k++) {
            data[k] = Math.random();
        }
        // points.updateStorageMap('rands', data);
    }
}

export default random2;