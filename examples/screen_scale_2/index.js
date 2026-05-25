import vert0 from './r0/vert.js';
import frag0 from './r0/frag.js';
import vert1 from './r1/vert.js';
import frag1 from './r1/frag.js';
import Points, { LoadOp, RenderPass, ScaleMode } from 'points';

const options = {
    val: 0,
    bool: false,
    color1: '#FF0000', // CSS string
    color2: [0, 128, 255], // RGB array
    color3: [0, 128, 255, 0.3], // RGB with alpha
    color4: { h: 350, s: 0.9, v: 0.3 }, // Hue, saturation, value
    color5: { r: 115, g: 50.9, b: 20.3, a: .1 }, // r, g, b object
}

const r0 = new RenderPass(vert0, frag0);
const r1 = new RenderPass(vert1, frag1);
r1.loadOp = LoadOp.LOAD;
r1.setPlane('mesh', { x: 0, y: 0, z: 0 }, { width: 1, height: 1, depth: 0 });

const base = {
    renderPasses: [
        r0,
        r1
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms } = points;
        points.scaleMode = ScaleMode.COVER;

        points.setSampler('imageSampler', null);
        await points.setTextureImage('bgTexture', './../../img/angel_600x600.jpg');
        await points.setTextureImage('meshTexture', './../../img/house_512x512.jpg');

        uniforms.val = options.val;

        folder.add(options, 'val', -1, 1, .0001).name('Val');
        folder.add(options, 'bool').name('Bool');

        folder.addColor(options, 'color1');
        folder.addColor(options, 'color2');
        folder.addColor(options, 'color3');
        folder.addColor(options, 'color4');
        folder.addColor(options, 'color5');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        const { uniforms } = points;
        uniforms.val = options.val;
    }
}

export default base;