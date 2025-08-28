import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const lensDistortion = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null);
    points.setTexture2d('renderpass_feedbackTexture', true);
    points.setUniform('lensDistortion_amount', params?.amount || .4)
    points.setUniform('lensDistortion_distance', params?.distance || .01);
});
lensDistortion.required = ['amount', 'distance'];

export default lensDistortion;
