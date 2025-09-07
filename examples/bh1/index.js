import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from 'points';

const options = {
    enabled: true,
    mass: .005,
    innerRadius: 1.,
    outerRadius: 2.3,
    mouseY: -.301,
    roDistance: -5.2,
    diskSpeed: .9,

    sliderA: .200,
    sliderB: .089,
    sliderC: .005,

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
        points.setUniform('diskSpeed', options.diskSpeed);

        points.setUniform('sliderA', options.sliderA);
        points.setUniform('sliderB', options.sliderB);
        points.setUniform('sliderC', options.sliderC);

        folder.add(options, 'enabled').name('enable');
        folder.add(options, 'mass', 0, 5, .0001).name('mass');
        folder.add(options, 'innerRadius', .1, 10, .0001).name('innerRadius');
        folder.add(options, 'outerRadius', .1, 10, .0001).name('outerRadius');
        folder.add(options, 'mouseY', -1, 1, .0001).name('mouseY');
        folder.add(options, 'roDistance', -10, 1, .0001).name('roDistance');
        folder.add(options, 'diskSpeed', .1, 1, .0001).name('diskSpeed');

        folder.add(options, 'sliderA', -1, 1, .0001).name('sliderA');
        folder.add(options, 'sliderB', -1, 1, .0001).name('sliderB');
        folder.add(options, 'sliderC', -1, 1, .0001).name('sliderC');
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
        points.setUniform('diskSpeed', options.diskSpeed);

        points.setUniform('sliderA', options.sliderA);
        points.setUniform('sliderB', options.sliderB);
        points.setUniform('sliderC', options.sliderC);
    }
}

export default base;