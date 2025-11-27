import vert0 from './r0/vert.js';
import frag0 from './r0/frag.js';

import vert1 from './r1/vert.js';
import frag1 from './r1/frag.js';

import vert2 from './r2/vert.js';
import frag2 from './r2/frag.js';

import vert3 from './r3/vert.js';
import frag3 from './r3/frag.js';

import Points, { PresentationFormat, PrimitiveTopology, RenderPass } from 'points';

const options = {
    radius: 16, // 8 - 16
    bloomTextureSize: 1.004,
    threshold: 0,
    intensity: 2,
    bloom: .133,
}

const near = 0.1, far = 100;
const f = 1.0 / Math.tan(Math.PI / 8); // ≈ 2.414
let aspect = null
const nf = 1 / (near - far);

const r0 = new RenderPass(vert0, frag0);
const r1 = new RenderPass(vert1, frag1);
const r2 = new RenderPass(vert2, frag2);
const r3 = new RenderPass(vert3, frag3);

r0.addCube('cube0');
r0.depthWriteEnabled = true;
r0.topology = PrimitiveTopology.LINE_STRIP;
const bloom1 = {
    renderPasses: [
        r0,
        r1,
        r2,
        r3
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const descriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            //maxAnisotropy: 10,
        }

        points.presentationFormat = PresentationFormat.RGBA16FLOAT;

        aspect = points.canvas.width / points.canvas.height;
        points.setUniform(
            'projection',
            [
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, (2 * far * near) * nf, 0
            ],
            'mat4x4<f32>'
        )

        // camera at [0, 0, 5], looking at origin
        points.setUniform(
            'view',
            [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, -5, 1
            ],
            'mat4x4<f32>'
        )



        points.setSampler('imageSampler', descriptor);
        // await points.setTextureImage('image', './../img/carmen_lyra_423x643.jpg');
        // await points.setTextureImage('image', './../img/old_king_600x600.jpg');
        await points.setTextureImage('image', './../img/absulit_800x800.jpg');
        points.setTexture2d('feedbackTexture0', true, null, 0);
        points.setTexture2d('feedbackTexture1', true, null, 1);
        points.setTexture2d('feedbackTexture2', true, null, 2);


        points.setUniform('radius', options.radius);
        points.setUniform('bloomTextureSize', options.bloomTextureSize);

        points.setUniform('threshold', options.threshold);
        points.setUniform('intensity', options.intensity);
        points.setUniform('bloom', options.bloom);


        folder.add(options, 'radius', 8, 16, .0001).name('radius');
        folder.add(options, 'bloomTextureSize', 1, 2, .0001).name('bloomTextureSize');
        folder.add(options, 'threshold', 0, 4, .0001).name('threshold');
        folder.add(options, 'intensity', 0, 2, .0001).name('intensity');
        folder.add(options, 'bloom', 0, 1, .0001).name('bloom');
        folder.open();
    },
    update: points => {
        points.setUniform('radius', options.radius);
        points.setUniform('bloomTextureSize', options.bloomTextureSize);
        points.setUniform('threshold', options.threshold);
        points.setUniform('intensity', options.intensity);
        points.setUniform('bloom', options.bloom);

        aspect = points.canvas.width / points.canvas.height;
        points.setUniform(
            'projection',
            [
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) * nf, -1,
                0, 0, (2 * far * near) * nf, 0
            ]
        )
    }
}

export default bloom1;
