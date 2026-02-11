import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { ScaleMode } from 'points';

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
        points.scaleMode = ScaleMode.FIT;

        points.setUniform('val', options.val);

        folder.add(options, 'val', -1, 1, .0001).name('Val');

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