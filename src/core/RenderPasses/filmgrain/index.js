import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { ShaderType } from '../../../absulit.points.module.js';

const filmgrain = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);

    },
    update: points => {

    }
}

export default filmgrain;