import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const waves = new RenderPass(vertexShader, fragmentShader);
waves.required = ['scale', 'intensity'];
waves.setInit((points, params) => {
    points.setSampler('renderpass_feedbackSampler', null);
    points.setTexture2d('renderpass_feedbackTexture', true);
    points.setUniform('waves_scale', params?.scale || .45);
    points.setUniform('waves_intensity', params?.intensity || .03);
});

export default waves;
