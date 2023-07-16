import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from '../../src/absulit.points.module.js';

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

        // points.addStorage('event', 1, 'array<f32>', 4, true);

        points.addEventListener('click', data => {
            console.log(data[0], data[1]);
        }, 4);

        points.addEventListener('left_blink', data => {
            console.log('---- Left Circle');
        }, 4);
        points.addEventListener('right_blink', data => {
            console.log('---- Right Circle');
        }, 4);
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
        // let event = await points.readStorage('event');
        // console.clear();
        // console.log(event);
        // console.log(event[0], event[1], event[2]);
    }
}

export default base;
