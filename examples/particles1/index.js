import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { RenderPass } from 'points';

const options = {
    val: 0,
    bool: false,
    color1: '#FF0000', // CSS string
    color2: [0, 128, 255], // RGB array
    color3: [0, 128, 255, 0.3], // RGB with alpha
    color4: { h: 350, s: 0.9, v: 0.3 }, // Hue, saturation, value
    color5: { r: 115, g: 50.9, b: 20.3, a: .1 }, // r, g, b object
}

const WORKGROUP_X = 800;
const WORKGROUP_Y = 800;

const numParticles = WORKGROUP_X * WORKGROUP_Y;


const base = {
    renderPasses: [
        new RenderPass(vert, frag, compute, WORKGROUP_X, WORKGROUP_Y, 1)
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