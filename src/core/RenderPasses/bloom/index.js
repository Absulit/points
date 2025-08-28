import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const bloom = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null);
    points.setTexture2d('renderpass_feedbackTexture', true);
    points.setUniform('bloom_amount', params.amount);
    points.setUniform('bloom_iterations', params.iterations);
});
bloom.required = ['amount', 'iterations'];

export default bloom;
