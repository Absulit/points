import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from './../../src/absulit.points.module.js';

const base = {
    vert,
    compute,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        let volume = 1.;
        let loop = false;
        points.addAudio('audio', './../../audio/generative_audio_test.ogg', volume, loop);
    },
    update: points => {

    }
}

export default base;