import vert from './vert.js';
import compute0 from './r0/compute.js';
import frag0 from './r0/frag.js';
import Points, { RenderPass } from 'points';

const options = {
    val: 0,
    bool: false,
}

const WORKGROUP_X = 800;
const WORKGROUP_Y = 800;

const THREADS = 4;

const numParticles = WORKGROUP_X * WORKGROUP_Y * THREADS;


const base = {
    renderPasses: [
        new RenderPass(vert, frag0, compute0, WORKGROUP_X, WORKGROUP_Y, 1)
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.setStorage('variables', 'Variables');
        points.setStorage('particles', `array<Particle, ${numParticles}>`);
        points.setUniform('numParticles', numParticles);

        points.setSampler('imageSampler', null);
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');

        points.setBindingTexture('writeTexture', 'readTexture');

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