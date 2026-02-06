import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { RenderPass } from 'points';
import { loadAndExtract, isMobile } from 'utils';
import { structs } from './structs.js';

const options = {
    visibility: true,
}

options.isMobile = isMobile();

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

const data = await loadAndExtract(url);
const { positions, colors, uvs, normals, indices, colorSize, texture } = data[0]

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * WORKGROUP_Z * THREADS_X * THREADS_Y * THREADS_Z;
console.log('NUMPARTICLES: ', NUMPARTICLES);

const renderPass = new RenderPass(vert, frag, null);
renderPass.depthWriteEnabled = true;
renderPass.addMesh('base_mesh', positions, colors, colorSize, uvs, normals, indices)
renderPass.addSphere('instance_mesh', { x: 0, y: 0, z: 0 }, { r: 0, g: 0, b: 0, a: 0 }, .01).instanceCount = NUMPARTICLES;

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
        renderPass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.import(structs);

        points.setConstant('NUMPARTICLES', NUMPARTICLES, 'u32');
        points.setConstant('WORKGROUP_X', WORKGROUP_X, 'u32');
        points.setConstant('WORKGROUP_Y', WORKGROUP_Y, 'u32');
        points.setConstant('WORKGROUP_Z', WORKGROUP_Z, 'u32');
        points.setConstant('THREADS_X', THREADS_X, 'u32');
        points.setConstant('THREADS_Y', THREADS_Y, 'u32');
        points.setConstant('THREADS_Z', THREADS_Z, 'u32');
        points.setStorage('particles', `array<Particle, ${NUMPARTICLES}>`);

        points.setStorageMap('vertex_data', vertex_data.flat(), `array<vec4f, ${vertex_data.length}>`);

        points.setUniform('visibility', options.visibility);
        folder.add(options, 'visibility').name('visibility');

        points.setCameraPerspective('camera');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setCameraPerspective('camera', [0, 0, 5], [0, 0, -1000]);

        points.setUniform('visibility', options.visibility);
    }
}

export default base;