import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from 'points';

const options = {
    val: 0,
    bool: false,
    color1: '#FF0000', // CSS string
    color2: [0, 128, 255], // RGB array
    color3: [0, 128, 255, 0.3], // RGB with alpha
    color4: { h: 350, s: 0.9, v: 0.3 }, // Hue, saturation, value
    color5: { r: 115, g: 50.9, b: 20.3, a: .1 }, // r, g, b object
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
        points.setTexture2d('inputTex', true);
        // points.setBindingTexture('outputTex', 'computeTexture');

        await points.setTextureImage('startTexture', './../img/absulit_800x800.jpg');
        // await points.setTextureImage('startTexture', './../img/carmen_lyra_800x800.jpg');

        points.setStorage('variables', 'Variables');

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