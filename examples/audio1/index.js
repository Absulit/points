import vert from './vert.js';
import frag from './frag.js';
import Points from 'points';

let audio = null;

const base = {
    vert,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        const volume = 1;
        const loop = true;
        // audio = points.setAudio('audio', './../../audio/generative_audio_test.ogg', volume, loop);
        audio = points.setAudio('audio', './../../audio/cognitive_dissonance.mp3', volume, loop, false);
        points.addEventListener('click_event', data => {
            audio.play();
        }, 4);
        // points.setAudio('audio', 'https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg', volume, loop);
        points.setStorage('result', 'f32');
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