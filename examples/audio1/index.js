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
        let volume = 1;
        let loop = true;
        // let audio = points.addAudio('audio', './../../audio/generative_audio_test.ogg', volume, loop);
        let audio = points.addAudio('audio', './../../audio/cognitive_dissonance.mp3', volume, loop, false);
        points.addEventListener('click_event', data => {
            console.log(audio);
            audio.play();
        }, 2);
        // points.addAudio('audio', 'https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg', volume, loop);
        points.addStorage('result', 10, 'f32', 1);
    },
    /**
     *
     * @param {Points} points
     */
    update: points => {
    }
}

export default base;