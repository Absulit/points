
import Points, { RenderPass } from 'points';
import vert from './cube_renderpass/vert.js';
import frag from './cube_renderpass/frag.js';
import compute from './cube_renderpass/compute.js';
import { isMobile } from 'utils';

const options = {
    val: .98,
}

options.isMobile = isMobile();

let WORKGROUP_X = 16;
let WORKGROUP_Y = 4;
let WORKGROUP_Z = 4;

let THREADS_X = 8;
let THREADS_Y = 8;
let THREADS_Z = 4;

let WIDTH = 15;
let HEIGHT = 15;

if(options.isMobile){
    WORKGROUP_X = 2;
    WORKGROUP_Y = 2;
    WORKGROUP_Z = 2;

    THREADS_X = 3;
    THREADS_Y = 2;
    THREADS_Z = 2;

    WIDTH = 6;
    HEIGHT = 6;
}

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * WORKGROUP_Z * THREADS_X * THREADS_Y * THREADS_Z;
console.log('NUMPARTICLES: ', NUMPARTICLES);

const cube_renderpass = new RenderPass(vert, frag, compute, WORKGROUP_X, WORKGROUP_Y, WORKGROUP_Z);
cube_renderpass.depthWriteEnabled = true;
cube_renderpass.name = 'cube_renderpass';

// TODO: cubes need to be outside init() here, because the RenderPass is imported
// and is already in memory the next time is loaded, so new cubes load
// a solution would be to call a remove (like init, update) and delete the RenderPass

cube_renderpass.addCube('base_cube').instanceCount = NUMPARTICLES;

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
        points.setConstant('WIDTH', WIDTH, 'i32');
        points.setConstant('HEIGHT', HEIGHT, 'i32');
        points.setStorage('particles', `array<Particle, ${NUMPARTICLES}>`);

        points.addEventListener('log', data => {
            console.log('Array Max:', data[0] + 1);
        }, 1)

        points.setCameraPerspective('camera', [0, 0, -5]);

    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setCameraPerspective('camera', [0, 0, -5]);
    }
}

export default base;
