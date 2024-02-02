import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import RenderPass from 'renderpass';
const shapes1 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 128, 1, 1)
    ],
    init: async points => {
        const numPoints = 128;
        points.addUniform('numPoints', numPoints);
        points.addStorage('points', `array<vec2<f32>, ${numPoints}>`);
    },
    update: points => {

    }
}

export default shapes1;