import vert from './vert.js';
import frag from './frag.js';
import Points, { ScaleMode } from 'points';

const options = {
    scale: 1,
}

const imagetexture1 = {
    vert,
    frag,
    /**
     *
     * @param {Points} points
     * @param {*} folder
     */
    init: async (points, folder) => {
        points.scaleMode = ScaleMode.FIT;
        points.setSampler('feedbackSampler', null);
        // await points.setTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.setTextureImage('image', './../img/old_king_600x600.jpg');
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');

        points.setUniform('scale', options.scale);

        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.open();
    },
    update: points => {
        points.setUniform('scale', options.scale);
    }
}

export default imagetexture1;