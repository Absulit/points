import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const bloom = {
    vertexShader,
    fragmentShader,
    /**
     *
     * @param {Points} points
     * @param {*} params
     */
    init: async (points, params) => {
        points.setSampler('renderpass_feedbackSampler', null);
        points.setTexture2d('renderpass_feedbackTexture', true);
        points.setUniform('bloom_amount', params?.amount || .5);
        points.setUniform('bloom_iterations', params?.iterations || 2);

    },
    update: points => {

    }
}

export default bloom;