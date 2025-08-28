import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const blur = new RenderPass(vertexShader, fragmentShader);
blur.required = ['resolution', 'direction', 'radians'];
blur.setInit((points, params) => {
    points.setSampler('renderpass_feedbackSampler', null);
    points.setTexture2d('renderpass_feedbackTexture', true);
    points.setUniform('blur_resolution_x', params.resolution[0]);
    points.setUniform('blur_resolution_y', params.resolution[1]);
    points.setUniform('blur_direction_x', params.direction[0]);
    points.setUniform('blur_direction_y', params.direction[1]);
    points.setUniform('blur_radians', params.radians);
});

export default blur;
