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
        points.addEventListener('left_blink', data => {
            console.log('---- Left Circle');
        }, 4);

        points.addEventListener(
            'right_blink', // name of the event (and name of a storage)
            data => { // data returned after the event and callback
                console.log('---- Right Circle');
            },
            4 // size of the data to return
        );
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
