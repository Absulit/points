import vertexShader from './vert.js';
import fragmentShader from './frag.js';
import { RenderPass } from 'points';

const chromaticAberration = new RenderPass(vertexShader, fragmentShader);
chromaticAberration.required = ['distance']
chromaticAberration.setInit((points, params) => {
    points.setSampler('renderpass_feedbackSampler', null);
    points.setTexture2d('renderpass_feedbackTexture', true);
    points.setUniform('chromaticAberration_distance', params.distance);
});

export default chromaticAberration;