import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const pixelate = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null);
    points.setTexture2d('renderpass_feedbackTexture', true);
    points.setUniform('pixelate_pixelsWidth', params.pixelsWidth);
    points.setUniform('pixelate_pixelsHeight', params.pixelsHeight);
});
pixelate.required = ['pixelsWidth', 'pixelsHeight']

export default pixelate;