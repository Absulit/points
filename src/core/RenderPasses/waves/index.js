import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const waves = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null);
    points.setTexture2d('renderpass_feedbackTexture', true);
    points.setUniform('waves_scale', params.scale || .45);
    points.setUniform('waves_intensity', params.intensity || .03);
});
waves.required = ['scale', 'intensity'];

export default waves;
