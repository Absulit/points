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
        let volume = 1;
        let loop = true;
        audio = points.setAudio(
            'audio',
            './../../audio/cognitive_dissonance.mp3',
            volume,
            loop,
            false
        );

        points.addEventListener('click_event', data => {
            audio.play();
        }, 4);


        points.setStorage('result', 'array<f32, 10>', 4);
        points.setSampler('imageSampler', null);
        points.setTexture2d('feedbackTexture', true);
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
