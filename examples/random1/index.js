import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';

const options = {
    sliderA: .291,
}

const random1 = {
    vert,
    compute,
    frag,
    init: async (points, folder) => {
        const { uniforms } = points;
        uniforms.randPosition = [0, 0];
        points.setSampler('computeTextureSampler');
        points.setBindingTexture('outputTex', 'computeTexture');

        uniforms.sliderA = options.sliderA;
        folder.add(options, 'sliderA', 0, 1, .0001).name('sliderA');
        folder.open();
    },
    update: points => {
        const { uniforms } = points;
        uniforms.randPosition = [Math.random(), Math.random()];
        uniforms.sliderA = options.sliderA;
    }
}

export default random1;