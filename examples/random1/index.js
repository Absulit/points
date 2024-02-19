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
        points.addUniform('randNumber', 0);
        points.addUniform('randNumber2', 0);
        points.addSampler('computeTextureSampler');
        points.addBindingTexture('outputTex', 'computeTexture');

        points.addUniform('sliderA', options.sliderA, 'f32');
        folder.add(options, 'sliderA', 0, 1, .0001).name('sliderA');
        folder.open();
    },
    update: points => {
        points.updateUniform('randNumber', Math.random());
        points.updateUniform('randNumber2', Math.random());

        points.updateUniform('sliderA', options.sliderA);
    }
}

export default random1;