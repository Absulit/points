import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const yellow = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.addSampler('yellow_feedbackSampler', null);
        points.addTexture2d('yellow_feedbackTexture', true);
        points.addUniform('yellow_blendAmount', params.blendAmount)
    },
    update: points => {

    }
}

export default yellow;