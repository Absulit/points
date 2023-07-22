import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { RenderPass } from '../../src/absulit.points.module.js';
const circleblur = {
    renderPasses: [
        new RenderPass(null, null, compute, 800, 800, 1),
        new RenderPass(vert, frag, null, 8, 1, 1)
    ],
    init: async points => {
        points.addSampler('feedbackSampler', null);
        points.addTexture2d('feedbackTexture', true);
        points.addBindingTexture('outputTex', 'computeTexture');
    },
    update: points => {

    }
}

export default circleblur;