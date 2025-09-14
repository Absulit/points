import vert from './vert.js';
import compute0 from './compute.js';
import frag1 from './frag.js';
import Points, { RenderPass } from 'points';

const options = {
    maxLife: 34,
    turbulenceScale: 100,
    useVideo: false,
}



const base = {
    renderPasses: [
        new RenderPass(vert, frag1, compute0, 8, 8, 1),
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.setConstant('NUMPARTICLES', 4, 'u32');
        points.setStorage('particles', `array<Particle, 4>`);

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