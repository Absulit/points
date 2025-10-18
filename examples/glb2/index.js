
import Points, { RenderPass, RenderPasses } from 'points';

import vert from './glb_renderpass/vert.js';
import frag from './glb_renderpass/frag.js';
import compute from './glb_renderpass/compute.js';

import vertdepth from './depth_renderpass/vert.js';
import fragdepth from './depth_renderpass/frag.js';
import { loadAndExtract } from 'utils';

const options = {
    mode: 1,
    dof: .33
}

const WORKGROUP_X = 4;
const WORKGROUP_Y = 4;
const WORKGROUP_Z = 1;

const THREADS_X = 2;
const THREADS_Y = 2;
const THREADS_Z = 2;

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * WORKGROUP_Z * THREADS_X * THREADS_Y * THREADS_Z;
console.log('NUMPARTICLES: ', NUMPARTICLES);

const glb_renderpass = new RenderPass(vert, frag, compute, WORKGROUP_X, WORKGROUP_Y, WORKGROUP_Z);
glb_renderpass.depthWriteEnabled = true;
glb_renderpass.name = 'glb_renderpass';

const depth_renderpass = new RenderPass(vertdepth, fragdepth);
depth_renderpass.loadOp = 'load';
depth_renderpass.name = 'depth_renderpass';

const near = 0.1, far = 100;
const f = 1.0 / Math.tan(Math.PI / 8); // ≈ 2.414
let aspect = null
const nf = 1 / (near - far);

const url = '../models/lucy.glb'; // or remote URL (CORS must allow)
const data = await loadAndExtract(url);
const { positions, colors, uvs, normals, indices, colorSize, texture } = data[0];
glb_renderpass
    .addMesh('lucy', positions, colors, colorSize, uvs, normals, indices)
    .instanceCount = NUMPARTICLES;
glb_renderpass.depthWriteEnabled = true;

const base = {
    renderPasses: [
        glb_renderpass,
        depth_renderpass
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.setTextureDepth2d('depth', GPUShaderStage.FRAGMENT, 0);
        points.setSampler('imageSamplerCompare', { compare: 'less' });

        points.setTexture2d('first_pass', true, null, 0);

        await points.setTextureImage('albedo', texture);
        points.setSampler('imageSampler', null);

        points.setUniform('dof', options.dof);
        folder.add(options, 'dof', 0, 1, .0001).name('DOF');

        const dropdownItems = { /*'Vertex': 0,*/ 'Texture': 1, 'Shader': 2 };

        points.setUniform('color_mode', options.mode);
        folder.add(options, 'mode', dropdownItems).name('Colors').onChange(value => {
            console.log(value);
            points.setUniform('color_mode', value);
        });

        points.setConstant('NUMPARTICLES', NUMPARTICLES, 'u32');
        points.setConstant('WORKGROUP_X', WORKGROUP_X, 'u32');
        points.setConstant('WORKGROUP_Y', WORKGROUP_Y, 'u32');
        points.setConstant('WORKGROUP_Z', WORKGROUP_Z, 'u32');
        points.setConstant('THREADS_X', THREADS_X, 'u32');
        points.setConstant('THREADS_Y', THREADS_Y, 'u32');
        points.setConstant('THREADS_Z', THREADS_Z, 'u32');
        points.setStorage('particles', `array<Particle, ${NUMPARTICLES}>`);

        points.addEventListener('logger', data => {
            console.log(data[0]);
        },4)

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

        // points.addRenderPass(RenderPasses.COLOR);
        // points.addRenderPass(RenderPasses.PIXELATE);
        // points.addRenderPass(RenderPasses.FILM_GRAIN);

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

        points.setUniform('dof', options.dof);
    }
}

export default base;
