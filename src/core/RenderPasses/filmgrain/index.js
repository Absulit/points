import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const filmgrain = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
});
filmgrain.name = 'Filmgrain';

export default filmgrain;
