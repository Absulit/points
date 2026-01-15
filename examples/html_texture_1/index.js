import vert from './vert.js';
import frag from './frag.js';
import Points from 'points';
const demo6 = {
    vert,
    frag,
    /**
     * @param {Points} points
     */
    init: async points => {

        const testEl = document.getElementById('test');
        console.log(testEl);


        await points.setTextureElement('image', testEl);
        points.setSampler('imageSampler', null);

    },
    update: points => {

    }
}





export default demo6;