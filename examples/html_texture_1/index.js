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


        const content = document.getElementsByClassName('content column right')[0];

        container = document.createElement('div');
        container.id = 'test-container';

        const pointsEl = document.createElement('div');
        pointsEl.classList.add('test');
        pointsEl.textContent = 'POINTS';

        const webgpuEl = pointsEl.cloneNode();
        webgpuEl.textContent = 'WebGPU';

        container.appendChild(pointsEl);
        container.appendChild(webgpuEl);

        content.appendChild(container);


        points.setSampler('imageSampler', null);



        await points.setTextureElement('pointsImage', pointsEl);
        await points.setTextureElement('webgpuImage', webgpuEl);

    },
    update: points => {

    },
    remove: () => {
        container.remove();
    }
}





export default demo6;    // only the color from each vertex
