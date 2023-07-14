import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from './../../src/absulit.points.module.js';

const base = {
    vert,
    compute,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        points.addStorage('variables', 1, 'Variable', 4);

        points.addStorage('event', 1, 'array<f32>', 4096, true);
    },
    /**
     *
     * @param {Points} points
     */
    update: points => {

    },
    /**
     *
     * @param {Points} points
     */
    read: async points => {
        let event = await points.readStorage('event');
        // console.clear();
        // console.log(event);
        console.log(event[0], event[1], event[2]);
    }
}

export default base;