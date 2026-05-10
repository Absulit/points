import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { ScaleMode } from 'points';
import { structs } from './structs.js';

const options = {
    val: 0,
}

const base = {
    vert,
    compute,
    frag,
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms, storages } = points;
        points.scaleMode = ScaleMode.FIT;
        points.import(structs);

        // Add elements to dat gui
        // create an uniform and get value from options
        uniforms.val = options.val;

        // https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+add
        folder.add(options, 'val', -1, 1, .0001).name('Val');

        uniforms.rule1Distance = .1;
        uniforms.rule2Distance = .025;
        uniforms.rule3Distance = .025;
        uniforms.rule1Scale = .02;
        uniforms.rule2Scale = .05;
        uniforms.rule3Scale = .005;

        storages.particlesA.setType('array<Particle, 1024>');
        storages.particlesB.setType('array<Particle, 1024>');

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