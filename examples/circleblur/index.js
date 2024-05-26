import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import RenderPass from 'renderpass';
import Points from 'points';
const circleblur = {
    renderPasses: [
        new RenderPass(null, null, compute, 800, 800, 1),
        new RenderPass(vert, frag, null, 8, 1, 1)
    ],
    /**
     *
     * @param {Points} points 
     */
    init: async points => {
        points.addSampler('feedbackSampler', null);
        points.addTexture2d('feedbackTexture', true);
        points.addBindingTexture('outputTex', 'computeTexture');
    },
    update: points => {

    }
}

export default circleblur;