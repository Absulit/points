import vert from './vert.js';
import compute0 from './r0/compute.js';
import compute1 from './r1/compute.js';
import frag1 from './r1/frag.js';
import Points, { RenderPass } from 'points';

const options = {
    maxLife: 34,
    turbulenceScale: 100,
    useVideo: false,
}

const WORKGROUP_X = 1;
const WORKGROUP_Y = 1;

const THREADS = 4;

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
        // await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        await points.setTextureVideo('video', './../img/6982698-hd_1440_1080_25fps_800x800.mp4');

        points.setBindingTexture('writeTexture', 'readTexture');

        points.setTexture2d('pass0Texture', true, null, 0);

        points.addEventListener('log', data => {
            const [a, b, c, d] = data;
            // console.clear();
            console.log({ a, c }, { b, d });
        }, 4);


        points.setUniform('maxLife', options.maxLife);
        folder.add(options, 'maxLife', 1, 600, .0001).name('maxLife');

        points.setUniform('turbulenceScale', options.turbulenceScale);
        folder.add(options, 'turbulenceScale', 10, 1024, .0001).name('turbulenceScale');

        points.setUniform('useVideo', false);
        folder.add(options, 'useVideo').name('useVideo');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setUniform('useVideo', options.useVideo);
        points.setUniform('maxLife', options.maxLife);
        points.setUniform('turbulenceScale', options.turbulenceScale);
    }
}

export default base;