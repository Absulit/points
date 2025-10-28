import vert from './vert.js';
import frag from './frag.js';
import Points from 'points';

const options = {
    scale: 1,
}

const imagetexture1 = {
    vert,
    frag,
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.setSampler('imageSampler', null);
        await points.setTextureWebcam('webcam');

        points.setUniform('scale', options.scale);

        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.open();
    },
    update: points => {
        points.setUniform('scale', options.scale);
    }
}

export default imagetexture1;