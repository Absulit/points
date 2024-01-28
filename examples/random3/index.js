import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import RenderPass from 'renderpass';

const random3 = {

    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800)
    ],
    init: async points => {
        points.addSampler('feedbackSampler');
        points.addTexture2d('feedbackTexture', true);
        points.addBindingTexture('outputTex', 'computeTexture');
    },
    update: points => {

    }
}

export default random3;