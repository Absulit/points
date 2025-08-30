import vert1 from './renderpass1/vert.js';
import frag1 from './renderpass1/frag.js';

import { RenderPass, RenderPasses } from 'points';

const renderpasses1 = {
    /**
     * Render Passes expect to have an order
     */
    renderPasses: [
        new RenderPass(vert1, frag1),
        // RenderPasses.GRAYSCALE,
        // RenderPasses.CHROMATIC_ABERRATION,
        // RenderPasses.COLOR,
        // RenderPasses.PIXELATE,
        // RenderPasses.LENS_DISTORTION,
        // RenderPasses.FILM_GRAIN,
        // RenderPasses.BLOOM,
        // RenderPasses.BLUR,
        // RenderPasses.WAVES,
    ],
    init: async points => {
        points.setSampler('imageSampler', null);
        // await points.setTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.setTextureImage('image', './../img/old_king_600x600.jpg');
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');

        points.addRenderPass(RenderPasses.GRAYSCALE);
        points.addRenderPass(RenderPasses.CHROMATIC_ABERRATION, { distance: .02 });
        points.addRenderPass(RenderPasses.COLOR, { color: [.5, 1, 0, 1], blendAmount: .5 });
        points.addRenderPass(RenderPasses.PIXELATE);
        points.addRenderPass(RenderPasses.LENS_DISTORTION);
        points.addRenderPass(RenderPasses.FILM_GRAIN);
        points.addRenderPass(RenderPasses.BLOOM);
        points.addRenderPass(RenderPasses.BLUR, { resolution: [100, 100], direction: [.4, 0], radians: 0 });
        points.addRenderPass(RenderPasses.WAVES, { scale: .05 });
    },
    update: points => {

    }
}

export default renderpasses1;
