import vert0 from './r0/vert.js';
import frag0 from './r0/frag.js';
import compute0 from './r0/compute.js';

import Points, { CullMode, PrimitiveTopology, RenderPass } from 'points';
import { loadAndExtract } from 'utils';

const options = {
    thickness: 0.456,
    wireframeColor: [255, 255, 255], // RGB array
    fillColor: [255, 0, 0], // RGB array
    opaque: true,
}

const near = 0.1, far = 100;
const f = 1.0 / Math.tan(Math.PI / 8); // ≈ 2.414
let aspect = null
const nf = 1 / (near - far);

const r0 = new RenderPass(vert0, frag0, compute0);
r0.depthWriteEnabled = true;
r0.cullMode = CullMode.NONE
// r0.topology = PrimitiveTopology.LINE_STRIP
// r0.addCube('cube0');
// r0.addCylinder('cylinder0');
// r0.addPlane('plane0')
// r0.addSphere('sphere0')
// r0.addTorus('torus0')

let url = '../models/monkey_subdivide.glb'; // or remote URL (CORS must allow)

let WORKGROUP_X = 64;
let WORKGROUP_Y = 1;
let WORKGROUP_Z = 1;

let THREADS_X = 256;
let THREADS_Y = 1;
let THREADS_Z = 1;

if (options.isMobile) {
    WORKGROUP_X = 8;
    WORKGROUP_Y = 4;
    WORKGROUP_Z = 2;

    THREADS_X = 4;
    THREADS_Y = 4;
    THREADS_Z = 2;

    url = '../models/monkey.glb';
}

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * WORKGROUP_Z * THREADS_X * THREADS_Y * THREADS_Z;
console.log('NUMPARTICLES: ', NUMPARTICLES);

const data = await loadAndExtract(url);
const { positions, colors, uvs, normals, indices, colorSize, texture } = data[0]
r0.addMesh('monkey', positions, colors, colorSize, uvs, normals, indices)

const vertex_data = positions.reduce((acc, val, idx) => {
    if (idx % 3 === 0) acc.push([]);
    acc[acc.length - 1].push(val);

    if (acc[acc.length - 1].length === 3) {
        acc[acc.length - 1].push(1);
    }

    return acc;
}, []);

const base = {
    renderPasses: [
        r0,
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
        points.setStorage('particles', `array<Particle, ${NUMPARTICLES}>`, false, GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX);

        points.setStorageMap('vertex_data', vertex_data.flat(), `array<vec4f, ${vertex_data.length}>`);

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

        points.setUniform('wireframeColor', options.wireframeColor, 'vec3f');
        folder.addColor(options, 'wireframeColor');

        points.setUniform('fillColor', options.fillColor, 'vec3f');
        folder.addColor(options, 'fillColor');

        points.setUniform('thickness', options.thickness);
        folder.add(options, 'thickness', 0, 5, .0001).name('thickness');

        points.setUniform('opaque', options.opaque);
        folder.add(options, 'opaque').name('opaque').onChange(val =>{
            r0.depthWriteEnabled = val; // TODO: error in depth
        });


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

        points.setUniform('thickness', options.thickness);
        points.setUniform('wireframeColor', options.wireframeColor);
        points.setUniform('fillColor', options.fillColor);
        points.setUniform('opaque', options.opaque);
    }
}

export default base;