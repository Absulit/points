import vert from './r0/vert.js';
import frag from './r0/frag.js';

import vert1 from './r1/vert.js';
import frag1 from './r1/frag.js';
import Points, { CullMode, RenderPass } from 'points';

const options = {
    val: 0.584,
    bool: false,
}

const spherePosition = { x: 0, y: 1, z: 0 };

const planePosition = { x: 0, y: 0, z: 2 };
const planeDimensions = { width: 4, height: 4 };
const planerColor = { r: 1, g: 0, b: 1, a: 0 };
const planeSegments = { x: 10, y: 10 };

const lightPosition = [50, 100, -100];
const invLightPosition = lightPosition.map(v => -1 * v);
const light = {
    left: -80,
    right: 80,
    top: 80,
    bottom: -80,
    near: -200,
    far: 300,
    position: invLightPosition,
    lookAt: [0, 0, 0],
}

const camera = {
    position: [5, 0, -5],
    lookAt: [0, 0, 0]
}

const r0 = new RenderPass(vert, frag);
r0.depthWriteEnabled = true;
r0.cullMode = CullMode.NONE;
r0.addSphere('sphere0', spherePosition);
r0.addPlane('plane0', planePosition, planeDimensions, planerColor, planeSegments);


const r1 = new RenderPass(vert1, frag1);
r1.depthWriteEnabled = true;
r1.cullMode = CullMode.NONE;
r1.addSphere('sphere1', spherePosition);
r1.addPlane('plane1', planePosition, planeDimensions, planerColor, planeSegments);


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

        const { left, right, top, bottom, near, far, position, lookAt } = light;
        points.setCameraOrthographic('light', left, right, top, bottom, near, far, position, lookAt);


        points.setCameraPerspective('camera');
        points.setTextureDepth2d('depth', GPUShaderStage.FRAGMENT, 0);
        points.setSampler('shadowSampler', descriptor);
        // points.setSampler('imageSampler', null);
        points.setUniform('lightPos', position, 'vec3f');

        points.setUniform('val', options.val);
        folder.add(options, 'val', -4, 4, .0001).name('Val');

        folder.add(options, 'bool').name('Bool');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: points => {
        const { left, right, top, bottom, near, far, position, lookAt } = light;
        points.setCameraOrthographic('light', left, right, top, bottom, near, far, position, lookAt);
        points.setCameraPerspective('camera', camera.position, camera.lookAt);

        points.setUniform('val', options.val);
    }
}

export default base;
