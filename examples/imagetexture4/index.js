import vert from './vert.js';
import frag from './frag.js';

const options = {
    scale: 1,
}

const imagetexture4 = {
    vert,
    frag,
    init: async (points, folder) => {
        /**
         * @type {GPUObjectDescriptorBase}
         */
        let descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            //maxAnisotropy: 10,
        }

        points.addSampler('imageSampler', descriptor);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        // await points.addTextureImage('image', './../img/absulit_800x800.jpg');

        points.addUniform('scale', options.scale, 'f32');

        folder.add(options, 'scale', 0, 1, .0001).name('Scale');
        folder.open();
    },
    update: points => {
        points.updateUniform('scale', options.scale);
    }
}

export default imagetexture4;