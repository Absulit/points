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


const data = await loadAndExtract(url);

const { positions, colors, uvs, normals, indices, colorSize, texture } = data[0]
const num_triangles = indices.length / 3;

const vertex_data = positions.reduce((acc, val, idx) => {
    if (idx % 3 === 0) acc.push([]);
    acc[acc.length - 1].push(val);

    if (acc[acc.length - 1].length === 3) {
        acc[acc.length - 1].push(0);
    }

    return acc;
}, []);

console.log('num_triangles:', num_triangles);


let WORKGROUP_X = 8;
let WORKGROUP_Y = 8;
let WORKGROUP_Z = 2;

let THREADS_X = 8;
let THREADS_Y = 4;
let THREADS_Z = 4;

if (options.isMobile) {
    WORKGROUP_X = 1;
    WORKGROUP_Y = 1;
    WORKGROUP_Z = 1;

    THREADS_X = 1;
    THREADS_Y = 1;
    THREADS_Z = 1;

    url = '../models/monkey.glb';
}


const NUMTHREADS = WORKGROUP_X * WORKGROUP_Y * WORKGROUP_Z * THREADS_X * THREADS_Y * THREADS_Z;
const PARTICLESPERTRIANGLE = 1;
const NUMPARTICLES = num_triangles * PARTICLESPERTRIANGLE;
console.log('NUMTHREADS:', NUMTHREADS);
console.log('NUMPARTICLES:', NUMPARTICLES);

const renderPass = new RenderPass(vert, frag, compute, WORKGROUP_X, WORKGROUP_Y, WORKGROUP_Z);
renderPass.depthWriteEnabled = true;
renderPass.setMesh('base_mesh', positions, colors, colorSize, uvs, normals, indices)
// renderPass.setCube('instance_mesh', { x: 0, y: 0, z: 0 }, { width: .005, height: .005, depth: .005, }).instanceCount = NUMPARTICLES;
renderPass.setSphere('instance_mesh', { x: 0, y: 0, z: 0 }, { r: 0, g: 0, b: 0, a: 0 }, .01).instanceCount = NUMPARTICLES;

const triangle_indices = indices.reduce((acc, val, idx) => {
    if (idx % 3 === 0) acc.push([]);
    acc[acc.length - 1].push(val);
    return acc;
}, []);

const triangles = triangle_indices.map(ti => {
    const triangle = [vertex_data[ti[0]], vertex_data[ti[1]], vertex_data[ti[2]]];
    return triangle;
})

const base = {
    renderPasses: [
        renderPass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms, storages, constants } = points;
        points.import(structs);

        constants.WORKGROUP_X = WORKGROUP_X;
        constants.WORKGROUP_Y = WORKGROUP_Y;
        constants.WORKGROUP_Z = WORKGROUP_Z;
        constants.THREADS_X = THREADS_X;
        constants.THREADS_Y = THREADS_Y;
        constants.THREADS_Z = THREADS_Z;

        constants.NUMTRIANGLES = num_triangles;
        constants.PARTICLESPERTRIANGLE.setValue(PARTICLESPERTRIANGLE).setType('i32');

        storages.particles.setType(`array<Particle, ${NUMPARTICLES}>`);
        storages.vertex_data
            .setType(`array<vec4f, ${vertex_data.length}>`)
            .setValue(vertex_data.flat());

        storages.triangles
            .setType(`array<Triangle, ${triangles.length}>`)
            .setValue(triangles.flat(2));

        uniforms.visibility = options.visibility;

        folder.add(options, 'visibility').name('visibility')
            .onChange(value => uniforms.visibility = value);

        points.setCameraPerspective('camera');

        points.addEventListener('log', ([a, b, c, d]) => {
            console.log(a, b, c, d);
        })

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setCameraPerspective('camera', [0, 0, 5], [0, 0, -1000]);
    }
}

export default base;