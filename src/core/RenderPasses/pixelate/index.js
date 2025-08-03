import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const pixelate = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points._setInternal(true);
        points.setSampler('renderpass_feedbackSampler', null);
        points.setTexture2d('renderpass_feedbackTexture', true);
        points.setUniform('pixelate_pixelsWidth', params.pixelsWidth);
        points.setUniform('pixelate_pixelsHeight', params.pixelsHeight);
        points._setInternal(false);
    },
    update: points => {

    }
}

export default pixelate;