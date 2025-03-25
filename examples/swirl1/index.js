import vert from './vert.js';
import frag0 from './frag.js';
import Points from 'points';
import RenderPass from 'renderpass';

const options = {
    rotation: -.866,
    scale: .090,
    displace: false,
}

const base = {
    renderPasses: [
        new RenderPass(vert, frag0),
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
        points.setUniform('displace', options.displace);

        // https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+add
        folder.add(options, 'rotation', -10, 10, .0001).name('rotation');
        folder.add(options, 'scale', 0, 1, .0001).name('scale');
        folder.add(options, 'displace').name('displace');

        points.setStorage('variables', 'Variables');
        points.setStorage('colors', 'array<vec3f, 6>');

        folder.open();
    },
    update: points => {
        points.setUniform('rotation', options.rotation);
        points.setUniform('scale', options.scale);
        points.setUniform('displace', options.displace);
    }
}

export default base;