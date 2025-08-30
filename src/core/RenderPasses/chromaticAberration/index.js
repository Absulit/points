import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const chromaticAberration = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
    points.isolated = true;
    points.setSampler('renderpass_feedbackSampler', null);
    points.setTexture2d('renderpass_feedbackTexture', true);
    points.setUniform('chromaticAberration_distance', params.distance || .02);
    points.isolated = false;
});
chromaticAberration.required = ['distance'];
chromaticAberration.name = 'chromaticAberration';
chromaticAberration.isolated = true;

export default chromaticAberration;