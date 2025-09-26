import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { RenderPass, RenderPasses }  from 'points';

const options = {
    sliderA: 0.619,
    sliderB: 0.861,
    sliderC: 0.508,
}

const SIDE = 6;

const WORKGROUPS_X = 1;
const WORKGROUPS_Y = 1;
const WORKGROUPS_Z = 1;

const THREADS_X = SIDE;
const THREADS_Y = SIDE;
const THREADS_Z = SIDE;

const NUMPARTICLES = WORKGROUPS_X * WORKGROUPS_Y * WORKGROUPS_Z * THREADS_X * THREADS_Y * THREADS_Z;


const renderPass0 = new RenderPass(vert, frag, compute, WORKGROUPS_X, WORKGROUPS_Y, WORKGROUPS_Z);
renderPass0.instanceCount = NUMPARTICLES;

const base = {
    renderPasses: [
        renderPass0
    ],
    /**
     *
     * @param {Points} points
     */
    init: async (points, folder) => {
        // points.depthWriteEnabled = false;
        points.setConstant('UNIT', 1. / 10., 'f32');
        points.setConstant('NUMPARTICLES', NUMPARTICLES, 'u32');
        points.setConstant('SIDE', SIDE, 'u32');
        points.setConstant('HALFSIDE', 'i32(SIDE / 2)', 'i32');

        points.setConstant('THREADS_X', THREADS_X, 'u32');
        points.setConstant('THREADS_Y', THREADS_Y, 'u32');
        points.setConstant('THREADS_Z', THREADS_Z, 'u32');

        points.setUniform('sliderA', options.sliderA);
        points.setUniform('sliderB', options.sliderB);
        points.setUniform('sliderC', options.sliderC);
        folder.add(options, 'sliderA', -1, 1, .0001).name('sliderA');
        folder.add(options, 'sliderB', -1, 1, .0001).name('sliderB');
        folder.add(options, 'sliderC', -1, 1, .0001).name('sliderC');
        folder.open();


        console.log(NUMPARTICLES);
        points.setStorage('particles', `array<Particle, ${NUMPARTICLES}>`, false);
        points.setStorage('variables', 'Variable', false);


        // RenderPasses.lensDistortion(points, .85, .0);
        // RenderPasses.bloom(points, .1);

        points.addRenderPass(RenderPasses.LENS_DISTORTION, {amount: .85, distance: 0});
    },
    update: points => {
        points.setUniform('sliderA', options.sliderA);
        points.setUniform('sliderB', options.sliderB);
        points.setUniform('sliderC', options.sliderC);
    }
}

export default base;