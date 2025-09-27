import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const lensDistortion = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('lensDistortion_amount', params.amount || .4).internal = true;
    points.setUniform('lensDistortion_distance', params.distance || .01).internal = true;
});
lensDistortion.required = ['amount', 'distance'];
lensDistortion.name = 'Lens Distortion';

export default lensDistortion;
