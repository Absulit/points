import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from 'points';

const options = {
    mass: 100,
    radius: .1,
}

const base = {
    vert,
    compute,
    frag,
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {

        points.setUniform('mass', options.mass);
        points.setUniform('radius', options.radius);

        folder.add(options, 'mass', 0, 1000, .0001).name('mass');
        folder.add(options, 'radius', 0, 2, .0001).name('radius');

        await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        points.setSampler('imageSampler', null);


        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setUniform('mass', options.mass);
        points.setUniform('radius', options.radius);
    }
}

export default base;