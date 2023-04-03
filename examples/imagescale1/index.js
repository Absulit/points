import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
const imagescale1 = {
    vert,
    compute,
    frag,
    init: async points => {
        points.addSampler('feedbackSampler', null);
        await points.addTextureImage('image1', './../img/gratia_800x800.jpg');
        await points.addTextureImage('image2', './../img/old_king_600x600.jpg');
        await points.addTextureImage('image3', './../img/unnamed_horror_100x100.png');
    },
    update: points => {

    }
}

export default imagescale1;