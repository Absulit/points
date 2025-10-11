
import Points, { RenderPass } from 'points';
import vert from './cube_renderpass/vert.js';
import frag from './cube_renderpass/frag.js';
import compute from './cube_renderpass/compute.js';

import vertdepth from './depth_renderpass/vert.js';
import fragdepth from './depth_renderpass/frag.js';

const options = {
    val: 0,
}

const WORKGROUP_X = 16;
const WORKGROUP_Y = 4;
const WORKGROUP_Z = 4;

const THREADS_X = 8;
const THREADS_Y = 8;
const THREADS_Z = 4;

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * WORKGROUP_Z * THREADS_X * THREADS_Y * THREADS_Z;
console.log('NUMPARTICLES: ', NUMPARTICLES);

const cube_renderpass = new RenderPass(vert, frag, compute, WORKGROUP_X, WORKGROUP_Y, WORKGROUP_Z);
cube_renderpass.instanceCount = NUMPARTICLES;
cube_renderpass.depthWriteEnabled = true;
cube_renderpass.name = 'cube_renderpass';

const depth_renderpass = new RenderPass(vertdepth, fragdepth);
depth_renderpass.loadOp = 'load';
depth_renderpass.name = 'depth_renderpass';

// TODO: cubes need to be outside init() here, because the RenderPass is imported
// and is already in memory the next time is loaded, so new cubes load
// a solution would be to call a remove (like init, update) and delete the RenderPass

cube_renderpass.addCube(
    'base_cube',
    { x: 0, y: 0, z: 0 },
    { width: 1, height: 1, depth: 1 },
    { r: 1, g: 0, b: 0, a: 1 }
);

const near = 0.1, far = 100;
const f = 1.0 / Math.tan(Math.PI / 8); // ≈ 2.414
let aspect = null
const nf = 1 / (near - far);

const base = {
    renderPasses: [
        cube_renderpass,
        depth_renderpass
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.setTextureDepth2d('depth', GPUShaderStage.FRAGMENT, 0);
        points.setSampler('imageSampler', { compare: 'less' });

        points.setConstant('NUMPARTICLES', NUMPARTICLES, 'u32');
        points.setConstant('WORKGROUP_X', WORKGROUP_X, 'u32');
        points.setConstant('WORKGROUP_Y', WORKGROUP_Y, 'u32');
        points.setConstant('WORKGROUP_Z', WORKGROUP_Z, 'u32');
        points.setConstant('THREADS_X', THREADS_X, 'u32');
        points.setConstant('THREADS_Y', THREADS_Y, 'u32');
        points.setConstant('THREADS_Z', THREADS_Z, 'u32');
        points.setStorage('particles', `array<Particle, ${NUMPARTICLES}>`);

        points.addEventListener('log', data => {
            console.log('Array Max:', data[0] + 1);
        }, 1)

        aspect = points.canvas.width / points.canvas.height;
        points.setUniform(
            'projection',
            [
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, (2 * far * near) * nf, 0
            ],
            'mat4x4<f32>'
        )

        // camera at [0, 0, 5], looking at origin
        points.setUniform(
            'view',
            [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, -5, 1
            ],
            'mat4x4<f32>'
        )

        points.setUniform('val', options.val);
        folder.add(options, 'val', 0, 2, .0001).name('Val');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {

        aspect = points.canvas.width / points.canvas.height;
        points.setUniform(
            'projection',
            [
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, (2 * far * near) * nf, 0
            ]
        )

        points.setUniform('val', options.val);
    }
}

export default base;