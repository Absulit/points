import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const lensDistortion = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('lensDistortion_amount', params.amount)
    },
    update: async points => {

    }
}

export default lensDistortion;