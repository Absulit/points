/**
 * Based on the Shadow Mapping demo in WebGPU Samples
 * https://webgpu.github.io/webgpu-samples/?q=shad&sample=shadowMapping
 */

import vert from './r0/vert.js';
import frag from './r0/frag.js';

import vert1 from './r1/vert.js';
import frag1 from './r1/frag.js';
import Points, { CullMode, RenderPass } from 'points';
import { structs } from './structs.js';

const options = {
    ambientFactor: 0.2,
    albedoFactor: 0.9,
    lambertMax: 0.07,
}

const spherePosition = { x: 0, y: 1, z: 0 };

const planePosition = { x: 0, y: 0, z: 2 };
const planeDimensions = { width: 4, height: 4 };
const planeColor = { r: 1, g: 0, b: 0, a: 1 };
const planeSegments = { x: 10, y: 10 };

const sphereColor = { r: .588, g: .454, b: 0, a: 1 };

const light = {
    left: -10,
    right: 10,
    top: 10,
    bottom: -10,
    near: .1,
    far: 150,
    position: [25, 50, -50],
    lookAt: [0, 0, 0],
}

const camera = {
    position: [5, 0, -5],
    lookAt: [0, 0, 0]
}

const r0 = new RenderPass(vert, frag);
r0.depthWriteEnabled = true;
// r0.cullMode = CullMode.NONE;
r0.addSphere('sphere0', spherePosition);
r0.addPlane('plane0', planePosition, planeDimensions, planeColor, planeSegments);


const r1 = new RenderPass(vert1, frag1);
r1.depthWriteEnabled = true;
r1.cullMode = CullMode.NONE;
r1.addSphere('sphere1', spherePosition, sphereColor);
r1.addPlane('plane1', planePosition, planeDimensions, planeColor, planeSegments);

const base = {
    renderPasses: [
        r0,
        r1
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        points.import(structs);

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

        points.setUniform('ambientFactor', options.ambientFactor);
        folder.add(options, 'ambientFactor', 0, 1, .0001).name('ambientFactor');

        points.setUniform('albedoFactor', options.albedoFactor);
        folder.add(options, 'albedoFactor', 0, 1, .0001).name('albedoFactor');

        points.setUniform('lambertMax', options.lambertMax);
        folder.add(options, 'lambertMax', 0, 1, .0001).name('lambertMax');

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: (points, t, dt) => {
        // const { time: t, timeDelta: td } = points;
        const { left, right, top, bottom, near, far, position, lookAt } = light;
        const p = position;
        p[0] = -Math.sin(t) * .5 + position[0]
        points.setCameraOrthographic('light', left, right, top, bottom, near, far, position, lookAt);
        points.setCameraPerspective('camera', camera.position, camera.lookAt);

        points.setUniform('ambientFactor', options.ambientFactor);
        points.setUniform('albedoFactor', options.albedoFactor);
        points.setUniform('lambertMax', options.lambertMax);
    }
}

export default base;
