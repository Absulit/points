import vert0 from './r0/vert.js';
import frag0 from './r0/frag.js';

import vert1 from './r1/vert.js';
import frag1 from './r1/frag.js';

import Points, { RenderPass } from 'points';

const options = { scale: 1, bloom: .133 }

const r0 = new RenderPass(vert0, frag0);
const r1 = new RenderPass(vert1, frag1);

const bloom1 = {
    renderPasses: [
        r0,
        r1
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const descriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
        }

        points.setSampler('imageSampler', descriptor);
        // await points.setTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.setTextureImage('image', './../img/old_king_600x600.jpg');
        // await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        points.setTexture2d('feedbackTexture0', true, GPUShaderStage.FRAGMENT, 0);

        points.setUniform('scale', options.scale);
        points.setUniform('bloom', options.bloom);
        folder.add(options, 'scale', 0, 1, .0001).name('scale');
        folder.add(options, 'bloom', -1, 1, .0001).name('bloom');
        folder.open();
    },
    update: points => {
        points.setUniform('scale', options.scale);
        points.setUniform('bloom', options.bloom);
    }
}

export default bloom1;
