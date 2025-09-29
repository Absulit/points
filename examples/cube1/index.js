import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { RenderPass, RenderPasses } from 'points';

const options = {
    val: 0,
    bool: false,
    color1: '#FF0000', // CSS string
    color2: [0, 128, 255], // RGB array
    color3: [0, 128, 255, 0.3], // RGB with alpha
    color4: { h: 350, s: 0.9, v: 0.3 }, // Hue, saturation, value
    color5: { r: 115, g: 50.9, b: 20.3, a: .1 }, // r, g, b object
}

const renderPass = new RenderPass(vert, frag, compute);

const base = {
    renderPasses: [
        renderPass
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {

        renderPass.addCube(
            { x: 0, y: 0, z: 0 },
            { width: 1, height: 1, depth: 1 },
            { r: 1, g: 0, b: 0, a: 1 }
        );

        const near = 0.1, far = 100;
        const f = 1.0 / Math.tan(Math.PI / 8); // ≈ 2.414
        const aspect = canvas.width / canvas.height;
        const nf = 1 / (near - far);

        points.setUniform(
            'projection',
            [
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, (2 * far * near) * nf, 0
            ],
            'mat4x4<f32>'
        )

        // camera at [0, 0, 5], looking at origin
        points.setUniform(
            'view',
            [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, -5, 1
            ],
            'mat4x4<f32>'
        )

        // points.addRenderPass(RenderPasses.PIXELATE);

        // Add elements to dat gui
        // create an uniform and get value from options
        points.setUniform('val', options.val);

        // https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+add
        folder.add(options, 'val', -1, 1, .0001).name('Val');
        folder.add(options, 'bool').name('Bool');

        // https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+addColor
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
        points.setUniform('val', options.val);
    }
}

export default base;