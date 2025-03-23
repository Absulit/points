import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import RenderPass from 'renderpass';

const options = {
    sliderA: .291,
}

const random3 = {

    renderPasses: [
        new RenderPass(vert, frag, compute, 800, 800)
    ],
    init: async (points, folder) => {
        points.setSampler('feedbackSampler');
        points.setTexture2d('feedbackTexture', true);
        points.setBindingTexture('outputTex', 'computeTexture');

        points.setUniform('sliderA', options.sliderA, 'f32');
        folder.add(options, 'sliderA', 0, 1, .0001).name('sliderA');
        folder.open();
    },
    update: points => {
        points.setUniform('sliderA', options.sliderA);
    }
}

export default random3;