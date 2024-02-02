import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from 'points';

let audio = null;

const base = {
    vert,
    compute,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        let volume = 1;
        let loop = true;
        // audio = points.addAudio('audio', './../../audio/generative_audio_test.ogg', volume, loop);
        audio = points.addAudio('audio', './../../audio/cognitive_dissonance.mp3', volume, loop, false);
        points.addEventListener('click_event', data => {
            audio.play();
        }, 4);
        // points.addAudio('audio', 'https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg', volume, loop);
        points.addStorage('result', 'f32');
    },
    /**
     *
     * @param {Points} points
     */
    update: points => {
    },

    remove: _ => {
        audio.pause();
        audio.remove();
    }
}

export default base;