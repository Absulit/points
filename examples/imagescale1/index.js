import vert from './vert.js';
import frag from './frag.js';
import Points, { ScaleMode } from 'points';
const imagescale1 = {
    vert,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async points => {
        points.scaleMode = ScaleMode.FIT;
        const descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            // maxAnisotropy: 10,
            // compare: 'always',
        }
        points.setSampler('imageSampler', descriptor);
        await points.setTextureImage('image1', './../img/gratia_800x800.jpg');
        await points.setTextureImage('image2', './../img/old_king_600x600.jpg');
        await points.setTextureImage('image3', './../img/unnamed_horror_100x100.png');
    },
    update: points => {

    }
}

export default imagescale1;
