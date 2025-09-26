import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const blur = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null);
    points.setTexture2d('renderpass_feedbackTexture', true);
    points.setUniform('blur_resolution', params.resolution || [50, 50], 'vec2f');
    points.setUniform('blur_direction', params.direction || [.4, .4], 'vec2f');
    points.setUniform('blur_radians', params.radians || 0);
});
blur.required = ['resolution', 'direction', 'radians'];
blur.name = 'Blur';

export default blur;
