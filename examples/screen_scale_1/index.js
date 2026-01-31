import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points, { ScaleMode } from 'points';

const dropdown = {
    'FIT': ScaleMode.FIT,
    'COVER': ScaleMode.COVER,
    'WIDTH': ScaleMode.WIDTH,
    'HEIGHT': ScaleMode.HEIGHT
};

const base = {
    vert,
    compute,
    frag,
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.scaleMode = ScaleMode.FIT;

        folder.add({ default: ScaleMode.HEIGHT }, 'default', dropdown)
            .onChange(value => points.scaleMode = value)
            .name('ScaleMode');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
    }
}

export default base;