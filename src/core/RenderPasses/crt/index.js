import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';


const color = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('crt_sliderA', params.sliderA || .050);
    points.setUniform('crt_sliderB', params.sliderB || .390);
    points.setUniform('crt_sliderC', params.sliderC || .013);
});
color.required = ['color', 'blendAmount'];
color.name = 'Color';

export default color;