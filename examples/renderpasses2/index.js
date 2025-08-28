import vert1 from './renderpass1/vert.js';
import frag1 from './renderpass1/frag.js';

import { RenderPass, RenderPasses } from 'points';

const renderpasses1 = {
    /**
     * Render Passes expect to have an order
     */
    renderPasses: [
        new RenderPass(vert1, frag1),
        // new RenderPass(yellow.vertexShader, yellow.fragmentShader),
        // RenderPasses.GRAYSCALE
    ],
    init: async points => {
        // await yellow.init(points, {blendAmount: .5});
        points.setSampler('imageSampler', null);
        // await points.setTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.setTextureImage('image', './../img/old_king_600x600.jpg');
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        points.setSampler('feedbackSampler');
        points.setTexture2d('feedbackTexture', true);


        points.addRenderPass(RenderPasses.GRAYSCALE);
        points.addRenderPass(RenderPasses.CHROMATIC_ABERRATION, { distance: .02 });
        points.addRenderPass(RenderPasses.COLOR, {color:[.5, 1, 0, 1], blendAmount: .5});
        points.addRenderPass(RenderPasses.PIXELATE, { pixelsWidth: 10, pixelsHeight: 10 });
        points.addRenderPass(RenderPasses.LENS_DISTORTION, { amount: .4, distance: .01 });
        // points.addRenderPass(RenderPasses.FILM_GRAIN);
        // points.addRenderPass(RenderPasses.BLOOM, { amount: .5 });
        // points.addRenderPass(RenderPasses.BLUR, { resolution: [100, 100], direction: [.4, 0], radians: 0 });
        // points.addRenderPass(RenderPasses.WAVES, { scale: .05, intensity: .03 });
    },
    update: points => {

    }
}

export default renderpasses1;