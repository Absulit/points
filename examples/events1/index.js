import vert from './vert.js';
import frag from './frag.js';
import Points from 'points';
import OutputLog from './components/output-log.js';

let output = null;

const base = {
    vert,
    frag,
    /**
     * @param {Points} points
     */
    init: async points => {
        output = new OutputLog()
        const content = document.body.querySelector('.content.column.right');
        content.appendChild(output);

        points.addEventListener('left_blink', data => {
            console.log('---- Left Circle', data);
            const [a, b] = data;
            output.text += `\nLeft: ${a} ${b}`;
        }, 2);

        points.addEventListener(
            'right_blink', // name of the event (and name of a storage)
            data => { // data returned after the event and callback
                console.log('---- Right Circle', data);
                const [a, b, c, d] = data;
                output.text += `\nRight: ${a} ${b} ${c} ${d}`;
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
    },
    remove: _ => {
        output?.remove();
        output = null;
    }
}

export default base;
