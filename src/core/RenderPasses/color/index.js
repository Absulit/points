import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import Points from 'points';

const color = {
    vertexShader,
    fragmentShader,
    required: ['color', 'blendAmount'],
    /**
     * @param {Points} points
     * @param {*} params
     */
    init: async (points, params) => {
        points.setSampler('renderpass_feedbackSampler', null);
        points.setTexture2d('renderpass_feedbackTexture', true);
        points.setUniform('color_blendAmount', params.blendAmount);
        points.setUniform('color_color', params.color, 'vec4f');
    },
    update: points => {

    }
}

export default color;