import vert from './vert.js';
import frag from './frag.js';

const options = {
    scale: 1,
    distance: 1,
}

const dithering4 = {
    vert,
    frag,
    init: async (points, folder) => {
        let descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
        }
        points.addSampler('feedbackSampler', descriptor);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');

        points.addUniform('scale', options.scale);
        points.addUniform('distance', options.distance);

        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.add(options, 'distance', 0, 1, .0001).name('Distance');
        folder.open();
    },
    update: points => {
        points.updateUniform('scale', options.scale);
        points.updateUniform('distance', options.distance);
    }
}

export default dithering4;