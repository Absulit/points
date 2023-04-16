import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const blur = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('blur_resolution_x', params?.resolution[0] || 50);
        points.addUniform('blur_resolution_y', params?.resolution[1] || 50);
        points.addUniform('blur_direction_x', params?.direction[0] || .4);
        points.addUniform('blur_direction_y', params?.direction[1] || .4);
        points.addUniform('blur_radians', params?.radians || 0);
    },
    update: points => {

    }
}

export default blur;