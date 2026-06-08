
import Points, { RenderPass, RenderPasses } from 'points';
import { loadAndExtract, getAnimationDuration, calculateBoneMatrices } from 'utils';
import vert from './cube_renderpass/vert.js';
import frag from './cube_renderpass/frag.js';


const options = {
    animation: 3
}

const url = '../models/UAL1_Standard.glb'; // or remote URL (CORS must allow)
const data = await loadAndExtract(url);
const { positions, colors, uvs, normals, indices, colorSize, texture, animations, weights, joints, skins } = data[0]
console.log(data);


const cube_renderpass = new RenderPass(vert, frag);
cube_renderpass.setMesh('animModel', positions, colors, colorSize, uvs, normals, indices, { weights, joints })
cube_renderpass.depthWriteEnabled = true;
cube_renderpass.clearValue = { r: 61 / 255, g: 37 / 255, b: 103 / 255, a: 1 }

const SKIN = skins[0];
let ANIM = animations[options.animation];

let animationDuration = getAnimationDuration(ANIM);

const base = {
    renderPasses: [
        cube_renderpass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms, storages } = points;

        let texture2 = texture;
        if (!texture) {
            texture2 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAD0lEQVR4AQEEAPv/AP///wX+Av5JZm4rAAAAAElFTkSuQmCC`;
        }

        await points.setTextureImage('albedo', texture2);
        points.setSampler('imageSampler', null);

        let dropdownItems = {};
        animations.forEach((animation, idx) => {
            dropdownItems[animation.getName()] = idx;
        })

        folder.add(options, 'animation', dropdownItems)
            .name('Animations')
            .onChange(value => {
                console.log(value);
                ANIM = animations[+value];
                animationDuration = getAnimationDuration(ANIM);
            });

        const boneData = calculateBoneMatrices(SKIN, ANIM, 0);

        storages.boneMatrices.setType('array<mat4x4f>').setValue(Array.from(boneData))

        points.setCameraPerspective('camera');

        // points.addRenderPass(RenderPasses.COLOR);
        // points.addRenderPass(RenderPasses.PIXELATE);
        // points.addRenderPass(RenderPasses.FILM_GRAIN);

        folder.open();
    },
    /**
     * @param {Points} points
     */
    update: (points, t, dt) => {
        const { storages } = points;
        points.setCameraPerspective('camera', [0, 1, 5], [0, 1, 0]);

        const currentTime = t % animationDuration;
        const boneData = calculateBoneMatrices(SKIN, ANIM, currentTime);

        storages.boneMatrices.setValue(Array.from(boneData));

    }
}

export default base;
