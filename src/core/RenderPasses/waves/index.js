import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const waves = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('waves_scale', params?.scale || .45);
        points.addUniform('waves_intensity', params?.intensity || .03);
    },
    update: points => {

    }
}

export default waves;