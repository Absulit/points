import vert from './vert.js';
import frag0 from './frag.js';
import Points, { ScaleMode } from 'points';
import { RenderPass } from 'points';
import { structs } from './structs.js';

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
        const { uniforms, storages } = points;
        const { FRAGMENT } = GPUShaderStage;
        points.scaleMode = ScaleMode.FIT;
        points.import(structs);

        // Add elements to dat gui
        // create an uniform and get value from options
        uniforms.rotation = options.rotation;
        uniforms.scale = options.scale;
        uniforms.displace = options.displace;

        // https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+add
        folder.add(options, 'rotation', -10, 10, .0001).name('rotation');
        folder.add(options, 'scale', 0, 1, .0001).name('scale');
        folder.add(options, 'displace').name('displace');

        storages.variables.setType('Variables').setShaderStage(FRAGMENT);
        storages.colors.setType('array<vec3f, 6>').setShaderStage(FRAGMENT);

        folder.open();
    },
    update: points => {
        const { uniforms } = points;
        uniforms.rotation = options.rotation;
        uniforms.scale = options.scale;
        uniforms.displace = options.displace;
    }
}

export default base;