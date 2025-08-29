import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const grayscale = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null, null, false).isolated = true;
    points.setTexture2d('renderpass_feedbackTexture', true).isolated = true;
});
grayscale.isolated = true;
grayscale.name = 'grayscale';

export default grayscale;