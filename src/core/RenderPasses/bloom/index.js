import vertexShader from './vert.js';
import fragmentShader from './frag.js';

const bloom = {
    vertexShader,
    fragmentShader,
    init: async (points, params) => {
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('bloom_amount', params?.amount || .5);
        points.addUniform('bloom_iterations', params?.iterations || 2);

    },
    update: points => {

    }
}

export default bloom;