
import Points, { RenderPass, RenderPasses } from 'points';
import { loadAndExtract } from 'utils';
import vert from './cube_renderpass/vert.js';
import frag from './cube_renderpass/frag.js';
import { Node } from 'https://unpkg.com/@gltf-transform/core@latest?module';

const options = {
    mode: 1
}

const url = '../models/Soldier.glb'; // or remote URL (CORS must allow)
const data = await loadAndExtract(url);
const { positions, colors, uvs, normals, indices, colorSize, texture, animations, weights, joints, skins } = data[0]


const cube_renderpass = new RenderPass(vert, frag);
cube_renderpass.setMesh('monkey', positions, colors, colorSize, uvs, normals, indices)
cube_renderpass.depthWriteEnabled = true;
cube_renderpass.clearValue = { r: 61 / 255, g: 37 / 255, b: 103 / 255, a: 1 }

import { mat4, vec3, quat } from 'https://unpkg.com/gl-matrix@latest?module';

let animationDuration = getAnimationDuration(animations[1]);

function calculateBoneMatrices(skin, animation, currentTime) {
    const joints = skin.listJoints();
    const numJoints = joints.length;
    const boneMatricesArray = new Float32Array(numJoints * 16);
    const globalMatrixCache = new Map();
    const ibmAccessor = skin.getInverseBindMatrices();
    const ibmCount = ibmAccessor.getCount();

    for (let i = 0; i < numJoints; i++) {
        const jointNode = joints[i];
        const globalMatrix = computeGlobalMatrix(jointNode, animation, currentTime, globalMatrixCache);
        const ibmValues = ibmAccessor.getElement(i, []);
        const inverseBindMatrix = mat4.clone(ibmValues);
        const finalBoneMatrix = mat4.create();

        mat4.multiply(finalBoneMatrix, globalMatrix, inverseBindMatrix);
        boneMatricesArray.set(finalBoneMatrix, i * 16);
    }

    return boneMatricesArray;
}

function computeGlobalMatrix(node, animation, currentTime, cache) {
    if (cache.has(node)) {
        return cache.get(node);
    }

    const localMatrix = computeLocalTransform(node, animation, currentTime);
    const parentNode = node.listParents().find(parent => parent instanceof Node);
    let globalMatrix = mat4.create();

    if (parentNode) {
        const parentGlobal = computeGlobalMatrix(parentNode, animation, currentTime, cache);
        mat4.multiply(globalMatrix, parentGlobal, localMatrix);
    } else {
        mat4.copy(globalMatrix, localMatrix);
    }

    cache.set(node, globalMatrix);
    return globalMatrix;
}

function computeLocalTransform(node, animation, currentTime) {
    let translation = vec3.clone(node.getTranslation() || [0, 0, 0]);
    let rotation = quat.clone(node.getRotation() || [0, 0, 0, 1]);
    let scale = vec3.clone(node.getScale() || [1, 1, 1]);

    const channels = animation.listChannels().filter(c => c.getTargetNode() === node);

    channels.forEach((channel) => {
        const path = channel.getTargetPath(); // 'translation', 'rotation', or 'scale'
        const sampler = channel.getSampler();

        const sampleValue = sampleAnimationSampler(sampler, currentTime);

        if (path === 'translation') translation = sampleValue;
        if (path === 'rotation') rotation = sampleValue; // Expects a vec4 Quaternion
        if (path === 'scale') scale = sampleValue;
    });

    const localMatrix = mat4.create();
    mat4.fromRotationTranslationScale(localMatrix, rotation, translation, scale);
    return localMatrix;
}

function sampleAnimationSampler(sampler, currentTime) {
    const times = sampler.getInput().getArray();    // e.g., Float32Array of timestamps
    const outputs = sampler.getOutput().getArray();  // e.g., Float32Array of keyframe values
    const numKeys = times.length;

    if (currentTime <= times[0]) return sampler.getOutput().getElement(0, []);
    if (currentTime >= times[numKeys - 1]) return sampler.getOutput().getElement(numKeys - 1, []);

    let i = 0;
    while (i < numKeys - 1 && times[i + 1] < currentTime) {
        i++;
    }

    const startTime = times[i];
    const endTime = times[i + 1];
    const t = (currentTime - startTime) / (endTime - startTime);

    const valA = sampler.getOutput().getElement(i, []);
    const valB = sampler.getOutput().getElement(i + 1, []);

    if (valA.length === 4) {
        const outQuat = quat.create();
        quat.slerp(outQuat, quat.clone(valA), quat.clone(valB), t);
        return outQuat;
    } else {
        const outVec = vec3.create();
        vec3.lerp(outVec, vec3.clone(valA), vec3.clone(valB), t);
        return outVec;
    }
}
function getAnimationDuration(animation) {
    const channels = animation.listChannels();
    let maxTime = 0;

    channels.forEach((channel) => {
        const sampler = channel.getSampler();
        if (!sampler) return;

        const inputAccessor = sampler.getInput();
        if (!inputAccessor) return;

        const timesArray = inputAccessor.getArray();
        const trackEndTime = timesArray[timesArray.length - 1];

        if (trackEndTime > maxTime) {
            maxTime = trackEndTime;
        }
    });

    return maxTime;
}

function padUint8ArrayToU32Layout(rawJoints) {
    const totalElements = rawJoints.length;
    const paddedArray = new Uint8Array(totalElements * 4);
    for (let i = 0; i < totalElements; i++) {
        paddedArray[i * 4] = rawJoints[i];
    }
    return paddedArray;
}

const base = {
    renderPasses: [
        cube_renderpass,
    ],
    /**
     * @param {Points} points
     */
    init: async (points, folder) => {
        const { uniforms, storages } = points;
        await points.setTextureImage('albedo', texture);
        points.setSampler('imageSampler', null);

        const dropdownItems = { /*'Vertex': 0,*/ 'Texture': 1, 'Shader': 2 };

        uniforms.color_mode = options.mode;
        folder.add(options, 'mode', dropdownItems).name('Colors').onChange(value => {
            console.log(value);
            uniforms.color_mode = +value;
        });


        storages.weights.setType(`array<vec4f>`).setValue(Array.from(weights));
        // TODO: using vec4u has an issue because internally I convert all arrays to Float32Array
        // when calling storageItem.value
        storages.joints.setType('array<vec4f>').setValue(Array.from(joints));

        const boneData = calculateBoneMatrices(skins[0], animations[1], 0);

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
        const boneData = calculateBoneMatrices(skins[0], animations[1], currentTime);

        storages.boneMatrices.setValue(Array.from(boneData));

    }
}

export default base;
