import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from 'points';

const options = {
    val: 0,
    bool: false,
}

const base = {
    vert,
    compute,
    frag,
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {

        // Add elements to dat gui
        // create an uniform and get value from options
        points.setUniform('val', options.val);

        // https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+add
        folder.add(options, 'val', -1, 1, .0001).name('Val');
        folder.add(options, 'bool').name('Bool');

        points.setSampler('imageSampler', null);
        await points.setTextureImage('image', './../img/pexels-ketut-subiyanto-4350315.jpg');

        // points.setTexture2d('pass0Texture', true, null, 0);
        points.setBindingTexture('writeTexture', 'readTexture');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setUniform('val', options.val);
    }
}

export default base;