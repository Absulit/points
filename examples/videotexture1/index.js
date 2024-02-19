/**
 * video: Big Beak Bird on a Tree Branch // Costa Rica
 * author: https://www.pexels.com/@shubh-haque-3142953/
 * https://www.pexels.com/video/big-beak-bird-on-a-tree-branch-4746616/
 */

const options = {
    scale: .180,
}

import vert from './vert.js';
import frag from './frag.js';
const videotexture1 = {
    vert,
    frag,
    init: async (points, folder) => {
        points.addSampler('feedbackSampler', null);
        await points.addTextureVideo('video', './../img/pexels-shubh-haque-4746616-960x540-30fps.mp4');

        points.addUniform('scale', options.scale, 'f32');

        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.open();
    },
    update: points => {
        points.updateUniform('scale', options.scale);
    }
}

export default videotexture1;