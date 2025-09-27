import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';


const color = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('color_blendAmount', params.blendAmount || .5);
    points.setUniform('color_color', params.color || [1, .75, .79, 1], 'vec4f');
});
color.required = ['color', 'blendAmount'];
color.name = 'Color';

export default color;