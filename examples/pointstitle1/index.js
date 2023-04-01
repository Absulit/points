import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';

const pointstitle1 = {
    vert,
    compute,
    frag,
    init: async points => {

        await points.addTextureImage('image', './../../img/gratia_800x800.jpg');
        await points.addTextureImage('font', './../img/inconsolata_regular_8x22.png');

        points.addSampler('imageSampler', null);

    },
    update: points => {

    }
}

export default pointstitle1;