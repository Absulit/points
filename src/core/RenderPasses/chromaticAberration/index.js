import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const chromaticAberration = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.setSampler('renderpass_feedbackSampler', null);
        points.setTexture2d('renderpass_feedbackTexture', true);
        points.setUniform('chromaticAberration_distance', params.distance);
    },
    update: points => {

    }
}

export default chromaticAberration;