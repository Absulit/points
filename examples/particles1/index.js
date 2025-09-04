import vert from './vert.js';
import compute0 from './r0/compute.js';
import compute1 from './r1/compute.js';
import frag1 from './r1/frag.js';
import Points, { RenderPass } from 'points';

const options = {
    val: 0,
    bool: false,
}

const WORKGROUP_X = 4096;
const WORKGROUP_Y = 1;

const THREADS = 256;

const numParticles = WORKGROUP_X * WORKGROUP_Y * THREADS;

console.log(numParticles);


const base = {
    renderPasses: [
        new RenderPass(vert, null, compute0, WORKGROUP_X, WORKGROUP_Y, 1),
        new RenderPass(vert, frag1, compute1, 50, 50, 1)
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.setStorage('particles', `array<Particle, ${numParticles}>`);
        points.setConstant('NUMPARTICLES', numParticles, 'u32');

        points.setSampler('imageSampler', null);
        await points.setTextureImage('image', './../img/webgpu_800x800.png');

        points.setBindingTexture('writeTexture', 'readTexture');

        points.setTexture2d('pass0Texture', true, null, 0);

        points.addEventListener('log', data => {
            const [a, b, c, d] = data;
            // console.clear();
            console.log({ a, c }, { b, d });
        }, 4);


        folder.add(options, 'val', -1, 1, .0001).name('Val');
        folder.add(options, 'bool').name('Bool');
        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        // points.setUniform('val', options.val);
    }
}

export default base;