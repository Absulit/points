import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const lensDistortion = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points._setInternal(true);
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('lensDistortion_amount', params?.amount || .4)
        points.addUniform('lensDistortion_distance', params?.distance || .01);
        points._setInternal(false);
    },
    update: async points => {

    }
}

export default lensDistortion;