
import Points, { LoadOp, RenderPass } from 'points';
import vert from './cube_renderpass/vert.js';
import frag from './cube_renderpass/frag.js';
import compute from './cube_renderpass/compute.js';
import { isMobile } from 'utils';

const options = {
    lambert: false,
    speed: 1,
    scale: .1,
}

options.isMobile = isMobile();

let WORKGROUP_X = 1024; // 1024
let WORKGROUP_Y = 2;
let WORKGROUP_Z = 2;

let THREADS_X = 8;
let THREADS_Y = 8;
let THREADS_Z = 4;

if (options.isMobile) {
    WORKGROUP_X = 8;
    WORKGROUP_Y = 4;
    WORKGROUP_Z = 2;

    THREADS_X = 4;
    THREADS_Y = 4;
    THREADS_Z = 2;

    options.scale = .616;
}

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * WORKGROUP_Z * THREADS_X * THREADS_Y * THREADS_Z;
console.log('NUMPARTICLES: ', NUMPARTICLES);

const cube_renderpass = new RenderPass(vert, frag, compute, WORKGROUP_X, WORKGROUP_Y, WORKGROUP_Z);
cube_renderpass.clearValue = { r: 0, g: 0, b: 0, a: 0 };
cube_renderpass.loadOp = LoadOp.CLEAR;
cube_renderpass.depthWriteEnabled = true;
cube_renderpass.addPlane(
    'base_cube',
    { x: 0, y: 0, z: 0 },
    { width: 1., height: 1., depth: 1. }
).instanceCount = NUMPARTICLES;


// cube_renderpass.addSphere('sphere').instanceCount = 100;

const near = 0.1, far = 100;
const f = 1.0 / Math.tan(Math.PI / 8); // ≈ 2.414
let aspect = null
const nf = 1 / (near - far);

const base = {
    renderPasses: [
        cube_renderpass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {

        points.setConstant('NUMPARTICLES', NUMPARTICLES, 'u32');
        points.setConstant('WORKGROUP_X', WORKGROUP_X, 'u32');
        points.setConstant('WORKGROUP_Y', WORKGROUP_Y, 'u32');
        points.setConstant('WORKGROUP_Z', WORKGROUP_Z, 'u32');
        points.setConstant('THREADS_X', THREADS_X, 'u32');
        points.setConstant('THREADS_Y', THREADS_Y, 'u32');
        points.setConstant('THREADS_Z', THREADS_Z, 'u32');
        points.setStorage('particles', `array<Particle, ${NUMPARTICLES}>`);

        points.setCameraPerspective('camera');

        points.setUniform('lambert', options.lambert);
        folder.add(options, 'lambert').name('lambert');

        points.setUniform('speed', options.speed);
        folder.add(options, 'speed', 0, 1, .0001).name('speed');

        points.setUniform('scale', options.scale);
        folder.add(options, 'scale', 0, 1, .0001).name('scale');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setCameraPerspective('camera', [0, 1.5, 5], [0, 0, -1000]);
        points.setUniform('lambert', options.lambert);
        points.setUniform('speed', options.speed);
        points.setUniform('scale', options.scale);
    }
}

export default base;
