import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';


const color = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('crt_scale', params.scale || .390);
    points.setUniform('crt_displacement', params.displacement || .013);
});
color.required = ['scale', 'displacement'];
color.name = 'CRT';

export default color;