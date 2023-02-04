import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
const circleblur = {
    vert,
    compute,
    frag,
    init: async (points) => {
        points.addSampler('feedbackSampler');
        points.addTexture2d('feedbackTexture', true);
        points.addBindingTexture('outputTex', 'computeTexture');
    },
    update: (points) => {

    }
}

export default circleblur;