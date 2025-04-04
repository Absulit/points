import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import ShaderType from 'shadertype';

const options = {
    sliderA: .291,
}

const random1 = {
    vert,
    compute,
    frag,
    init: async (points, folder) => {
        points.setUniform('randNumber', 0);
        points.setUniform('randNumber2', 0);
        points.setSampler('computeTextureSampler');
        points.setBindingTexture('outputTex', 'computeTexture');

        points.setUniform('sliderA', options.sliderA, 'f32');
        folder.add(options, 'sliderA', 0, 1, .0001).name('sliderA');
        folder.open();
    },
    update: points => {
        points.setUniform('randNumber', Math.random());
        points.setUniform('randNumber2', Math.random());

        points.setUniform('sliderA', options.sliderA);
    }
}

export default random1;