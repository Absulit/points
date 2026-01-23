import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { RenderPass } from 'points';

const options = {
    val: .125 * .5 * .5 * .5 * .5 * .5,
}


let WORKGROUP_X = 512;
let WORKGROUP_Y = 512;
let WORKGROUP_Z = 1;

let THREADS_X = 16;
let THREADS_Y = 16;
let THREADS_Z = 1;

const NUMPARTICLES = WORKGROUP_X * WORKGROUP_Y * WORKGROUP_Z * THREADS_X * THREADS_Y * THREADS_Z;
console.log('NUMPARTICLES: ', NUMPARTICLES);

const TEXTURE_WIDTH = WORKGROUP_X * THREADS_X;
const TEXTURE_HEIGHT = WORKGROUP_Y * THREADS_Y;

const r0 = new RenderPass(vert, frag, compute, WORKGROUP_X, WORKGROUP_Y, WORKGROUP_Z);

const base = {
    renderPasses: [
        r0
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

        points.setConstant('TEXTURE_WIDTH', TEXTURE_WIDTH, 'f32');
        points.setConstant('TEXTURE_HEIGHT', TEXTURE_HEIGHT, 'f32');


        const descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            //maxAnisotropy: 10,
        }
        points.setSampler('imageSampler', descriptor);
        points.setBindingTexture('writeTexture', 'readTexture', null, null, [TEXTURE_WIDTH, TEXTURE_HEIGHT]);

        points.setUniform('val', options.val);
        folder.add(options, 'val', 0, 1, .0001).name('Val');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setUniform('val', options.val);
    }
}

export default base;