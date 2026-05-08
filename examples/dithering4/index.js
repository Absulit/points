import vert from './vert.js';
import frag from './frag.js';
import Points, { ScaleMode } from 'points';

const options = {
    scale: 1,
    distance: 1,
}

const dithering4 = {
    vert,
    frag,
    /**
     *
     * @param {Points} points
     * @param {*} folder
     */
    init: async (points, folder) => {
        const { uniforms } = points;
        points.scaleMode = ScaleMode.FIT;

        const descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
        }
        points.setSampler('feedbackSampler', descriptor);
        // await points.setTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.setTextureImage('image', './../img/old_king_600x600.jpg');
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');

        uniforms.scale = options.scale;
        uniforms.distance = options.distance;

        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.add(options, 'distance', 0, 1, .0001).name('Distance');
        folder.open();
    },
    update: points => {
        const { uniforms } = points;
        uniforms.scale = options.scale;
        uniforms.distance = options.distance;
    }
}

export default dithering4;