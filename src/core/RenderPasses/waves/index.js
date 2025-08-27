import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const waves = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.setSampler('renderpass_feedbackSampler', null);
        points.setTexture2d('renderpass_feedbackTexture', true);
        points.setUniform('waves_scale', params?.scale || .45);
        points.setUniform('waves_intensity', params?.intensity || .03);
    },
    update: points => {

    }
}

export default waves;