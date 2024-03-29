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
        points.addUniform('randNumber', 0);
        points.addUniform('randNumber2', 0);
        // let data = [];
        for (let k = 0; k < 800*800; k++) {
            data.push(Math.random());
        }
        points.addStorageMap('rands', data, 'array<f32>');
        points.addSampler('feedbackSampler');
        points.addTexture2d('feedbackTexture', true);
        points.addBindingTexture('outputTex', 'computeTexture');
    },
    update: points => {
        points.updateUniform('randNumber', Math.random());
        points.updateUniform('randNumber2', Math.random());
        // data = [];
        for (let k = 0; k < 800*800; k++) {
            data[k] = Math.random();
        }
        // points.updateStorageMap('rands', data);
    }
}

export default random2;