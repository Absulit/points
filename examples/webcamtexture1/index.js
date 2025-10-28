import vert from './vert.js';
import frag from './frag.js';
import Points from 'points';
import { isMobile } from 'utils';


const options = {
    scale: 1,
    isMobile: false,
    flip: false,
}

const imagetexture1 = {
    vert,
    frag,
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        options.isMobile = isMobile();
        points.setUniform('isMobile', options.isMobile);

        const size = { width: 1080, height: 1080 }
        if (options.isMobile) {
            size.width = 100;
            size.height = 100;
        }

        points.setSampler('imageSampler', null);
        await points.setTextureWebcam('webcam');

        points.setUniform('scale', options.scale);
        folder.add(options, 'scale', 0, 1, .0001).name('Scale');

        points.setUniform('flip', options.flip);
        folder.add(options, 'flip').name('flip');

        folder.open();
    },
    update: points => {
        points.setUniform('scale', options.scale);
        points.setUniform('flip', options.flip);
        points.setUniform('isMobile', options.isMobile);
    }
}

export default imagetexture1;