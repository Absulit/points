import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const pixelate = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('pixelate_pixelsWidth', params.pixelsWidth);
        points.addUniform('pixelate_pixelsHeight', params.pixelsHeight);
    },
    update: points => {

    }
}

export default pixelate;