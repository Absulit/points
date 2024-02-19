import vert from './vert.js';
import frag from './frag.js';

const options = {
    scale: 1,
    depth: 1,
}

const dithering1 = {
    vert,
    frag,
    init: async (points, folder) => {
        let descriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
        }
        points.addSampler('feedbackSampler', descriptor);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');

        points.addUniform('scale', options.scale);
        points.addUniform('depth', options.depth);

        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.add(options, 'depth', -1, 1, .0001).name('Depth');
        folder.open();
    },
    update: points => {
        points.updateUniform('scale', options.scale);
        points.updateUniform('depth', options.depth);
    }
}

export default dithering1;