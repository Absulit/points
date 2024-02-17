import vert from './vert.js';
import frag from './frag.js';

const sliders = { scale: 1, bloom: .133 }

const bloom1 = {
    vert,
    frag,
    init: async (points, folder) => {
        let descriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
        }

        points.addSampler('imageSampler', descriptor);
        // await points.addTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.addTextureImage('image', './../img/old_king_600x600.jpg');
        await points.addTextureImage('image', './../img/absulit_800x800.jpg');

        points.addUniform('scale', sliders.scale);
        points.addUniform('bloom', sliders.bloom);
        folder.add(sliders, 'scale', 0, 1, .0001).name('scale');
        folder.add(sliders, 'bloom', -1, 1, .0001).name('bloom');
        folder.open();
    },
    update: points => {
        points.updateUniform('scale', sliders.scale);
        points.updateUniform('bloom', sliders.bloom);
    }
}

export default bloom1;