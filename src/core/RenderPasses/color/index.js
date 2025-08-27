import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const color = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.setSampler('renderpass_feedbackSampler', null);
        points.setTexture2d('renderpass_feedbackTexture', true);
        points.setUniform('color_blendAmount', params?.blendAmount || .5);
        points.setUniform('color_r', params?.color[0] || 1);
        points.setUniform('color_g', params?.color[1] || 1);
        points.setUniform('color_b', params?.color[2] || 0);
        points.setUniform('color_a', params?.color[3] || 1);
    },
    update: points => {

    }
}

export default color;