import vert from './r0/vert.js';
import frag from './r0/frag.js';

import vert1 from './r1/vert.js';
import frag1 from './r1/frag.js';
import Points, { CullMode, RenderPass } from 'points';

const options = {
    val: 0.33,
    bool: false,
    color1: '#FF0000', // CSS string
    color2: [0, 128, 255], // RGB array
    color3: [0, 128, 255, 0.3], // RGB with alpha
    color4: { h: 350, s: 0.9, v: 0.3 }, // Hue, saturation, value
    color5: { r: 115, g: 50.9, b: 20.3, a: .1 }, // r, g, b object
}

const r0 = new RenderPass(vert, frag);
r0.depthWriteEnabled = true;
r0.cullMode = CullMode.NONE;
r0.addSphere('sphere', { x: 0, y: 1, z: 0 });
r0.addPlane('plane', { x: 0, y: 0, z: 0 }, { width: 4, height: 4 });


const r1 = new RenderPass(vert1, frag1);

const base = {
    renderPasses: [
        r0,
        r1
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            //maxAnisotropy: 10,
            compare: 'less',
        }
        points.setCameraPerspective('camera');
        points.setUniform('cameraPosition', [0, 0, -5], 'vec3f');
        points.setTextureDepth2d('depth', GPUShaderStage.FRAGMENT, 0);
        points.setSampler('shadowSampler', descriptor);
        points.setSampler('imageSampler', null);
        points.setTexture2d('feedbackTexture', true, null, 0);

        points.setUniform('lightPosition', [-.5, -5, -1], 'vec3f');


        // Add elements to dat gui
        // create an uniform and get value from options
        points.setUniform('val', options.val);

        // https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+add
        folder.add(options, 'val', -1, 1, .0001).name('Val');
        folder.add(options, 'bool').name('Bool');

        // https://github.com/dataarts/dat.gui/blob/master/API.md#GUI+addColor
        folder.addColor(options, 'color1');
        folder.addColor(options, 'color2');
        folder.addColor(options, 'color3');
        folder.addColor(options, 'color4');
        folder.addColor(options, 'color5');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        points.setCameraPerspective('camera', [0, 0, -5], [0, 0, 1000]);

        points.setUniform('val', options.val);
    }
}

export default base;