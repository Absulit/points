import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import { ShaderType } from '../../src/absulit.points.module.js';
const imagescale1 = {
    vert,
    compute,
    frag,
    init: async (points) => {
        points.addSampler('feedbackSampler', null, ShaderType.FRAGMENT);
        await points.addTextureImage('image1', './../img/gratia_800x800.jpg', ShaderType.FRAGMENT);
        await points.addTextureImage('image2', './../img/old_king_600x600.jpg', ShaderType.FRAGMENT);
        await points.addTextureImage('image3', './../img/unnamed_horror_100x100.png', ShaderType.FRAGMENT);
    },
    update: (points) => {

    }
}

export default imagescale1;