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
        audio = points.setAudio(
            'audio',
            './../audio/cognitive_dissonance.mp3',
            volume,
            loop,
            false
        );
        points.addEventListener('click_event', data => {
            audio.play();
        }, 4);

        points.setStorage('showMessage', 'f32', false, GPUShaderStage.FRAGMENT);

        const size = { x: 8, y: 22 };
        await points.setTextureString(
            'cta',
            'Click to Play',
            './../img/inconsolata_regular_8x22.png',
            size,
            -32
        );

        const descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            //maxAnisotropy: 10,
        }

        points.setSampler('imageSampler', descriptor);
    },
    /**
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