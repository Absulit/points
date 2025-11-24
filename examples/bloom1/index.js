import vert0 from './r0/vert.js';
import frag0 from './r0/frag.js';
import { RenderPass } from 'points';

const options = { scale: 1, bloom: .133 }

const r0 = new RenderPass(vert0, frag0)

const bloom1 = {
    renderPasses: [
        r0
    ],
    init: async (points, folder) => {
        const descriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
        }

        points.setSampler('imageSampler', descriptor);
        // await points.setTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.setTextureImage('image', './../img/old_king_600x600.jpg');
        // await points.setTextureImage('image', './../img/absulit_800x800.jpg');

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
