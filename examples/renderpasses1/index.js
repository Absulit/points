import vert1 from './renderpass1/vert.js';
import frag1 from './renderpass1/frag.js';

import vert2 from './renderpass2/vert.js';
import frag2 from './renderpass2/frag.js';

import RenderPass from '../../src/RenderPass.js';

const renderpasses1 = {
    /**
     * Render Passes expect to have an order
     */
    renderPasses: [
        new RenderPass(vert1, frag1),
        new RenderPass(vert2, frag2),
    ],
    init: async points => {
        points.addSampler('imageSampler', null);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');
        points.addSampler('feedbackSampler', null);
        points.addTexture2d('feedbackTexture', true);
    },
    update: points => {

    }
}

export default renderpasses1;