import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const pixelate = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.isolated = true;
    points.setSampler('renderpass_feedbackSampler', null)
    points.setTexture2d('renderpass_feedbackTexture', true)
    points.setUniform('pixelate_pixelDims', params.pixelDimensions || [10, 10], 'vec2f')
    points.isolated = false;
});
pixelate.required = ['pixelDimensions'];
pixelate.name = 'pixelate';
pixelate.isolated = true;

export default pixelate;
