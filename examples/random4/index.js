import vert from './vert.js';
import frag from './frag.js';
import Points from 'points';

const options = {
    sliderA: .291,
}

const random1 = {
    vert,
    frag,
    /**
     *
     * @param {Points} points
     * @param {*} folder
     */
    init: async (points, folder) => {
        const { uniforms } = points;
        const descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            //maxAnisotropy: 10,
        }


        uniforms.randPosition = [0, 0];
        points.setSampler('imageSampler', descriptor);
        // points.setBindingTexture('outputTex', 'computeTexture');

        // uniforms.sliderA = options.sliderA;
        // folder.add(options, 'sliderA', 0, 1, .0001).name('sliderA');
        // folder.open();


        /**
         * penguin sprite by tamashihoshi
         * https://opengameart.org/users/tamashihoshi
         */
        await points.setTextureImage(
            'penguin',
            './../img/lr_penguin2_tamashihoshi_32x32.png'
        );

        points.setTexture2d('feedbackTexture', true);


    },
    update: points => {
        const {uniforms} = points;
        uniforms.randPosition = [Math.random(), Math.random()];
        // uniforms.sliderA = options.sliderA;
    }
}

export default random1;