import vert from './vert.js';
import frag from './frag.js';
import Points from 'points';

let container = null;

const demo6 = {
    vert,
    frag,
    /**
     * @param {Points} points
     */
    init: async points => {
        // <div id="test-container">
        //     <div id="test">
        //         test
        //     </div>
        // </div>


        const content = document.getElementsByClassName('content column right')[0]

        container = document.createElement('div');
        container.id = 'test-container';

        const pointsEl = document.createElement('div');
        pointsEl.id = 'test';
        pointsEl.textContent = 'POINTS';

        container.appendChild(pointsEl);
        content.appendChild(container)
        console.log(pointsEl);

        await points.setTextureElement('image', pointsEl);
        points.setSampler('imageSampler', null);

    },
    update: points => {

    },
    remove: () => {
        container.remove();
    }
}





export default demo6;    // only the color from each vertex
