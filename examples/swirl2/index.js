import vert from './vert.js';
import frag0 from './frag0.js';
import frag1 from './frag1.js';
import Points, { ScaleMode } from 'points';
import { RenderPass } from 'points';

const options = {
    rotation: -.866,
    scale: .090,
    displace: false,

    sliderA: 0.619,
    sliderB: 0.861,
    sliderC: 0.508,
}

const base = {
    renderPasses: [
        new RenderPass(vert, frag0),
        new RenderPass(vert, frag1),
    ],
    /**
     *
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms } = points;
        points.scaleMode = ScaleMode.FIT;
        // Add elements to dat gui
        // create an uniform and get value from options
        uniforms.rotation = options.rotation;
        uniforms.scale = options.scale;
        uniforms.displace = options.displace;

        // https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+add
        folder.add(options, 'rotation', -10, 10, .0001).name('rotation');
        folder.add(options, 'scale', 0, 1, .0001).name('scale');
        folder.add(options, 'displace').name('displace');

        uniforms.sliderA = options.sliderA;
        uniforms.sliderB = options.sliderB;
        uniforms.sliderC = options.sliderC;
        folder.add(options, 'sliderA', -1, 1, .0001).name('sliderA');
        folder.add(options, 'sliderB', -1, 1, .0001).name('sliderB');
        folder.add(options, 'sliderC', -1, 1, .0001).name('sliderC');

        const descriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
        }

        points.setSampler('imageSampler', descriptor);
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');

        points.setTexture2d('feedbackTexture', true);


        folder.open();
    },
    update: points => {
        const { uniforms } = points;
        uniforms.rotation = options.rotation;
        uniforms.scale = options.scale;
        uniforms.displace = options.displace;
        uniforms.sliderA = options.sliderA;
        uniforms.sliderB = options.sliderB;
        uniforms.sliderC = options.sliderC;
    }
}

export default base;