
import Points, { RenderPass } from 'points';
import vert from './cube_renderpass/vert.js';
import frag from './cube_renderpass/frag.js';
import compute from './cube_renderpass/compute.js';
import { isMobile } from 'utils';

const options = {
    lambert: false,
}

options.isMobile = isMobile();

let WORKGROUP_X = 1;
let WORKGROUP_Y = 1;
let WORKGROUP_Z = 1;

let THREADS_X = 8;
let THREADS_Y = 8;
let THREADS_Z = 4;

if(options.isMobile){
    THREADS_X = 4;
    THREADS_Y = 4;
    THREADS_Z = 2;
}

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * WORKGROUP_Z * THREADS_X * THREADS_Y * THREADS_Z;
console.log('NUMPARTICLES: ', NUMPARTICLES);

const cube_renderpass = new RenderPass(vert, frag, compute, WORKGROUP_X, WORKGROUP_Y, WORKGROUP_Z);
cube_renderpass.depthWriteEnabled = true;
cube_renderpass.addCube('base_cube').instanceCount = NUMPARTICLES;
if(!options.isMobile){
    cube_renderpass.addSphere('sphere').instanceCount = 100;
}

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

        points.setCameraPerspective('camera', [0, -1.5, -5]);

        points.setUniform('lambert', options.lambert);
        folder.add(options, 'lambert').name('lambert');

        folder.open();
    },
    /**
     * @param {Points} points
    */
    update: points => {

        points.setCameraPerspective('camera', [0, -1.5, -5]);
        points.setUniform('lambert', options.lambert);
    }
}

export default base;
