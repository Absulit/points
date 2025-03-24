import vert from './vert.js';
// import compute from './compute.js';
import frag0 from './frag0.js';
import frag1 from './frag1.js';
import Points from 'points';
import RenderPass from 'renderpass';

const options = {
    rotation: -.866,
    scale: .090,
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

        // Add elements to dat gui
        // create an uniform and get value from options
        points.setUniform('rotation', options.rotation);
        points.setUniform('scale', options.scale);

        // https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+add
        folder.add(options, 'rotation', -10, 10, .0001).name('rotation');
        folder.add(options, 'scale', 0, 1, .0001).name('scale');

        points.setSampler('imageSampler', null);
        points.setTexture2d('feedbackTexture', true);


        folder.open();
    },
    update: points => {
        points.setUniform('rotation', options.rotation);
        points.setUniform('scale', options.scale);
    }
}

export default base;