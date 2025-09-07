import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from 'points';

const options = {
    enabled: true,
    mass: 1,
    innerRadius: 1.,
    outerRadius: 2.3,
    mouseY: -.395,
    roDistance: -3,

}

const colors = [
    248,208,146, 0,
    21, 144, 151, 0,
    56, 164, 140, 0,
    26, 86, 120, 0,
    37, 36, 93, 0,
    87, 28, 86, 0,
].map(i => i / 255);

const base = {
    vert,
    compute,
    frag,
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {

        points.setStorageMap('colors', colors, 'array<vec3f, 6>');

        points.setUniform('enabled', options.enabled);
        points.setUniform('mass', options.mass);
        points.setUniform('innerRadius', options.innerRadius);
        points.setUniform('outerRadius', options.outerRadius);
        points.setUniform('mouseY', options.mouseY);
        points.setUniform('roDistance', options.roDistance);

        folder.add(options, 'enabled').name('enable');
        folder.add(options, 'mass', 1, 10, .0001).name('mass');
        folder.add(options, 'innerRadius', .1, 10, .0001).name('innerRadius');
        folder.add(options, 'outerRadius', .1, 10, .0001).name('outerRadius');
        folder.add(options, 'mouseY', -1, 1, .0001).name('mouseY');
        folder.add(options, 'roDistance', -10, 1, .0001).name('roDistance');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setUniform('enabled', options.enabled);
        points.setUniform('mass', options.mass);
        points.setUniform('innerRadius', options.innerRadius);
        points.setUniform('outerRadius', options.outerRadius);
        points.setUniform('mouseY', options.mouseY);
        points.setUniform('roDistance', options.roDistance);
    }
}

export default base;