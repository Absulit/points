import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const bloom = new RenderPass(vertexShader, fragmentShader);
bloom.required = ['amount', 'iterations'];
bloom.setInit((points, params) => {
    points.setSampler('renderpass_feedbackSampler', null);
    points.setTexture2d('renderpass_feedbackTexture', true);
    points.setUniform('bloom_amount', params.amount);
    points.setUniform('bloom_iterations', params.iterations);
})

export default bloom;
