import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { CullMode, LoadOp, RenderPass, ScaleMode } from 'points';
import { structs } from './structs.js';
import { isMobile } from './../utils.js';

const options = {
    val: 0,
}

options.isMobile = isMobile();

let WORKGROUP_X = 1; // 1024
let WORKGROUP_Y = 1;
let WORKGROUP_Z = 1;

let THREADS_X = 64;
let THREADS_Y = 1;
let THREADS_Z = 1;

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

const r0 = new RenderPass(vert, frag, compute, WORKGROUP_X, WORKGROUP_Y, WORKGROUP_Z);
r0.clearValue = { r: 0, g: 0, b: 0, a: 0 };
// r0.loadOp = LoadOp.CLEAR;
// r0.depthWriteEnabled = true;
r0.cullMode = CullMode.NONE;
r0.setPlane(
    'boid',
    { x: 0, y: 0, z: 0 },
    { width: .1, height: .1, depth: 1. }
).instanceCount = NUMPARTICLES;

const base = {
    renderPasses: [
        r0
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms, storages, constants } = points;
        points.import(structs);

        // Set constants for the WGSL shaders
        constants.NUMPARTICLES = NUMPARTICLES;
        constants.THREADS_X = 64;
        constants.THREADS_Y = 1;
        constants.THREADS_Z = 1;

        // Simulation parameters
        uniforms.deltaT = 0.04;
        uniforms.rule1Distance = 0.1;
        uniforms.rule2Distance = 0.025;
        uniforms.rule3Distance = 0.025;
        uniforms.rule1Scale = 0.02;
        uniforms.rule2Scale = 0.05;
        uniforms.rule3Scale = 0.005;

        // Initialize buffers with random data
        const initialData = new Float32Array(NUMPARTICLES * 4);
        for (let i = 0; i < NUMPARTICLES; i++) {
            initialData[i * 4 + 0] = (Math.random() - 0.5) * 2.0; // pos.x
            initialData[i * 4 + 1] = (Math.random() - 0.5) * 2.0; // pos.y
            initialData[i * 4 + 2] = (Math.random() - 0.5) * 0.1; // vel.x
            initialData[i * 4 + 3] = (Math.random() - 0.5) * 0.1; // vel.y
        }

        const iData = Array.from(initialData);

        storages.particlesA.setValue(iData).setType(`array<Particle>`);
        storages.particlesB.setValue(iData).setType(`array<Particle>`);

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        const { uniforms } = points;
        uniforms.val = options.val;
    }
}

export default base;