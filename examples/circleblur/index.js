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
        points.setSampler('feedbackSampler', null);
        points.setTexture2d('feedbackTexture', true);
        points.setBindingTexture('outputTex', 'computeTexture');
    },
    update: points => {

    }
}

export default circleblur;