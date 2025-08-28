import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';


const color = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null);
    points.setTexture2d('renderpass_feedbackTexture', true);
    points.setUniform('color_blendAmount', params.blendAmount);
    points.setUniform('color_color', params.color, 'vec4f');
});
color.required = ['color', 'blendAmount'];

export default color;