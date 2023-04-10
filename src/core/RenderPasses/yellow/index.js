import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import computeShader from './compute.js';

const yellow = {
    vertexShader,
    fragmentShader,
    computeShader,
    init: async (points, blendAmount) => {
        points.addSampler('_feedbackSampler', null);
        points.addTexture2d('_feedbackTexture', true);
        points.addUniform('blendAmount', blendAmount)
    },
    update: points => {

    }
}

export default yellow;