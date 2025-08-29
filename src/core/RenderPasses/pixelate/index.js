import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const pixelate = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, false, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).isolate = false;
    points.setTexture2d('renderpass_feedbackTexture', true).isolated = false;
    points.setUniform('pixelate_pixelDims', params.pixelDimensions || [10, 10], 'vec2f').isolated = false;
});
pixelate.required = ['pixelDimensions'];
pixelate.name = 'pixelate';

export default pixelate;
