import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from 'points';
import { RenderPass } from 'points';
import { RenderPasses } from 'points';

const options = {
    sliderA: 0.619,
    sliderB: 0.861,
    sliderC: 0.508,
}

const base = {
    vert,
    compute,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.setConstant('UNIT', 1. / 100., 'f32');

        points.setUniform('sliderA', options.sliderA);
        points.setUniform('sliderB', options.sliderB);
        points.setUniform('sliderC', options.sliderC);
        folder.add(options, 'sliderA', -1, 1, .0001).name('sliderA');
        folder.add(options, 'sliderB', -1, 1, .0001).name('sliderB');
        folder.add(options, 'sliderC', -1, 1, .0001).name('sliderC');
        folder.open();


        let side = 8;
        let numPoints = side * side * side;
        points.setUniform('numPoints', numPoints);
        points.setUniform('side', side);
        console.log(numPoints);
        points.setStorage('points', `array<vec3f, ${numPoints}>`, false);
        points.setStorage('variables', 'Variable', false);


        // RenderPasses.lensDistortion(points, .85, .0);
        // RenderPasses.bloom(points, .1);

        // points.addRenderPass(RenderPasses.LENS_DISTORTION, {amount: .85, distance: 0});
    },
    update: points => {
        points.setUniform('sliderA', options.sliderA);
        points.setUniform('sliderB', options.sliderB);
        points.setUniform('sliderC', options.sliderC);
    }
}

export default base;