import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const grayscale = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, true, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).isolated = true;
    points.setTexture2d('renderpass_feedbackTexture', true).isolated = false;
});
// grayscale.isolated = true;
grayscale.name = 'grayscale';

export default grayscale;