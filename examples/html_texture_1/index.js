import vert from './vert.js';
import frag from './frag.js';
import Points, { ScaleMode } from 'points';

let container = null;

const demo6 = {
    vert,
    frag,
    /**
     * @param {Points} points
     */
    init: async points => {

        points.scaleMode = ScaleMode.FIT;

        // <div id="test-container">
        //     <div id="test">
        //         test
        //     </div>
        // </div>

        // <div id="form_element">
        //     <label for="name">Name:</label> <input id="name" type="text">
        // </div>


        const content = document.getElementsByClassName('content column right')[0];

        container = document.createElement('div');
        container.id = 'test-container';

        const pointsEl = document.createElement('div');
        pointsEl.classList.add('test');
        pointsEl.textContent = 'POINTS';

        const formEl = document.createElement('div');
        formEl.innerHTML = '<label for="name">Name:</label> <input id="name" type="text">';

        container.appendChild(pointsEl);
        container.appendChild(formEl);
        content.appendChild(container);


        points.setSampler('imageSampler', null);


        const form_element = document.getElementById('form_element');

        await points.setTextureElement('image', formEl);

    },
    update: points => {

    },
    remove: () => {
        container.remove();
    }
}





export default demo6;    // only the color from each vertex
