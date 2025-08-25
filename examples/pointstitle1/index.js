import vert from './vert.js';
import frag from './frag.js';
import Points from 'points';

const pointstitle1 = {
    vert,
    frag,
    /**
     * @param {Points} points
     */
    init: async points => {

        await points.setTextureImage(
            'font',
            './../img/inconsolata_regular_8x22.png'
        );

        points.setSampler('imageSampler', null);

    },
    update: points => {

    }
}

export default pointstitle1;
