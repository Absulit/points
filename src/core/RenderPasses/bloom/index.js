import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import Points from '../../../absulit.points.module.js';

const bloom = {
    vertexShader,
    fragmentShader,
    /**
     * 
     * @param {Points} points 
     * @param {*} params 
     */
    init: async (points, params) => {
        points._setInternal(true);
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('bloom_amount', params?.amount || .5);
        points.addUniform('bloom_iterations', params?.iterations || 2);
        points._setInternal(false);

    },
    update: points => {

    }
}

export default bloom;