import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from 'points';

const options = {
    mass: .048,
    radius: .1,
    distortionScale: .1,
    falloffFactor: 1,
    ε: .1,
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
        points.setUniform('distortionScale', options.distortionScale);
        points.setUniform('falloffFactor', options.falloffFactor);
        points.setUniform('ε', options.ε);

        folder.add(options, 'mass', 0, .5, .0001).name('mass');
        folder.add(options, 'radius', 0, 2, .0001).name('radius');
        folder.add(options, 'distortionScale', 0, 1, .0001).name('distortionScale');
        folder.add(options, 'falloffFactor', 0, 100, .0001).name('falloffFactor');
        folder.add(options, 'ε', 0, 100, .0001).name('ε');

        const descriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            //maxAnisotropy: 10,
        }
        points.setSampler('imageSampler', descriptor);

        await points.setTextureImage('image', './../img/absulit_800x800.jpg');


        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setUniform('mass', options.mass);
        points.setUniform('radius', options.radius);
        points.setUniform('distortionScale', options.distortionScale);
        points.setUniform('falloffFactor', options.falloffFactor);
        points.setUniform('ε', options.ε);
    }
}

export default base;