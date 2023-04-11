import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const color = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('color_blendAmount', params.blendAmount)
        points.addUniform('color_r', params.color[0])
        points.addUniform('color_g', params.color[1])
        points.addUniform('color_b', params.color[2])
        points.addUniform('color_a', params.color[3])
    },
    update: points => {

    }
}

export default color;