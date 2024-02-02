import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import RenderPass from 'renderpass';
const shapes2 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800, 1)
    ],
    init: async points => {
        const numPoints = 800*800;
        points.addUniform('numPoints', numPoints);
        points.addStorage('points', `array<vec4<f32>, ${numPoints}>`);
        points.addSampler('feedbackSampler', null);
        points.addBindingTexture('outputTex', 'computeTexture');
    },
    update: points => {

    }
}

export default shapes2;