import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const blur = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('blur_amount', params.amount)
    },
    update: points => {

    }
}

export default blur;