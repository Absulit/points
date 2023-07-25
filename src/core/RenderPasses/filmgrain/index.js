import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import ShaderType from '../../../absulit.points.module.js';

const filmgrain = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points._setInternal(true);
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points._setInternal(false);

    },
    update: points => {

    }
}

export default filmgrain;