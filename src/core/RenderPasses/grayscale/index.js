import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const grayscale = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.setSampler('renderpass_feedbackSampler', null);
        points.setTexture2d('renderpass_feedbackTexture', true);
    },
    update: points => {

    }
}

export default grayscale;