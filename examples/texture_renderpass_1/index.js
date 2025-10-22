import Points from 'points';
import { RenderPass } from 'points';
import vert0 from './r0/vert.js';
import frag0 from './r0/frag.js';
import vert1 from './r1/vert.js';
import frag1 from './r1/frag.js';

import vert2 from './r2/vert.js';
import frag2 from './r2/frag.js';

import vert3 from './r3/vert.js';
import frag3 from './r3/frag.js';

import vert4 from './r4/vert.js';
import frag4 from './r4/frag.js';

import vert5 from './r5/vert.js';
import frag5 from './r5/frag.js';

import vertFinal from './rfinal/vert.js';
import fragFinal from './rfinal/frag.js';

const options = {
    sliderA: 0.619,
    sliderB: 0.861,
    sliderC: 0.508,
}

const base = {

    renderPasses: [
        new RenderPass(vert0, frag0),
        // new RenderPass(vert4, frag4), // filmgrain
        new RenderPass(vert2, frag2), // lens distortion
        new RenderPass(vert1, frag1), // black and white
        new RenderPass(vert5, frag5), // bloom
        new RenderPass(vert3, frag3), // chromatic aberration
        new RenderPass(vertFinal, fragFinal),
    ],
    /**
     *
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.setUniform('sliderA', options.sliderA);
        points.setUniform('sliderB', options.sliderB);
        points.setUniform('sliderC', options.sliderC);
        folder.add(options, 'sliderA', -1, 1, .0001).name('sliderA');
        folder.add(options, 'sliderB', -1, 1, .0001).name('sliderB');
        folder.add(options, 'sliderC', -1, 1, .0001).name('sliderC');
        folder.open();

        points.setSampler('imageSampler', null);
        await points.setTextureVideo('image', './../img/6982698-hd_1440_1080_25fps_800x800.mp4');
        await points.setTextureImage('text', './../../img/inconsolata_regular_8x22.png');

        points.setTexture2d('feedbackTexture', true);
        points.setTexture2d('feedbackTexture1', true, null, 1);
        points.setTexture2d('feedbackTexture2', true, null, 2);
        points.setTexture2d('feedbackTexture3', true, null, 3);
        points.setTexture2d('feedbackTexture4', true, null, 4);


        // RenderPasses.chromaticAberration(points, .01);
        // RenderPasses.filmgrain(points);
        // RenderPasses.lensDistortion(points, .8, .05);
        // RenderPasses.bloom(points, .9);
    },
    update: points => {
        points.setUniform('sliderA', options.sliderA);
        points.setUniform('sliderB', options.sliderB);
        points.setUniform('sliderC', options.sliderC);
    }
}

export default base;