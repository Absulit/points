import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const lensDistortion = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.setSampler('renderpass_feedbackSampler', null);
        points.setTexture2d('renderpass_feedbackTexture', true);
        points.setUniform('lensDistortion_amount', params?.amount || .4)
        points.setUniform('lensDistortion_distance', params?.distance || .01);
    },
    update: async points => {

    }
}

export default lensDistortion;