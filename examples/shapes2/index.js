import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { RenderPass } from 'points';
const shapes2 = {
    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800, 1)
    ],
    /**
     * @param {Points} points
     */
    init: async points => {
        const { uniforms } = points;
        const numPoints = 800 * 800;
        uniforms.numPoints = numPoints;
        points.setStorage('points').setType(`array<vec4f, ${numPoints}>`);
        points.setSampler('feedbackSampler', null);
        points.setBindingTexture('outputTex', 'computeTexture');
    },
    update: points => {

    }
}

export default shapes2;
