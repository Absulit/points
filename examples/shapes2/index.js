import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { RenderPass } from 'points';
const shapes2 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800, 1)
    ],
    init: async points => {
        const numPoints = 800*800;
        points.setUniform('numPoints', numPoints);
        points.setStorage('points', `array<vec4<f32>, ${numPoints}>`);
        points.setSampler('feedbackSampler', null);
        points.setBindingTexture('outputTex', 'computeTexture');
    },
    update: points => {

    }
}

export default shapes2;