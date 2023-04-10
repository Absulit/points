import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const grayscale = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.addSampler('grayscale_feedbackSampler', null);
        points.addTexture2d('grayscale_feedbackTexture', true);
    },
    update: points => {

    }
}

export default grayscale;