import vert1 from './renderpass1/vert.js';
import frag1 from './renderpass1/frag.js';

import vert2 from './renderpass2/vert.js';
import frag2 from './renderpass2/frag.js';

import { RenderPass } from 'points';

const options = {
    rotation: .8,
}

const renderpasses1 = {
    /**
     * Render Passes expect to have an order
     */
    renderPasses: [
        new RenderPass(vert1, frag1),
        new RenderPass(vert2, frag2),
    ],
    init: async (points, folder) => {
        points.setSampler('imageSampler', null);
        // await points.setTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.setTextureImage('image', './../img/old_king_600x600.jpg');
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        points.setSampler('feedbackSampler', null);
        points.setTexture2d('feedbackTexture', true, 0);

        points.setUniform('rotation', options.rotation, 'f32');
        folder.add(options, 'rotation', 0, 1, .0001).name('Rotation');
        folder.open();
    },
    update: points => {
        points.setUniform('rotation', options.rotation);
    }
}

export default renderpasses1;