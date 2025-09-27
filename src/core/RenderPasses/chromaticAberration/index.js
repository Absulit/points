import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const chromaticAberration = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('chromaticAberration_distance', params.distance || .02);
});
chromaticAberration.required = ['distance'];
chromaticAberration.name = 'Chromatic Aberration';

export default chromaticAberration;
