import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { RenderPass } from 'points';

const options = {
    sliderA: .291,
}

const random3 = {

    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800)
    ],
    init: async (points, folder) => {
        const { uniforms } = points;
        points.setSampler('feedbackSampler');
        points.setTexture2d('feedbackTexture', true);
        points.setBindingTexture('outputTex', 'computeTexture');

        uniforms.sliderA = options.sliderA;
        folder.add(options, 'sliderA', 0, 1, .0001).name('sliderA');
        folder.open();
    },
    update: points => {
        const { uniforms } = points;
        uniforms.sliderA = options.sliderA;
    }
}

export default random3;