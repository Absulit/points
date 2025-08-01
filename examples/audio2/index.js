import vert from './vert.js';
import frag from './frag.js';
import Points from 'points';

let audio = null;

const base = {
    vert,
    compute: null,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        let volume = 1;
        let loop = true;
        // let audio = points.setAudio('audio', './../../audio/generative_audio_test.ogg', volume, loop);
        audio = points.setAudio('audio', './../../audio/cognitive_dissonance.mp3', volume, loop, false);
        // audio = points.setAudio('audio', 'https://mdn.github.io/voice-change-o-matic/audio/concert-crowd.ogg', volume, loop);

        points.addEventListener('click_event', data => {
            audio.play();
        }, 4);


        points.setStorage('result', 'array<f32, 10>', 4);

        // RenderPasses.filmgrain(points);
        // RenderPasses.bloom(points, .1);
        // RenderPasses.lensDistortion(points, .5, .01);
        // RenderPasses.blur(points, 100, 100, .1,0);

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