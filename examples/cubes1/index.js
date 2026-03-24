
import Points, { RenderPass } from 'points';
import vert from './cube_renderpass/vert.js';
import frag from './cube_renderpass/frag.js';
import compute from './cube_renderpass/compute.js';
import { isMobile } from 'utils';
import { structs } from './structs.js';

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

if (options.isMobile) {
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

cube_renderpass.setCube('base_cube').instanceCount = NUMPARTICLES;

const base = {
    renderPasses: [
        cube_renderpass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { constants, storages } = points;
        const { COMPUTE } = GPUShaderStage;
        points.import(structs);

        const { WORKGROUP_X: WX, WORKGROUP_Y: WY, WORKGROUP_Z: WZ } = constants;
        const { THREADS_X: TX, THREADS_Y: TY, THREADS_Z: TZ } = constants;

        WX.setValue(WORKGROUP_X).setShaderStage(COMPUTE).setOverride(true);
        WY.setValue(WORKGROUP_Y).setShaderStage(COMPUTE).setOverride(true);
        WZ.setValue(WORKGROUP_Z).setShaderStage(COMPUTE).setOverride(true);

        TX.setValue(THREADS_X).setShaderStage(COMPUTE).setOverride(true);
        TY.setValue(THREADS_Y).setShaderStage(COMPUTE).setOverride(true);
        TZ.setValue(THREADS_Z).setShaderStage(COMPUTE).setOverride(true);

        // these can't be overrided because they are part of a const calculation
        // in the compute shader, and if they are overridden they don't exist
        // at that point
        constants.WIDTH.setValue(WIDTH).setShaderStage(COMPUTE).setType('i32');
        constants.HEIGHT.setValue(HEIGHT).setShaderStage(COMPUTE).setType('i32');

        storages.particles.setType(`array<Particle, ${NUMPARTICLES}>`);

        points.addEventListener('log', data => {
            console.log('Array Max:', data[0] + 1);
        }, 1)

        points.setCameraPerspective('camera');

    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setCameraPerspective('camera', [0, 0, 5], [0, 0, -1000]);
    }
}

export default base;
