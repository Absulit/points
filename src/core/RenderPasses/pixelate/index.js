import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const pixelate = new RenderPass(vertexShader, fragmentShader);
pixelate.required = ['pixelsWidth', 'pixelsHeight']
pixelate.setInit((points, params) => {
    points.setSampler('renderpass_feedbackSampler', null);
    points.setTexture2d('renderpass_feedbackTexture', true);
    points.setUniform('pixelate_pixelsWidth', params.pixelsWidth);
    points.setUniform('pixelate_pixelsHeight', params.pixelsHeight);
});

export default pixelate;