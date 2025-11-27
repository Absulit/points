import UniformKeys from './UniformKeys.js';
import VertexBufferInfo from './VertexBufferInfo.js';
import RenderPass, { PrimitiveTopology, LoadOp } from './RenderPass.js';
import RenderPasses from './RenderPasses.js';
import Coordinate from './coordinate.js';
import RGBAColor from './color.js';
import Clock from './clock.js';
import defaultStructs from './core/defaultStructs.js';
import { defaultVertexBody } from './core/defaultFunctions.js';
import { dataSize, getArrayTypeData, isArray, typeSizes } from './data-size.js';
import { loadImage, strToImage } from './texture-string.js';
import LayersArray from './LayersArray.js';
import UniformsArray from './UniformsArray.js';
import getStorageAccessMode, { bindingModes, entriesModes } from './storage-accessmode.js';

class PresentationFormat {
    static BGRA8UNORM = 'bgra8unorm';
    static RGBA8UNORM = 'rgba8unorm';
    static RGBA16FLOAT = 'rgba16float';
    static RGBA32FLOAT = 'rgba32float';
}

/**
 * Main class Points, this is the entry point of an application with this library.
 * @example
 * import Points from 'points';
 * const points = new Points('canvas');
 *
 * let renderPasses = [
 *     new RenderPass(vert1, frag1, compute1),
 *     new RenderPass(vert2, frag2, compute2)
 * ];
 *
 * await points.init(renderPasses);
 * update();
 *
 * function update() {
 *     points.update();
 *     requestAnimationFrame(update);
 * }
 *
 */
class Points {
    #canvasId = null;
    #canvas = null;
    /** @type {GPUAdapter} */
    #adapter = null;
    /** @type {GPUDevice} */
    #device = null;
    #context = null;
    #presentationFormat = null;
    /** @type {Array<RenderPass>} */
    #renderPasses = null;
    #postRenderPasses = [];
    #buffer = null;
    #presentationSize = null;
    #depthTexture = null;
    // #vertexArray = [];
    #numColumns = 1;
    #numRows = 1;
    #commandsFinished = [];
    #uniforms = new UniformsArray();
    #meshUniforms = new UniformsArray();
    #constants = [];
    #storage = [];
    #readStorage = [];
    #samplers = [];
    #textures2d = [];
    #texturesDepth2d = [];
    #texturesToCopy = [];
    #textures2dArray = [];
    #texturesExternal = [];
    #texturesStorage2d = [];
    #bindingTextures = [];
    #layers = new LayersArray();
    #originalCanvasWidth = null;
    #originalCanvasHeigth = null;
    #clock = new Clock();
    #time = 0;
    #delta = 0;
    #epoch = 0;
    #mouseX = 0;
    #mouseY = 0;
    #mouseDown = false;
    #mouseClick = false;
    #mouseWheel = false;
    #mouseDelta = [0, 0];
    #fullscreen = false;
    #fitWindow = false;
    #lastFitWindow = false;
    #sounds = []; // audio
    #events = new Map();
    #events_ids = 0;
    #dataSize = null;
    #screenResized = false;
    #textureUpdated = false;

    constructor(canvasId) {
        this.#canvasId = canvasId;
        this.#canvas = document.getElementById(this.#canvasId);
        if (this.#canvasId) {
            this.#canvas.addEventListener('click', e => {
                this.#mouseClick = true;
            });
            this.#canvas.addEventListener('mousemove', this.#onMouseMove, { passive: true });
            this.#canvas.addEventListener('mousedown', e => {
                this.#mouseDown = true;
            });
            this.#canvas.addEventListener('mouseup', e => {
                this.#mouseDown = false;
            });
            this.#canvas.addEventListener('wheel', e => {
                this.#mouseWheel = true;
                this.#mouseDelta = [e.deltaX, e.deltaY];
            }, { passive: true });
            this.#originalCanvasWidth = this.#canvas.clientWidth;
            this.#originalCanvasHeigth = this.#canvas.clientHeight;
            window.addEventListener('resize', this.#resizeCanvasToFitWindow, false);
            document.addEventListener('fullscreenchange', e => {
                this.#fullscreen = !!document.fullscreenElement;
                if (!this.#fullscreen && !this.#fitWindow) {
                    this.#resizeCanvasToDefault();
                }
                if (!this.#fullscreen) {
                    this.fitWindow = this.#lastFitWindow;
                }
            });
        }
    }

    #resizeCanvasToFitWindow = () => {
        this.#screenResized = true;
        if (this.#fitWindow) {
            const { offsetWidth, offsetHeight } = this.#canvas.parentNode;
            this.#canvas.width = offsetWidth;
            this.#canvas.height = offsetHeight;
            this.#setScreenSize();
        }
    }

    #resizeCanvasToDefault = () => {
        this.#screenResized = true;
        this.#canvas.width = this.#originalCanvasWidth;
        this.#canvas.height = this.#originalCanvasHeigth;
        this.#setScreenSize();
    }

    #setScreenSize = () => {
        // assigning size here because both sizes must match for the full screen
        // this was not happening before the speed up refactor
        this.#canvas.width = canvas.clientWidth;
        this.#canvas.height = canvas.clientHeight;

        this.#presentationSize = [
            this.#canvas.clientWidth,
            this.#canvas.clientHeight,
        ];
        this.#context.configure({
            label: '_context',
            device: this.#device,
            format: this.#presentationFormat,
            //size: this.#presentationSize,
            width: this.#presentationSize[0],
            height: this.#presentationSize[1],
            alphaMode: 'premultiplied',
            // Specify we want both RENDER_ATTACHMENT and COPY_SRC since we
            // will copy out of the swapchain texture.
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        });
        this.#depthTexture = this.#device.createTexture({
            label: '_depthTexture',
            size: this.#presentationSize,
            format: 'depth32float',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });
        // this is to solve an issue that requires the texture to be resized
        // if the screen dimensions change, this for a `setTexture2d` with
        // `copyCurrentTexture` parameter set to `true`.
        this.#textures2d.forEach(texture2d => {
            if (!texture2d.imageTexture && texture2d.texture) {
                this.#createTextureBindingToCopy(texture2d);
            }
        })
    }

    #onMouseMove = e => {
        // get position relative to canvas
        const rect = this.#canvas.getBoundingClientRect();
        this.#mouseX = e.clientX - rect.left;
        this.#mouseY = e.clientY - rect.top;
    }

    /**
     * Sets a `param` (predefined struct already in all shaders)
     * as uniform to send to all shaders.
     * A Uniform is a value that can only be changed
     * from the outside (js side, not the wgsl side),
     * and unless changed it remains consistent.
     * @param {string} name name of the Param, you can invoke it later in shaders as `Params.[name]`
     * @param {Number|Boolean|Array<Number>} value Single number or a list of numbers. Boolean is converted to Number.
     * @param {string} structName type as `f32` or a custom struct. Default `f32`.
     * @return {Object}
     *
     * @example
     * // js
     *  points.setUniform('color0', options.color0, 'vec3f');
     *  points.setUniform('color1', options.color1, 'vec3f');
     *  points.setUniform('scale', options.scale, 'f32');
     *
     * // wgsl string
     * let color0 = vec4(params.color0/255, 1.);
     * let color1 = vec4(params.color1/255, 1.);
     * let finalColor:vec4f = mix(color0, color1, params.scale);
     */
    setUniform(name, value, structName = null) {
        const uniformToUpdate = this.#nameExists(this.#uniforms, name);
        if (uniformToUpdate && structName) {
            // if name exists is an update
            console.warn(`setUniform(${name}, [${value}], ${structName}) can't set the structName of an already defined uniform.`);
        }
        if (uniformToUpdate) {
            uniformToUpdate.value = value;
            return uniformToUpdate;
        }
        if (structName && isArray(structName)) {
            throw `${structName} is an array, which is currently not supported for Uniforms.`;
        }
        const uniform = {
            name: name,
            value: value,
            type: structName,
            size: null
        }
        Object.seal(uniform);
        this.#uniforms.push(uniform);
        return uniform;
    }

    #setMeshUniform(name, value, structName = null) {
        const uniformToUpdate = this.#nameExists(this.#meshUniforms, name);
        if (uniformToUpdate && structName) {
            // if name exists is an update
            console.warn(`#setMeshUniform(${name}, [${value}], ${structName}) can't set the structName of an already defined uniform.`);
        }
        if (uniformToUpdate) {
            uniformToUpdate.value = value;
            return uniformToUpdate;
        }
        if (structName && isArray(structName)) {
            throw `${structName} is an array, which is currently not supported for Uniforms.`;
        }
        const uniform = {
            name: name,
            value: value,
            type: structName,
            size: null
        }
        Object.seal(uniform);
        this.#meshUniforms.push(uniform);
        return uniform;
    }

    /**
     * Updates a list of uniforms
     * @param {Array<{name:String, value:Number}>} arr object array of the type: `{name, value}`
     */
    updateUniforms(arr) {
        arr.forEach(uniform => {
            const variable = this.#uniforms.find(v => v.name === uniform.name);
            if (!variable) {
                throw '`updateUniform()` can\'t be called without first `setUniform()`.';
            }
            variable.value = uniform.value;
        })
    }

    /**
     * Create a WGSL `const` initialized from JS.
     * Useful to set a value you can't initialize in WGSL because you don't have
     * the value yet.
     * The constant will be ready to use on the WGSL shder string.
     * @param {String} name
     * @param {string|Number} value
     * @param {String} structName
     * @returns {Object}
     *
     * @example
     *
     * // js side
     * points.setConstant('NUMPARTICLES', 64, 'f32')
     *
     * // wgsl string
     * // this should print `NUMPARTICLES` and be ready to use.
     * const NUMPARTICLES:f32 = 64; // this will be hidden to the developer
     *
     * // your code:
     * const particles = array<Particle, NUMPARTICLES>();
     */
    setConstant(name, value, structName) {
        const constantToUpdate = this.#nameExists(this.#constants, name);

        if (constantToUpdate) {
            // if name exists is an update
            throw '`setConstant()` can\'t update a const after it has been set.';
        }

        const constant = {
            name,
            value,
            structName,
        }

        this.#constants.push(constant);

        return constant;
    }

    /**
     * Creates a persistent memory buffer across every frame call. See [GPUBuffer](https://www.w3.org/TR/webgpu/#gpubuffer)
     * <br>
     * Meaning it can be updated in the shaders across the execution of every frame.
     * <br>
     * It can have almost any type, like `f32` or `vec2f` or even array<f32>.
     * @param {string} name Name that the Storage will have in the shader
     * @param {string} structName Name of the struct already existing on the
     * shader. This will be the type of the Storage.
     * @param {boolean} read if this is going to be used to read data back
     * @param {GPUShaderStage} shaderType this tells to what shader the storage is bound
     * @returns {Object}
     *
     * @example
     * // js
     * points.setStorage('result', 'f32');
     *
     * // wgsl string
     * result[index]  = 128.;
     *
     * @example
     * // js
     * points.setStorage('colors', 'array<vec3f, 6>');
     *
     * // wgsl string
     * colors[index] = vec3f(248, 208, 146) / 255;
     */
    setStorage(name, structName, read, shaderType = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE, arrayData = null) {
        if (this.#nameExists(this.#storage, name)) {
            throw `\`setStorage()\` You have already defined \`${name}\``;
        }
        const storage = {
            mapped: !!arrayData,
            name,
            structName,
            // structSize: null,
            shaderType,
            read,
            buffer: null,
            internal: false
        }
        this.#storage.push(storage);
        return storage;
    }

    /**
     * Creates a persistent memory buffer across every frame call that can be updated.
     * See [GPUBuffer](https://www.w3.org/TR/webgpu/#gpubuffer)
     * <br>
     * Meaning it can be updated in the shaders across the execution of every frame.
     * <br>
     * It can have almost any type, like `f32` or `vec2f` or even array<f32>.
     * <br>
     * The difference with {@link Points#setStorage|setStorage} is that this can be initialized
     * with data.
     * @param {string} name Name that the Storage will have in the shader.
     * @param {Uint8Array<ArrayBuffer>|Array<Number>|Number} arrayData array with the data that must match the struct.
     * @param {string} structName Name of the struct already existing on the
     * shader. This will be the type of the Storage.
     * @param {boolean} read if this is going to be used to read data back.
     * @param {GPUShaderStage} shaderType this tells to what shader the storage is bound
     *
     * @example
     * // js examples/data1
     * const firstMatrix = [
     *     2, 4 , // 2 rows 4 columns
     *     1, 2, 3, 4,
     *     5, 6, 7, 8
     * ];
     * const secondMatrix = [
     *     4, 2, // 4 rows 2 columns
     *     1, 2,
     *     3, 4,
     *     5, 6,
     *     7, 8
     * ];
     *
     * // Matrix should exist as a struct in the wgsl shader
     * points.setStorageMap('firstMatrix', firstMatrix, 'Matrix');
     * points.setStorageMap('secondMatrix', secondMatrix, 'Matrix');
     * points.setStorage('resultMatrix', 'Matrix', true); // this reads data back
     *
     * // wgsl string
     * struct Matrix {
     *     size : vec2f,
     *     numbers: array<f32>,
     * }
     *
     * resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);
     */
    setStorageMap(name, arrayData, structName, read = false, shaderType = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE) {
        const storageToUpdate = this.#nameExists(this.#storage, name);

        if (!Array.isArray(arrayData) && arrayData.constructor !== Uint8Array) {
            arrayData = new Uint8Array([arrayData]);
        }

        if (storageToUpdate) {
            storageToUpdate.array = arrayData;
            storageToUpdate.updated = true;
            return storageToUpdate;
        }
        // TODO document the stream feature
        /**
         * `updated` is set to true in data updates, but this is not true in
         * something like audio, where the data streams and needs to be updated
         * constantly, so if the storage map needs to be updated constantly then
         * `stream` needs to be set to true.
         */
        const storage = {
            stream: false, // permanently updated as true
            updated: true,
            mapped: true,
            name,
            structName,
            shaderType,
            array: arrayData,
            buffer: null,
            read,
            internal: false
        }
        this.#storage.push(storage);
        return storage;
    }
    async readStorage(name) {
        let storageItem = this.#readStorage.find(storageItem => storageItem.name === name);
        let arrayBuffer = null;
        let arrayBufferCopy = null;
        if (storageItem) {
            await storageItem.buffer.mapAsync(GPUMapMode.READ);
            arrayBuffer = storageItem.buffer.getMappedRange();
            arrayBufferCopy = new Float32Array(arrayBuffer.slice(0));
            storageItem.buffer.unmap();
        }
        return arrayBufferCopy;
    }

    /**
     * Layers of data made of `vec4f`.
     * This creates a storage array named `layers` of the size
     * of the screen in pixels;
     * @param {Number} numLayers
     * @param {GPUShaderStage} shaderType
     *
     * @example
     * // js
     * points.setLayers(2);
     *
     * // wgsl string
     * var point = textureLoad(image, vec2<i32>(ix,iy), 0);
     * layers[0][pointIndex] = point;
     * layers[1][pointIndex] = point;
     */
    setLayers(numLayers, shaderType) {
        // TODO: check what data to return
        // TODO: improve jsdoc because the array definition is confusing
        for (let layerIndex = 0; layerIndex < numLayers; layerIndex++) {
            this.#layers.shaderType = shaderType;
            this.#layers.push({
                name: `layer${layerIndex}`,
                size: this.#canvas.width * this.#canvas.height,
                structName: 'vec4f',
                structSize: 16,
                array: null,
                buffer: null
            });
        }
    }

    #nameExists(arrayOfObjects, name) {
        return arrayOfObjects.find(obj => obj.name == name);
    }

    /**
     * Creates a `sampler` to be sent to the shaders. Internally it will be a {@link GPUSampler}
     * @param {string} name Name of the `sampler` to be called in the shaders.
     * @param {GPUSamplerDescriptor} descriptor `Object` with properties that affect the image. See example below.
     * @returns {Object}
     *
     * @example
     * // js
     * const descriptor = {
     *  addressModeU: 'repeat',
     *  addressModeV: 'repeat',
     *  magFilter: 'nearest',
     *  minFilter: 'nearest',
     *  mipmapFilter: 'nearest',
     *  //maxAnisotropy: 10,
     * }
     *
     * points.setSampler('imageSampler', descriptor);
     *
     * // wgsl string
     * let value = texturePosition(image, imageSampler, position, uvr, true);
     */

    setSampler(name, descriptor, shaderType) {
        if ('sampler' == name) {
            throw 'setSampler: `name` can not be sampler since is a WebGPU keyword.';
        }
        const exists = this.#nameExists(this.#samplers, name)
        if (exists) {
            console.warn(`setSampler: \`${name}\` already exists.`);
            return exists;
        }
        // Create a sampler with linear filtering for smooth interpolation.
        descriptor = descriptor || {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            //maxAnisotropy: 10,
        };
        const sampler = {
            name: name,
            descriptor: descriptor,
            shaderType: shaderType,
            resource: null,
            internal: false
        };
        this.#samplers.push(sampler);
        return sampler;
    }

    /**
     * Creates a `texture_2d` in the shaders.<br>
     * Used to write data and then print to screen.<br>
     * It can also be used for write the current render pass (what you see on the screen)
     * to this texture, to be used in the next cycle of this render pass; meaning
     * you effectively have the previous frame data before printing the next one.
     *
     * @param {String} name Name to call the texture in the shaders.
     * @param {boolean} copyCurrentTexture If you want the fragment output to be copied here.
     * @param {GPUShaderStage} shaderType To what {@link GPUShaderStage} you want to exclusively use this variable.
     * @param {Number} renderPassIndex If using `copyCurrentTexture`
     * this tells which RenderPass it should get the data from. If not set then it will grab the last pass.
     * @returns {Object}
     *
     * @example
     * // js
     * points.setTexture2d('feedbackTexture', true);
     *
     * // wgsl string
     * var rgba = textureSampleLevel(
     *     feedbackTexture, feedbackSampler,
     *     vec2f(f32(GlobalId.x), f32(GlobalId.y)),
     *     0.0
     * );
     *
     */
    setTexture2d(name, copyCurrentTexture, shaderType, renderPassIndex) {
        const exists = this.#nameExists(this.#textures2d, name);
        if (exists) {
            console.warn(`setTexture2d: \`${name}\` already exists.`);
            return exists;
        }
        const texture2d = {
            name,
            copyCurrentTexture,
            shaderType,
            texture: null,
            renderPassIndex,
            internal: false
        }
        this.#textures2d.push(texture2d);
        return texture2d;
    }

    /**
     * Creates a depth map from the selected `renderPassIndex`
     * @param {String} name
     * @param {GPUShaderStage} shaderType
     * @param {Number} renderPassIndex
     * @returns
     */
    setTextureDepth2d(name, shaderType, renderPassIndex) {
        const exists = this.#nameExists(this.#texturesDepth2d, name);
        if (exists) {
            console.warn(`setTextureDepth2d: \`${name}\` already exists.`);
            return exists;
        }
        const textureDepth2d = {
            name,
            shaderType,
            texture: null,
            renderPassIndex,
            internal: false,
        }
        this.#texturesDepth2d.push(textureDepth2d);
        return textureDepth2d;
    }

    copyTexture(nameTextureA, nameTextureB) {
        const texture2d_A = this.#nameExists(this.#textures2d, nameTextureA);
        const texture2d_B = this.#nameExists(this.#textures2d, nameTextureB);
        if (!(texture2d_A && texture2d_B)) {
            console.error('One of the textures does not exist.');
        }
        const a = texture2d_A.texture;
        const cubeTexture = this.#device.createTexture({
            label: '_cubeTexture',
            size: [a.width, a.height, 1],
            format: 'rgba8unorm',
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
        texture2d_B.texture = cubeTexture;
        this.#texturesToCopy.push({ a, b: texture2d_B.texture });
    }

    /**
     * Loads an image as `texture_2d` and then it will be available to read
     * data from in the shaders.<br>
     * Supports web formats like JPG, PNG.
     * @param {string} name identifier it will have in the shaders
     * @param {string} path image address in a web server
     * @param {GPUShaderStage} shaderType in what shader type it will exist only
     * @returns {Object}
     *
     * @example
     * // js
     * await points.setTextureImage('image', './../myimage.jpg');
     *
     * // wgsl string
     * let rgba = texturePosition(image, imageSampler, position, uvr, true);
     */
    async setTextureImage(name, path, shaderType = null) {
        const texture2dToUpdate = this.#nameExists(this.#textures2d, name);
        const response = await fetch(path);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        if (texture2dToUpdate) {
            if (shaderType) {
                throw '`setTextureImage()` the param `shaderType` should not be updated after its creation.';
            }
            this.#textureUpdated = true;
            texture2dToUpdate.imageTexture.bitmap = imageBitmap;
            const cubeTexture = this.#device.createTexture({
                label: '_cubeTexture setTextureImage',
                size: [imageBitmap.width, imageBitmap.height, 1],
                format: 'rgba8unorm',
                usage:
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_SRC |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT,
            });
            this.#device.queue.copyExternalImageToTexture(
                { source: imageBitmap },
                { texture: cubeTexture },
                [imageBitmap.width, imageBitmap.height]
            );
            texture2dToUpdate.texture = cubeTexture;
            return texture2dToUpdate;
        }
        const texture2d = {
            name: name,
            copyCurrentTexture: false,
            shaderType: shaderType,
            texture: null,
            renderPassIndex: null,
            imageTexture: {
                bitmap: imageBitmap
            },
            internal: false
        }
        this.#textures2d.push(texture2d);
        return texture2d;
    }

    /**
     * Loads a text string as a texture.<br>
     * Using an Atlas or a Spritesheet with UTF-16 chars (`path`) it will create a new texture
     * that contains only the `text` characters.<br>
     * Characters in the atlas `path` must be in order of the UTF-16 chars.<br>
     * It can have missing characters at the end or at the start, so the `offset` is added to take account for those chars.<br>
     * For example, `A` is 65, but if one character is removed before the letter `A`, then offset is `-1`
     * @param {String} name id of the wgsl variable in the shader
     * @param {String} text text you want to load as texture
     * @param {String} path atlas to grab characters from, image address in a web server
     * @param {{x: number, y: number}} size size of a individual character e.g.: `{x:10, y:20}`
     * @param {Number} offset how many characters back or forward it must move to start
     * @param {GPUShaderStage} shaderType To what {@link GPUShaderStage} you want to exclusively use this variable.
     * @returns {Object}
     *
     * @example
     * // js
     * await points.setTextureString(
     *     'textImg',
     *     'Custom Text',
     *     './../img/inconsolata_regular_8x22.png',
     *     size,
     *     -32
     * );
     *
     * // wgsl string
     * let textColors = texturePosition(textImg, imageSampler, position, uvr, true);
     *
     */
    async setTextureString(name, text, path, size, offset = 0, shaderType = null) {
        const atlas = await loadImage(path);
        const textImg = strToImage(text, atlas, size, offset);
        return this.setTextureImage(name, textImg, shaderType);
    }

    /**
     * Load images as texture_2d_array
     * @param {string} name id of the wgsl variable in the shader
     * @param {Array} paths image addresses in a web server
     * @param {GPUShaderStage} shaderType
     */
    // TODO: verify if this can be updated after creation
    // TODO: return texture2dArray object
    async setTextureImageArray(name, paths, shaderType) {
        if (this.#nameExists(this.#textures2dArray, name)) {
            // TODO: throw exception here
            return;
        }
        const imageBitmaps = [];
        for await (const path of paths) {
            const response = await fetch(path);
            const blob = await response.blob();
            imageBitmaps.push(await createImageBitmap(blob));
        }

        const texture2dArrayItem = {
            name: name,
            copyCurrentTexture: false,
            shaderType: shaderType,
            texture: null,
            imageTextures: {
                bitmaps: imageBitmaps
            },
            internal: false
        }

        this.#textures2dArray.push(texture2dArrayItem);
        return texture2dArrayItem;
    }

    /**
     * Loads a video as `texture_external`and then
     * it will be available to read data from in the shaders.
     * Supports web formats like mp4 and webm.
     * @param {string} name id of the wgsl variable in the shader
     * @param {string} path video address in a web server
     * @param {GPUShaderStage} shaderType
     * @returns {Object}
     *
     * @example
     * // js
     * await points.setTextureVideo('video', './../myvideo.mp4');
     *
     * // wgsl string
     * let rgba = textureExternalPosition(video, imageSampler, position, uvr, true);
     */
    async setTextureVideo(name, path, shaderType) {
        if (this.#nameExists(this.#texturesExternal, name)) {
            throw `setTextureVideo: ${name} already exists.`;
        }
        const video = document.createElement('video');
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        video.src = new URL(path, import.meta.url).toString();
        await video.play();
        const textureExternal = {
            name: name,
            shaderType: shaderType,
            video: video,
            internal: false
        };
        this.#texturesExternal.push(textureExternal);
        return textureExternal;
    }

    /**
     * Loads webcam as `texture_external`and then
     * it will be available to read data from in the shaders.
     * @param {String} name id of the wgsl variable in the shader
     * @param {{width:Number, height:Number}} size to crop the video. WebGPU might throw an error if size does not match.
     * @param {GPUShaderStage} shaderType
     * @returns {Object}
     * @throws a WGSL error if the size doesn't match possible crop size
     * @example
     * // js
     * await points.setTextureWebcam('video');
     *
     * // wgsl string
     * et rgba = textureExternalPosition(video, imageSampler, position, uvr, true);
     */
    async setTextureWebcam(name, size = { width: 1080, height: 1080 }, shaderType) {
        if (this.#nameExists(this.#texturesExternal, name)) {
            throw `setTextureWebcam: ${name} already exists.`;
        }
        const video = document.createElement('video');
        video.muted = true;
        if (navigator.mediaDevices.getUserMedia) {
            await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: size.width }, height: { ideal: size.height } } })
                .then(async stream => {
                    video.srcObject = stream;
                    await video.play();
                })
                .catch(err => { throw err });
        }
        const textureExternal = {
            name,
            shaderType,
            video,
            size,
            internal: false
        };
        this.#texturesExternal.push(textureExternal);

        return await new Promise(resolve => resolve(textureExternal));
    }

    /**
     * Assigns an audio FrequencyData to a StorageMap.<br>
     * Calling setAudio creates a Storage with `name` in the wgsl shaders.<br>
     * From this storage you can read the audio data sent to the shader as numeric values.<br>
     * Values in `audio.data` are composed of integers on a scale from 0..255
     * @param {string} name name of the Storage and prefix of the length variable e.g. `[name]Length`.
     * @param {string} path audio file address in a web server
     * @param {Number} volume
     * @param {boolean} loop
     * @param {boolean} autoplay
     * @returns {HTMLAudioElement}
     * @example
     * // js
     * const audio = points.setAudio('audio', 'audiofile.ogg', volume, loop, autoplay);
     *
     * // wgsl
     * let audioX = audio.data[ u32(uvr.x * params.audioLength)] / 256;
     */
    setAudio(name, path, volume, loop, autoplay) {
        const audio = new Audio(path);
        audio.volume = volume;
        audio.autoplay = autoplay;
        audio.loop = loop;
        const sound = {
            name: name,
            path: path,
            audio: audio,
            analyser: null,
            data: null
        }
        // this.#audio.play();
        // audio
        const audioContext = new AudioContext();
        const resume = _ => { audioContext.resume() }
        if (audioContext.state === 'suspended') {
            document.body.addEventListener('touchend', resume, false);
            document.body.addEventListener('click', resume, false);
        }
        const source = audioContext.createMediaElementSource(audio);
        // // audioContext.createMediaStreamSource()
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        const bufferLength = analyser.fftSize;//analyser.frequencyBinCount;
        // const bufferLength = analyser.frequencyBinCount;
        const data = new Uint8Array(bufferLength);
        // analyser.getByteTimeDomainData(data);
        analyser.getByteFrequencyData(data);
        // storage that will have the data on WGSL
        this.setStorageMap(name, data,
            // `array<f32, ${bufferLength}>`
            'Sound' // custom struct in defaultStructs.js
        ).stream = true;
        // uniform that will have the data length as a quick reference
        this.setUniform(`${name}Length`, analyser.frequencyBinCount);
        sound.analyser = analyser;
        sound.data = data;
        this.#sounds.push(sound);
        return audio;
    }


    // TODO: verify this method
    setTextureStorage2d(name, shaderType) {
        if (this.#nameExists(this.#texturesStorage2d, name)) {
            throw `setTextureStorage2d: ${name} already exists.`
        }
        const texturesStorage2d = {
            name: name,
            shaderType: shaderType,
            texture: null,
            internal: false
        };
        this.#texturesStorage2d.push(texturesStorage2d);
        return texturesStorage2d;
    }

    /**
     * Special texture where data can be written to it in the Compute Shader and
     * read from in the Fragment Shader OR from a {@link RenderPass} to another.
     * If you use writeIndex and readIndex it will share data between `RenderPasse`s
     * Is a one way communication method.
     * Ideal to store data to it in the Compute Shader and later visualize it in
     * the Fragment Shader.
     * @param {string} writeName name of the variable in the compute shader
     * @param {string} readName name of the variable in the fragment shader
     * @param {number} writeIndex RenderPass allowed to write into `outputTex`
     * @param {number} readIndex RenderPass allowed to read from `computeTexture`
     * @param {Array<number, 2>} size dimensions of the texture, by default screen
     * size
     * @returns {Object}
     *
     * @example
     *
     * // js
     * points.setBindingTexture('outputTex', 'computeTexture');
     *
     * // wgsl string
     * //// compute
     * textureStore(outputTex, GlobalId.xy, rgba);
     * //// fragment
     * let value = texturePosition(computeTexture, imageSampler, position, uv, false);
     */
    setBindingTexture(writeName, readName, writeIndex, readIndex, size) {
        if ((Number.isInteger(writeIndex) && !Number.isInteger(readIndex)) || (!Number.isInteger(writeIndex) && Number.isInteger(readIndex))) {
            throw 'The parameters writeIndex and readIndex must both be declared.';
        }
        const usesRenderPass = Number.isInteger(writeIndex) && Number.isInteger(readIndex);
        // TODO: validate that names don't exist already
        const bindingTexture = {
            write: {
                name: writeName,
                shaderType: GPUShaderStage.COMPUTE,
                renderPassIndex: writeIndex
            },
            read: {
                name: readName,
                shaderType: GPUShaderStage.FRAGMENT,
                renderPassIndex: readIndex
            },
            texture: null,
            size: size,
            usesRenderPass,
            internal: false
        }
        this.#bindingTextures.push(bindingTexture);
        return bindingTexture;
    }

    /**
     * Listens for an event dispatched from WGSL code
     * @param {String} name Number that represents an event Id
     * @param {Function} callback function to be called when the event occurs
     * @param {Number} structSize size of the array data to be returned
     *
     * @example
     * // js
     * // the event name will be reflected as a variable name in the shader
     * // and a data variable that starts with the name
     * points.addEventListener('click_event', data => {
     *     // response action in JS
     *      const [a, b, c, d] = data;
     *      console.log({a, b, c, d});
     * }, 4); // data will have 4 items
     *
     * // wgsl string
     *  if(params.mouseClick == 1.){
     *      // we update our event response data with something we need
     *      // on the js side
     *      // click_event_data has 4 items to fill
     *      click_event_data[0] = params.time;
     *      // Same name of the Event
     *      // we fire the event with a 1
     *      // it will be set to 0 in the next frame
     *      click_event.updated = 1;
     *  }
     *
     */
    addEventListener(name, callback, structSize = 1) {
        // TODO: remove structSize
        // this extra 1 is for the boolean flag in the Event struct
        const data = Array(4).fill(0);
        this.setStorageMap(name, data, 'Event', true, GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT);
        this.setStorage(`${name}_data`, `array<f32, ${structSize}>`, true, GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT);
        this.#events.set(this.#events_ids,
            {
                id: this.#events_ids,
                name,
                callback,
            }
        );
        ++this.#events_ids;
    }

    /**
     * @param {GPUShaderStage} shaderType
     * @param {RenderPass} renderPass
     * @returns {String} string with bindings
     */
    #createDynamicGroupBindings(shaderType, { index: renderPassIndex, internal }, groupId = 0) {
        if (!shaderType) {
            throw '`GPUShaderStage` is required';
        }
        // const groupId = 0;
        let dynamicGroupBindings = '';
        let bindingIndex = 0;
        if (this.#uniforms.length) {
            dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <uniform> params: Params;\n`;
            bindingIndex += 1;
        }
        if (this.#meshUniforms.length) {
            dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <uniform> mesh: Mesh;\n`;
            bindingIndex += 1;
        }
        this.#storage.forEach(storageItem => {
            const isInternal = internal === storageItem.internal;
            if (isInternal && (!storageItem.shaderType || storageItem.shaderType & shaderType)) {
                const T = storageItem.structName;

                // note:
                // shaderType means: this is the current GPUShaderStage we are at
                // and storageItem.shaderType is the stage required by the buffer in setStorage

                let accessMode = getStorageAccessMode(shaderType, storageItem.shaderType);
                accessMode = bindingModes[accessMode];

                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <storage, ${accessMode}> ${storageItem.name}: ${T};\n`
                bindingIndex += 1;
            }
        });
        if (this.#layers.length) {
            if (!this.#layers.shaderType || this.#layers.shaderType & shaderType) {
                let totalSize = 0;
                this.#layers.forEach(layerItem => totalSize += layerItem.size);
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <storage, read_write> layers: array<array<vec4f, ${totalSize}>>;\n`
                bindingIndex += 1;
            }
        }
        this.#samplers.forEach(sampler => {
            const isInternal = internal === sampler.internal;
            if (isInternal && (!sampler.shaderType || sampler.shaderType & shaderType)) {
                const T = sampler.descriptor.compare ? 'sampler_comparison' : 'sampler';
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${sampler.name}: ${T};\n`;
                bindingIndex += 1;
            }
        });
        this.#texturesStorage2d.forEach(texture => {
            const isInternal = internal === texture.internal;
            if (isInternal && (!texture.shaderType || texture.shaderType & shaderType)) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_storage_2d<rgba8unorm, write>;\n`;
                bindingIndex += 1;
            }
        });
        this.#textures2d.forEach(texture => {
            const isInternal = internal === texture.internal;
            if (isInternal && (!texture.shaderType || texture.shaderType & shaderType)) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_2d<f32>;\n`;
                bindingIndex += 1;
            }
        });
        this.#texturesDepth2d.forEach(texture => {
            const isInternal = internal === texture.internal;
            if (isInternal && (!texture.shaderType || texture.shaderType & shaderType)) {
                if (texture.renderPassIndex !== renderPassIndex) {
                    dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_depth_2d;\n`;
                    bindingIndex += 1;
                }
            }
        });
        this.#textures2dArray.forEach(texture => {
            const isInternal = internal === texture.internal;
            if (isInternal && (!texture.shaderType || texture.shaderType & shaderType)) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_2d_array<f32>;\n`;
                bindingIndex += 1;
            }
        });
        this.#texturesExternal.forEach(externalTexture => {
            const isInternal = internal === externalTexture.internal;
            if (isInternal && (!externalTexture.shaderType || externalTexture.shaderType & shaderType)) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${externalTexture.name}: texture_external;\n`;
                bindingIndex += 1;
            }
        });
        this.#bindingTextures.forEach(bindingTexture => {
            const { usesRenderPass } = bindingTexture;
            if (usesRenderPass) {
                if (GPUShaderStage.VERTEX === shaderType) { // to avoid binding texture in vertex
                    return;
                }
                if (renderPassIndex === bindingTexture.write.renderPassIndex) {
                    dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${bindingTexture.write.name}: texture_storage_2d<rgba8unorm, write>;\n`;
                    bindingIndex += 1;
                }
                if (renderPassIndex === bindingTexture.read.renderPassIndex) {
                    dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${bindingTexture.read.name}: texture_2d<f32>;\n`;
                    bindingIndex += 1;
                }

                return;
            }

            const isInternal = internal === bindingTexture.internal;
            if (isInternal && (bindingTexture.write.shaderType & shaderType)) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${bindingTexture.write.name}: texture_storage_2d<rgba8unorm, write>;\n`;
                bindingIndex += 1;
            }
            if (isInternal && (bindingTexture.read.shaderType & shaderType)) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${bindingTexture.read.name}: texture_2d<f32>;\n`;
                bindingIndex += 1;
            }
        });
        return dynamicGroupBindings;
    }

    #createDynamicGroupBindingsUpdate(shaderType, { index: renderPassIndex, internal }, groupId = 0) {
        if (!shaderType) {
            throw '`GPUShaderStage` is required';
        }
        // const groupId = 0;
        let dynamicGroupBindings = '';
        let bindingIndex = 0;

        this.#texturesExternal.forEach(externalTexture => {
            const isInternal = internal === externalTexture.internal;
            if (isInternal && (!externalTexture.shaderType || externalTexture.shaderType & shaderType)) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${externalTexture.name}: texture_external;\n`;
                bindingIndex += 1;
            }
        });

        return dynamicGroupBindings;

    }

    /**
     * Establishes the density of the base mesh, by default 1x1, meaning two triangles.
     * The final number of triangles is `numColumns` * `numRows` * `2` ( 2 being the triangles )
     * @param {Number} numColumns quads horizontally
     * @param {Number} numRows quads vertically
     *
     * @example
     * // js
     * points.setMeshDensity(20,20);
     *
     * // wgsl string
     * //// vertex shader
     * var modifiedPosition = position;
     * modifiedPosition.w = modifiedPosition.w + sin(f32(vertexIndex) * (params.time) * .01) * .1;
     *
     * return defaultVertexBody(modifiedPosition, color, uv);
     */
    setMeshDensity(numColumns, numRows) {
        if (numColumns == 0 || numRows == 0) {
            throw 'Parameters should be greater than 0';
        }
        this.#numColumns = numColumns;
        this.#numRows = numRows;
    }

    /**
     *
     * @param {RenderPass} renderPass
     * @param {Number} index
     */
    #compileRenderPass = (renderPass, index) => {
        let vertexShader = renderPass.vertexShader;
        let computeShader = renderPass.computeShader;
        let fragmentShader = renderPass.fragmentShader;
        let colorsVertWGSL = vertexShader;
        let colorsComputeWGSL = computeShader;
        let colorsFragWGSL = fragmentShader;
        let dynamicGroupBindingsVertex = '';
        let dynamicGroupBindingsCompute = '';
        let dynamicGroupBindingsFragment = '';
        let dynamicStructParams = '';
        let dynamicStructMesh = '';
        this.#uniforms.forEach(u => {
            u.type = u.type || 'f32';
            dynamicStructParams += /*wgsl*/`${u.name}:${u.type}, \n\t`;
        });
        if (this.#uniforms.length) {
            dynamicStructParams = /*wgsl*/`struct Params {\n\t${dynamicStructParams}\n}\n`;
        }
        this.#meshUniforms.forEach(u => {
            u.type = u.type || 'f32';
            dynamicStructMesh += /*wgsl*/`${u.name}:${u.type}, \n\t`;
        });
        if (this.#meshUniforms.length) {
            dynamicStructMesh = /*wgsl*/`struct Mesh {\n\t${dynamicStructMesh}\n}\n`;
        }
        this.#constants.forEach(c => {
            dynamicStructParams += /*wgsl*/`const ${c.name}:${c.structName} = ${c.value};\n`;
        })
        dynamicStructParams += dynamicStructMesh;

        renderPass.index = index;
        renderPass.hasVertexShader && (dynamicGroupBindingsVertex += dynamicStructParams);
        renderPass.hasComputeShader && (dynamicGroupBindingsCompute += dynamicStructParams);
        renderPass.hasFragmentShader && (dynamicGroupBindingsFragment += dynamicStructParams);

        renderPass.hasVertexShader && (dynamicGroupBindingsVertex += this.#createDynamicGroupBindings(GPUShaderStage.VERTEX, renderPass));
        renderPass.hasComputeShader && (dynamicGroupBindingsCompute += this.#createDynamicGroupBindings(GPUShaderStage.COMPUTE, renderPass));
        dynamicGroupBindingsFragment += this.#createDynamicGroupBindings(GPUShaderStage.FRAGMENT, renderPass, 1);

        // renderPass.hasVertexShader && (dynamicGroupBindingsVertex += this.#createDynamicGroupBindingsUpdate(GPUShaderStage.VERTEX, renderPass, 2));
        // renderPass.hasComputeShader && (dynamicGroupBindingsCompute += this.#createDynamicGroupBindingsUpdate(GPUShaderStage.COMPUTE, renderPass, 2));
        // dynamicGroupBindingsFragment += this.#createDynamicGroupBindingsUpdate(GPUShaderStage.FRAGMENT, renderPass, 2);


        renderPass.hasVertexShader && (colorsVertWGSL = dynamicGroupBindingsVertex + defaultStructs + defaultVertexBody + colorsVertWGSL);
        renderPass.hasComputeShader && (colorsComputeWGSL = dynamicGroupBindingsCompute + defaultStructs + colorsComputeWGSL);
        renderPass.hasFragmentShader && (colorsFragWGSL = dynamicGroupBindingsFragment + defaultStructs + colorsFragWGSL);
        console.groupCollapsed(`Render Pass ${index}: (${renderPass.name})`);
        console.groupCollapsed('VERTEX');
        console.log(colorsVertWGSL);
        console.groupEnd();
        if (renderPass.hasComputeShader) {
            console.groupCollapsed('COMPUTE');
            console.log(colorsComputeWGSL);
            console.groupEnd();
        }
        console.groupCollapsed('FRAGMENT');
        console.log(colorsFragWGSL);
        console.groupEnd();
        console.groupEnd();
        renderPass.hasVertexShader && (renderPass.compiledShaders.vertex = colorsVertWGSL);
        renderPass.hasComputeShader && (renderPass.compiledShaders.compute = colorsComputeWGSL);
        renderPass.hasFragmentShader && (renderPass.compiledShaders.fragment = colorsFragWGSL);
    }
    #generateDataSize = () => {
        const allShaders = this.#renderPasses.map(renderPass => {
            const { vertex, compute, fragment } = renderPass.compiledShaders;
            return vertex + compute + fragment;;
        }).join('\n');
        this.#dataSize = dataSize(allShaders);
        // since uniforms are in a sigle struct
        // this is only required for storage
        this.#storage.forEach(s => {
            if (!s.mapped) {
                if (isArray(s.structName)) {
                    const typeData = getArrayTypeData(s.structName, this.#dataSize);
                    s.structSize = typeData.size;
                } else {
                    const d = this.#dataSize.get(s.structName) || typeSizes[s.structName];
                    if (!d) {
                        throw `${s.structName} has not been defined.`
                    }
                    s.structSize = d.bytes || d.size;
                }
            }
        });
    }
    /**
     * One time function call to initialize the shaders.
     * @param {Array<RenderPass>} renderPasses Collection of {@link RenderPass}, which contain Vertex, Compute and Fragment shaders.
     * @returns {Boolean} false | undefined
     *
     * @example
     * await points.init(renderPasses)
     */
    async init(renderPasses) {
        this.#renderPasses = renderPasses.concat(this.#postRenderPasses);
        // initializing internal uniforms
        this.setUniform(UniformKeys.TIME, this.#time);
        this.setUniform(UniformKeys.DELTA, this.#delta);
        this.setUniform(UniformKeys.EPOCH, this.#epoch);
        this.setUniform(UniformKeys.SCREEN, [0, 0], 'vec2f');
        this.setUniform(UniformKeys.MOUSE, [0, 0], 'vec2f');
        this.setUniform(UniformKeys.MOUSE_CLICK, this.#mouseClick);
        this.setUniform(UniformKeys.MOUSE_DOWN, this.#mouseDown);
        this.setUniform(UniformKeys.MOUSE_WHEEL, this.#mouseWheel);
        this.setUniform(UniformKeys.MOUSE_DELTA, this.#mouseDelta, 'vec2f');
        let hasComputeShaders = this.#renderPasses.some(renderPass => renderPass.hasComputeShader);
        if (!hasComputeShaders && this.#bindingTextures.length) {
            throw ' `setBindingTexture` requires at least one Compute Shader in a `RenderPass`'
        }

        this.#renderPasses.forEach(r => r.init?.(this));
        this.#renderPasses.forEach(r => r.meshes.forEach(mesh => this.#setMeshUniform(mesh.name, mesh.id, 'u32')));
        this.#renderPasses.forEach(this.#compileRenderPass);
        this.#generateDataSize();
        //
        // let adapter = null;
        if (!this.#adapter) {
            try {
                this.#adapter = await navigator.gpu.requestAdapter();
            } catch (err) {
                console.log(err);
            }
        }
        if (!this.#adapter) { return false; }
        if (!this.#device) {
            this.#device = await this.#adapter.requestDevice();
            this.#device.label = (new Date()).getMilliseconds();
        }

        console.log(this.#device.limits);

        this.#device.lost.then(info => console.log(info));
        if (this.#canvas !== null) this.#context = this.#canvas.getContext('webgpu');
        this.#presentationFormat ||= navigator.gpu.getPreferredCanvasFormat();
        if (this.#canvasId) {
            if (this.#fitWindow) {
                this.#resizeCanvasToFitWindow();
            } else {
                this.#resizeCanvasToDefault();
            }
        }

        // this.#createVertexBuffer(new Float32Array(this.#vertexArray));
        // TODO: this should be inside RenderPass, to not call vertexArray outside
        this.#renderPasses.forEach(renderPass => {
            this.createScreen(renderPass);
            renderPass.vertexBufferInfo = new VertexBufferInfo(renderPass.vertexArray);
            renderPass.vertexBuffer = this.#createAndMapBuffer(renderPass.vertexArray, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
        })

        this.#createBuffers();
        this.#createPipeline();

        return true;
    }

    /**
     * Injects a render pass after all the render passes added by the user.
     * @param {RenderPass} renderPass
     * @param {Object} params
     */
    addRenderPass(renderPass, params) {
        if (this.renderPasses?.length) {
            throw '`addPostRenderPass` should be called prior `Points.init()`';
        }

        renderPass.params = params || {};

        const requiredNotFound = renderPass.required?.filter(i => !renderPass.params[i] && !Number.isInteger(renderPass.params[i]));

        if (requiredNotFound?.length) {
            const paramsRequired = requiredNotFound.join(', ');
            console.warn(`addRenderPass: (${renderPass.name}) parameters required: ${paramsRequired}`);
        }

        this.#postRenderPasses.push(renderPass);
        renderPass.init(this);
    }

    /**
     * Get the active list of {@link RenderPass}
     */
    get renderPasses() {
        return this.#renderPasses;
    }

    /**
     * Adds two triangles called points per number of columns and rows
     * @ignore
     */
    createScreen(renderPass) {
        if (renderPass.vertexArray.length !== 0) {
            return;
        }
        const hasVertexAndFragmentShader = this.#renderPasses.some(renderPass => renderPass.hasVertexAndFragmentShader)
        if (hasVertexAndFragmentShader) {
            let colors = [
                new RGBAColor(1, 0, 0),
                new RGBAColor(0, 1, 0),
                new RGBAColor(0, 0, 1),
                new RGBAColor(1, 1, 0),
            ];
            for (let xIndex = 0; xIndex < this.#numRows; xIndex++) {
                for (let yIndex = 0; yIndex < this.#numColumns; yIndex++) {
                    const coordinate = new Coordinate(xIndex * this.#canvas.clientWidth / this.#numColumns, yIndex * this.#canvas.clientHeight / this.#numRows, .3);
                    renderPass.addPoint(coordinate, this.#canvas.clientWidth / this.#numColumns, this.#canvas.clientHeight / this.#numRows, colors, this.#canvas);
                }
            }
        }
    }

    /**
     * @param {Float32Array} data
     * @param {GPUBufferUsageFlags} usage
     * @param {Boolean} mappedAtCreation
     * @param {Number} size
     * @returns {GPUBuffer} mapped buffer
     */
    #createAndMapBuffer(data, usage, mappedAtCreation = true, size = null) {
        const buffer = this.#device.createBuffer({
            mappedAtCreation: mappedAtCreation,
            size: size || data.byteLength,
            usage: usage,
        });
        new Float32Array(buffer.getMappedRange()).set(data);
        buffer.unmap();
        return buffer;
    }

    /**
     * It creates with size, not with data, so it's empty
     * @param {Number} size numItems * instanceByteSize ;
     * @param {GPUBufferUsageFlags} usage
     * @returns {GPUBuffer} buffer
     */
    #createBuffer(size, usage) {
        const buffer = this.#device.createBuffer({
            size: size,
            usage: usage,
        });
        return buffer
    }

    /**
     * To update a buffer instead of recreating it
     * @param {GPUBuffer} buffer
     * @param {Float32Array} values
     */
    #writeBuffer(buffer, values) {
        this.#device.queue.writeBuffer(
            buffer,
            0,
            new Float32Array(values)
        );
    }

    /**
     *
     * @param {Array} uniformsArray
     * @param {String} structName
     * @returns {{values:Float32Array, paramsDataSize:Object}}
     */
    #createUniformValues(uniformsArray, structName = 'Params') {
        const paramsDataSize = this.#dataSize.get(structName)
        const paddings = paramsDataSize.paddings;
        // we check the paddings list and add 0's to just the ones that need it
        const uniformsClone = structuredClone(uniformsArray);
        let arrayValues = uniformsClone.map(v => {
            const padding = paddings[v.name];
            if (padding) {
                if (v.value.constructor !== Array) {
                    v.value = [v.value];
                }
                for (let i = 0; i < padding; i++) {
                    v.value.push(0);
                }
            }
            return v.value;
        }).flat(1);
        const finalPadding = paddings[''];
        if (finalPadding) {
            for (let i = 0; i < finalPadding; i++) {
                arrayValues.push(0);
            }
        }
        return { values: new Float32Array(arrayValues), paramsDataSize };
    }

    #createParametersUniforms() {
        const { values, paramsDataSize } = this.#createUniformValues(this.#uniforms);
        this.#uniforms.buffer = this.#createAndMapBuffer(values, GPUBufferUsage.UNIFORM + GPUBufferUsage.COPY_DST, true, paramsDataSize.bytes);

        if (this.#meshUniforms.length) {
            const { values, paramsDataSize } = this.#createUniformValues(this.#meshUniforms);
            this.#meshUniforms.buffer = this.#createAndMapBuffer(values, GPUBufferUsage.UNIFORM + GPUBufferUsage.COPY_DST, true, paramsDataSize.bytes);
        }
    }

    /**
     * Updates all uniforms (for the update function)
     */
    #writeParametersUniforms() {
        if (!this.#uniforms.buffer) {
            console.error('An attempt to create uniforms has been made but no setUniform has been called. Maybe an update was called before a setUniform.')
        }
        const { values } = this.#createUniformValues(this.#uniforms);
        this.#writeBuffer(this.#uniforms.buffer, values);

        if (this.#meshUniforms.length) {
            const { values } = this.#createUniformValues(this.#meshUniforms);
            this.#writeBuffer(this.#meshUniforms.buffer, values);
        }
    }

    /**
     * Updates all the storages (for the update function)
     */
    #writeStorages() {
        this.#storage.forEach(storageItem => {
            // since audio is something constant
            // the stream flag allows to keep this write open
            const { updated, stream } = storageItem;
            if (storageItem.mapped && (updated || stream)) {
                const values = new Float32Array(storageItem.array);
                this.#writeBuffer(storageItem.buffer, values);
                if (!stream) {
                    storageItem.updated = false;
                }
            }
        });
    }

    /**
     * For each set of arrays with set* data, it creates their corresponding
     * buffer
     */
    #createBuffers() {
        //--------------------------------------------
        this.#createParametersUniforms();
        //--------------------------------------------
        this.#storage.forEach(storageItem => {
            let usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;
            if (storageItem.read) {
                let readStorageItem = {
                    name: storageItem.name,
                    size: storageItem.structSize
                }
                if (storageItem.mapped) {
                    readStorageItem = {
                        name: storageItem.name,
                        size: storageItem.array.length,
                    }
                }
                this.#readStorage.push(readStorageItem);
                usage = usage | GPUBufferUsage.COPY_SRC;
            }
            storageItem.usage = usage;
            if (storageItem.mapped) {
                const values = new Float32Array(storageItem.array);
                storageItem.buffer = this.#createAndMapBuffer(values, usage);
            } else {
                storageItem.buffer = this.#createBuffer(storageItem.structSize, usage);
            }
        });
        //--------------------------------------------
        this.#readStorage.forEach(readStorageItem => {
            readStorageItem.buffer = this.#device.createBuffer({
                size: readStorageItem.size,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
            });
        });
        //--------------------------------------------
        if (this.#layers.length) {
            //let layerValues = [];
            let layersSize = 0;
            this.#layers.forEach(layerItem => {
                layersSize += layerItem.size * layerItem.structSize;
            });
            this.#layers.buffer = this.#createBuffer(layersSize, GPUBufferUsage.STORAGE);
        }
        //--------------------------------------------
        this.#samplers.forEach(sampler => sampler.resource = this.#device.createSampler(sampler.descriptor));
        //--------------------------------------------
        this.#texturesStorage2d.forEach(textureStorage2d => {
            textureStorage2d.texture = this.#device.createTexture({
                label: `_createBuffers, texturesStorage2d: ${textureStorage2d.name}`,
                size: this.#presentationSize,
                format: 'rgba8unorm',
                usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
            });
        });
        //--------------------------------------------
        this.#textures2d.forEach(texture2d => {
            if (texture2d.imageTexture) {
                const imageBitmap = texture2d.imageTexture.bitmap;
                const cubeTexture = this.#device.createTexture({
                    label: `_createBuffers, textures2d: ${texture2d.name}`,
                    size: [imageBitmap.width, imageBitmap.height, 1],
                    format: 'rgba8unorm',
                    usage:
                        GPUTextureUsage.TEXTURE_BINDING |
                        GPUTextureUsage.COPY_SRC |
                        GPUTextureUsage.COPY_DST |
                        GPUTextureUsage.RENDER_ATTACHMENT,
                });
                this.#device.queue.copyExternalImageToTexture(
                    { source: imageBitmap },
                    { texture: cubeTexture },
                    [imageBitmap.width, imageBitmap.height]
                );
                texture2d.texture = cubeTexture;
                // } else if (texture2d.copyCurrentTexture) {
            } else {
                this.#createTextureBindingToCopy(texture2d);
            }
        });
        //--------------------------------------------
        // this.#texturesDepth2d.forEach(texture2d => this.#createTextureDepth(texture2d));
        this.#texturesDepth2d.forEach(texture2d => texture2d.texture = this.#depthTexture);
        //--------------------------------------------
        this.#textures2dArray.forEach(texture2dArray => {
            if (texture2dArray.imageTextures) {
                let cubeTexture;
                const imageBitmaps = texture2dArray.imageTextures.bitmaps;
                cubeTexture = this.#device.createTexture({
                    label: `_createBuffers cubeTexture texture2dArray: ${texture2dArray.name}`,
                    size: [imageBitmaps[0].width, imageBitmaps[0].height, imageBitmaps.length],
                    format: 'rgba8unorm',
                    usage:
                        GPUTextureUsage.TEXTURE_BINDING |
                        GPUTextureUsage.COPY_DST |
                        GPUTextureUsage.RENDER_ATTACHMENT,
                });
                imageBitmaps.forEach((imageBitmap, i) => {
                    this.#device.queue.copyExternalImageToTexture(
                        { source: imageBitmap },
                        { texture: cubeTexture, origin: { x: 0, y: 0, z: i } },
                        [imageBitmap.width, imageBitmap.height, 1]
                    );
                })

                texture2dArray.texture = cubeTexture;
            } else {
                this.#createTextureBindingToCopy(texture2dArray);
            }
        });
        //--------------------------------------------
        this.#texturesExternal.forEach(externalTexture => {
            externalTexture.texture = this.#device.importExternalTexture({
                label: `_createBuffers, externalTexture: ${externalTexture.name}`,
                source: externalTexture.video
            });
        });
        //--------------------------------------------
        this.#bindingTextures.forEach(bindingTexture => {
            bindingTexture.texture = this.#device.createTexture({
                label: `_createBuffers, bindingTexture: ${bindingTexture.name}`,
                size: bindingTexture.size || this.#presentationSize,
                format: 'rgba8unorm',
                usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
            });
        });
    }

    #createTextureBindingToCopy(texture2d) {
        texture2d.texture = this.#device.createTexture({
            label: texture2d.name,
            size: this.#presentationSize,
            format: this.#presentationFormat, // if 'depth24plus' throws error
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
    }

    #createTextureDepth(texture2d) {
        texture2d.texture = this.#device.createTexture({
            label: texture2d.name,
            size: this.#presentationSize,
            format: 'depth32float',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });
    }

    #createTextureToSize(texture2d, width, height) {
        texture2d.texture = this.#device.createTexture({
            label: texture2d.name,
            size: [width, height],
            format: this.#presentationFormat, // if 'depth24plus' throws error
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
    }

    #createPipeline() {
        this.#renderPasses.forEach((renderPass, index) => {
            if (renderPass.hasComputeShader) {
                this.#createBindGroup(renderPass, GPUShaderStage.COMPUTE);
                renderPass.computePipeline = this.#device.createComputePipeline({
                    layout: this.#device.createPipelineLayout({
                        bindGroupLayouts: [renderPass.bindGroupLayoutCompute]
                    }),
                    label: `_createPipeline() - ${index}`,
                    compute: {
                        module: this.#device.createShaderModule({
                            code: renderPass.compiledShaders.compute
                        }),
                        entryPoint: 'main'
                    }
                });
            }

            //--------------------------------------

            if (renderPass.hasVertexAndFragmentShader) {
                this.#createBindGroup(renderPass, GPUShaderStage.VERTEX);
                this.#createBindGroup(renderPass, GPUShaderStage.FRAGMENT);
                let depthStencil = undefined;
                if (renderPass.depthWriteEnabled) {
                    depthStencil = {
                        depthWriteEnabled: renderPass.depthWriteEnabled,
                        depthCompare: 'less',
                        format: 'depth32float',
                    }
                }
                renderPass.renderPipeline = this.#device.createRenderPipeline({
                    label: `render pipeline: renderPass ${renderPass.index} (${renderPass.name})`,
                    // layout: 'auto',
                    layout: this.#device.createPipelineLayout({
                        bindGroupLayouts: [renderPass.bindGroupLayoutVertex, renderPass.bindGroupLayoutFragment]
                    }),
                    //primitive: { topology: 'triangle-strip' },
                    primitive: { topology: renderPass.topology, cullMode: renderPass.cullMode, frontFace: renderPass.frontFace },
                    depthStencil,
                    vertex: {
                        module: this.#device.createShaderModule({
                            code: renderPass.compiledShaders.vertex,
                        }),
                        entryPoint: 'main', // shader function name
                        buffers: [
                            {
                                arrayStride: renderPass.vertexBufferInfo.vertexSize,
                                attributes: [
                                    {
                                        // position
                                        shaderLocation: 0,
                                        offset: renderPass.vertexBufferInfo.vertexOffset,
                                        format: 'float32x4',
                                    },
                                    {
                                        // colors
                                        shaderLocation: 1,
                                        offset: renderPass.vertexBufferInfo.colorOffset,
                                        format: 'float32x4',
                                    },
                                    {
                                        // uv
                                        shaderLocation: 2,
                                        offset: renderPass.vertexBufferInfo.uvOffset,
                                        format: 'float32x2',
                                    },
                                    {
                                        // normals
                                        shaderLocation: 3,
                                        offset: renderPass.vertexBufferInfo.normalOffset,
                                        format: 'float32x3',
                                    },
                                    {
                                        // id
                                        shaderLocation: 4,
                                        offset: renderPass.vertexBufferInfo.idOffset,
                                        format: 'uint32',
                                    },
                                ],
                            },
                        ],
                    },
                    fragment: {
                        module: this.#device.createShaderModule({
                            code: renderPass.compiledShaders.fragment,
                        }),
                        entryPoint: 'main', // shader function name
                        targets: [
                            {
                                format: this.#presentationFormat,
                                blend: {
                                    alpha: {
                                        srcFactor: 'src-alpha',
                                        dstFactor: 'one-minus-src-alpha',
                                        operation: 'add'
                                    },
                                    color: {
                                        srcFactor: 'src-alpha',
                                        dstFactor: 'one-minus-src-alpha',
                                        operation: 'add'
                                    },
                                },
                                writeMask: GPUColorWrite.ALL,
                            },
                        ],
                    },
                });
            }
        });
    }
    /**
     * Creates the entries for the pipeline
     * @returns an array with the entries
     */
    #createEntries(shaderType, { index: renderPassIndex, internal }) {
        let entries = [];
        let bindingIndex = 0;
        if (this.#uniforms.length) {
            // TODO: 1262
            // if you remove this there's an error that I think is not explained right
            // it talks about a storage in index 1 but it was actually the 0
            // and so is to this uniform you have to change the visibility
            // not remove the type and leaving it empty as it seems you have to do here:
            // https://gpuweb.github.io/gpuweb/#bindgroup-examples
            // originally:
            // if (entry.buffer?.type === 'uniform') {
            //     entry.visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT
            // }
            // the call is split here and at the end of the method with the foreach |= assignment
            // const visibility = shaderType === GPUShaderStage.FRAGMENT ? GPUShaderStage.VERTEX : null;
            entries.push(
                {
                    binding: bindingIndex++,
                    resource: {
                        label: 'uniform',
                        buffer: this.#uniforms.buffer
                    },
                    buffer: {
                        type: 'uniform'
                    },
                    // visibility
                }
            );
        }
        if (this.#meshUniforms.length) {
            entries.push(
                {
                    binding: bindingIndex++,
                    resource: {
                        label: 'uniform',
                        buffer: this.#meshUniforms.buffer
                    },
                    buffer: {
                        type: 'uniform'
                    },
                    // visibility
                }
            );
        }
        this.#storage.forEach(storageItem => {
            const isInternal = internal === storageItem.internal;
            if (isInternal && (!storageItem.shaderType || storageItem.shaderType & shaderType)) {

                let type = getStorageAccessMode(shaderType, storageItem.shaderType);
                type = entriesModes[type];

                entries.push(
                    {
                        binding: bindingIndex++,
                        resource: {
                            label: 'storage',
                            buffer: storageItem.buffer
                        },
                        buffer: {
                            type
                        },
                        // visibility
                    }
                );
            }
        });
        if (this.#layers.length) {
            if (!this.#layers.shaderType || this.#layers.shaderType & shaderType) {
                entries.push(
                    {
                        binding: bindingIndex++,
                        resource: {
                            label: 'layer',
                            buffer: this.#layers.buffer
                        },
                        buffer: {
                            type: 'storage'
                        }
                    }
                );
            }
        }
        this.#samplers.forEach(sampler => {
            const isInternal = internal === sampler.internal;
            if (isInternal && (!sampler.shaderType || sampler.shaderType & shaderType)) {
                entries.push(
                    {
                        binding: bindingIndex++,
                        resource: sampler.resource,
                        sampler: {
                            type: sampler.descriptor.compare ? 'comparison' : 'filtering'
                        }
                    }
                );
            }
        });
        this.#texturesStorage2d.forEach(textureStorage2d => {
            const isInternal = internal === textureStorage2d.internal;
            if (isInternal && (!textureStorage2d.shaderType || textureStorage2d.shaderType & shaderType)) {
                entries.push(
                    {
                        label: 'texture storage 2d',
                        binding: bindingIndex++,
                        resource: textureStorage2d.texture.createView(),
                        storageTexture: {
                            type: 'write-only'
                        }
                    }
                );
            }
        });
        this.#textures2d.forEach(texture2d => {
            const isInternal = internal === texture2d.internal;
            if (isInternal && (!texture2d.shaderType || texture2d.shaderType & shaderType)) {
                entries.push(
                    {
                        label: 'texture 2d',
                        binding: bindingIndex++,
                        resource: texture2d.texture.createView(),
                        texture: {
                            type: 'float'
                        }
                    }
                );
            }
        });
        this.#texturesDepth2d.forEach(texture2d => {
            if (texture2d.renderPassIndex !== renderPassIndex) {
                const isInternal = internal === texture2d.internal;
                if (isInternal && (!texture2d.shaderType || texture2d.shaderType & shaderType)) {
                    entries.push(
                        {
                            label: 'texture depth 2d',
                            binding: bindingIndex++,
                            resource: this.#depthTexture.createView(),
                            texture: {
                                sampleType: 'depth',
                                viewDimension: '2d',
                                multisampled: false,
                            }
                        }
                    );
                }
            }
        });
        this.#textures2dArray.forEach(texture2dArray => {
            const isInternal = internal === texture2dArray.internal;
            if (isInternal && (!texture2dArray.shaderType || texture2dArray.shaderType & shaderType)) {
                entries.push(
                    {
                        label: 'texture 2d array',
                        binding: bindingIndex++,
                        resource: texture2dArray.texture.createView({
                            dimension: '2d-array',
                            baseArrayLayer: 0,
                            arrayLayerCount: texture2dArray.imageTextures.bitmaps.length
                        }),
                        texture: {
                            type: 'float',
                            viewDimension: '2d-array'
                        }
                    }
                );
            }
        });
        this.#texturesExternal.forEach(externalTexture => {
            const isInternal = internal === externalTexture.internal;
            if (isInternal && (!externalTexture.shaderType || externalTexture.shaderType & shaderType)) {
                entries.push(
                    {
                        label: 'external texture',
                        binding: bindingIndex++,
                        resource: externalTexture.texture,
                        externalTexture: {
                            // type: 'write-only'
                        }
                    }
                );
            }
        });
        // TODO: repeated entry blocks
        this.#bindingTextures.forEach(bindingTexture => {
            const { usesRenderPass } = bindingTexture;
            if (usesRenderPass) {
                if (GPUShaderStage.VERTEX === shaderType) { // to avoid binding texture in vertex
                    return;
                }
                if (bindingTexture.read.renderPassIndex === renderPassIndex) {
                    entries.push(
                        {
                            label: `binding texture 2: name: ${bindingTexture.read.name}`,
                            binding: bindingIndex++,
                            resource: bindingTexture.texture.createView(),
                            texture: {
                                type: 'float'
                            }
                        }
                    );
                }
                if (bindingTexture.write.renderPassIndex === renderPassIndex) {
                    entries.push(
                        {
                            label: `binding texture: name: ${bindingTexture.write.name}`,
                            binding: bindingIndex++,
                            resource: bindingTexture.texture.createView(),
                            storageTexture: {
                                type: 'write-only',
                                format: 'rgba8unorm'
                            }
                        }
                    );
                }
                return;
            }

            const isInternal = internal === bindingTexture.internal;
            if (isInternal && (bindingTexture.read.shaderType & shaderType)) {
                entries.push(
                    {
                        label: `binding texture 2: name: ${bindingTexture.read.name}`,
                        binding: bindingIndex++,
                        resource: bindingTexture.texture.createView(),
                        texture: {
                            type: 'float'
                        }
                    }
                );
            }

            if (isInternal && (bindingTexture.write.shaderType & shaderType)) {
                entries.push(
                    {
                        label: `binding texture: name: ${bindingTexture.write.name}`,
                        binding: bindingIndex++,
                        resource: bindingTexture.texture.createView(),
                        storageTexture: {
                            type: 'write-only',
                            format: 'rgba8unorm'
                        }
                    }
                );
            }
        });

        entries.forEach(entry => entry.visibility = shaderType);

        return entries;
    }

    #createEntriesUpdate(shaderType, { index: renderPassIndex, internal }) {
        let entries = [];
        let bindingIndex = 0;
        this.#texturesExternal.forEach(externalTexture => {
            const isInternal = internal === externalTexture.internal;
            if (isInternal && (!externalTexture.shaderType || externalTexture.shaderType & shaderType)) {
                entries.push(
                    {
                        label: 'external texture',
                        binding: bindingIndex++,
                        resource: externalTexture.texture,
                        externalTexture: {
                            // type: 'write-only'
                        }
                    }
                );
            }
        });
        entries.forEach(entry => entry.visibility = shaderType);

        return entries;
    }

    /**
     * This was originally 3 methods, one per GPUShaderStage.
     * This might seem a bit more complicated but I wanted to have everything
     * in a single method to avoid duplication and possible bifurcations without
     * me knowing.
     * @param {RenderPass} renderPass
     * @param {GPUShaderStage} shaderType
     */
    #createBindGroup(renderPass, shaderType) {
        const hasComputeShader = (shaderType === GPUShaderStage.COMPUTE) && renderPass.hasComputeShader;
        const hasVertexShader = (shaderType === GPUShaderStage.VERTEX) && renderPass.hasVertexShader;
        const hasFragmentShader = (shaderType === GPUShaderStage.FRAGMENT) && renderPass.hasFragmentShader;

        const entries = this.#createEntries(shaderType, renderPass);

        if (entries.length) {
            const bindGroupLayout = this.#device.createBindGroupLayout({ entries });
            const bindGroup = this.#device.createBindGroup({
                label: `_createBindGroup a ${shaderType} - ${renderPass.name}`,
                layout: bindGroupLayout,
                entries
            });

            if (hasComputeShader) {
                renderPass.bindGroupLayoutCompute = bindGroupLayout;
                renderPass.computeBindGroup = bindGroup
            }
            if (hasVertexShader) {
                renderPass.bindGroupLayoutVertex = bindGroupLayout;
                renderPass.vertexBindGroup = bindGroup
            }
            if (hasFragmentShader) {
                renderPass.bindGroupLayoutFragment = bindGroupLayout;
                renderPass.fragmentBindGroup = bindGroup
            }

            // const entriesUpdate = this.#createEntriesUpdate(shaderType, renderPass);
            // const bindGroup2 = this.#device.createBindGroup({
            //     label: `_createBindGroup b ${shaderType} - ${renderPass.name}`,
            //     layout: bindGroupLayout,
            //     entries: entriesUpdate
            // });
            // renderPass.updateBindgroup = bindGroup2
        }

    }

    /**
     * This is a slimmed down version of {@link #createBindGroup}.
     * We don't create the bindGroupLayout since it already exists.
     * We do update the entries. We have to update them because of
     * changing textures like videos.
     * TODO: this can be optimized even further by setting a flag to
     * NOT CALL the createBindGroup if the texture (video/other)
     * is not being updated at all. I have to make the createBindGroup call
     * only if the texture is updated.
     * @param {RenderPass} renderPass
     * @param {GPUShaderStage} shaderType
     */
    #passBindGroup(renderPass, shaderType) {
        const hasComputeShader = (shaderType === GPUShaderStage.COMPUTE) && renderPass.hasComputeShader;
        const hasVertexShader = (shaderType === GPUShaderStage.VERTEX) && renderPass.hasVertexShader;
        const hasFragmentShader = (shaderType === GPUShaderStage.FRAGMENT) && renderPass.hasFragmentShader;

        const entries = this.#createEntries(shaderType, renderPass);

        if (entries.length) {
            let bindGroupLayout = null;

            if (hasComputeShader) {
                bindGroupLayout = renderPass.bindGroupLayoutCompute;
            }
            if (hasVertexShader) {
                bindGroupLayout = renderPass.bindGroupLayoutVertex;
            }
            if (hasFragmentShader) {
                bindGroupLayout = renderPass.bindGroupLayoutFragment;
            }

            const bindGroup = this.#device.createBindGroup({
                label: `_passBindGroup 0`,
                layout: bindGroupLayout,
                entries
            });

            if (hasComputeShader) {
                renderPass.computeBindGroup = bindGroup
            }
            if (hasVertexShader) {
                renderPass.vertexBindGroup = bindGroup
            }
            if (hasFragmentShader) {
                renderPass.fragmentBindGroup = bindGroup
            }


            // const entriesUpdate = this.#createEntriesUpdate(shaderType, renderPass);
            // if (entriesUpdate.length) {
            //     const bindGroup = this.#device.createBindGroup({
            //         label: `passBindGroup ${shaderType} - ${renderPass.name}`,
            //         layout: bindGroupLayout,
            //         entries: entriesUpdate
            //     });
            //     renderPass.updateBindgroup = bindGroup
            // }


        }
    }

    /**
     * Method executed on each {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame | requestAnimationFrame}.
     * Here's where all the calls to update data will be executed.
     * @example
     * await points.init(renderPasses);
     * update();
     *
     * function update() {
     *     points.update();
     *     requestAnimationFrame(update);
     * }
     */
    async update() {
        if (!this.#canvas || !this.#device) return;
        //--------------------------------------------
        this.#delta = this.#clock.getDelta();
        this.#time = this.#clock.time;
        this.#epoch = +new Date() / 1000;
        this.setUniform(UniformKeys.TIME, this.#time);
        this.setUniform(UniformKeys.DELTA, this.#delta);
        this.setUniform(UniformKeys.EPOCH, this.#epoch);
        this.setUniform(UniformKeys.SCREEN, [this.#canvas.width, this.#canvas.height]);
        this.setUniform(UniformKeys.MOUSE, [this.#mouseX, this.#mouseY]);
        this.setUniform(UniformKeys.MOUSE_CLICK, this.#mouseClick);
        this.setUniform(UniformKeys.MOUSE_DOWN, this.#mouseDown);
        this.setUniform(UniformKeys.MOUSE_WHEEL, this.#mouseWheel);
        this.setUniform(UniformKeys.MOUSE_DELTA, this.#mouseDelta);
        //--------------------------------------------
        this.#writeParametersUniforms();
        this.#writeStorages();
        // AUDIO
        // this.#analyser.getByteTimeDomainData(this.#dataArray);
        this.#sounds.forEach(sound => sound.analyser?.getByteFrequencyData(sound.data));
        // END AUDIO
        this.#texturesExternal.forEach(externalTexture => {
            externalTexture.texture = this.#device.importExternalTexture({
                label: `update, externalTexture: ${externalTexture.name}`,
                source: externalTexture.video
            });
            if ('requestVideoFrameCallback' in externalTexture.video) {
                externalTexture.video.requestVideoFrameCallback(_ => { });
            }
        });

        /**
         * @type {GPUCommandEncoder}
         */
        const commandEncoder = this.#device.createCommandEncoder();

        // ---------------------
        const swapChainTexture = this.#context.getCurrentTexture();

        this.#renderPasses.forEach(renderPass => {
            if (renderPass.hasVertexAndFragmentShader) {
                renderPass.descriptor.colorAttachments[0].view = swapChainTexture.createView();
                if (renderPass.depthWriteEnabled && (!renderPass.descriptor.depthStencilAttachment.view || this.#screenResized)) {
                    renderPass.descriptor.depthStencilAttachment.view = this.#depthTexture.createView();
                }

                const isSameDevice = this.#device === renderPass.device;

                // texturesExternal means there's a video
                // if there's a video it needs to be updated no matter what.
                // Also, it needs to be updated if the screen size changes
                if (!isSameDevice || !renderPass.bundle || this.#texturesExternal.length || this.#screenResized || this.#textureUpdated) {
                    this.#passBindGroup(renderPass, GPUShaderStage.FRAGMENT);
                    this.#passBindGroup(renderPass, GPUShaderStage.VERTEX);
                    /** @type {GPURenderBundleEncoderDescriptor} */
                    const bundleEncoderDescriptor = {
                        colorFormats: [this.#presentationFormat],
                        sampleCount: 1
                    }

                    if (renderPass.depthWriteEnabled) {
                        bundleEncoderDescriptor.depthStencilFormat = 'depth32float'
                    }

                    /** @type {GPURenderBundleEncoder} */
                    const bundleEncoder = this.#device.createRenderBundleEncoder(bundleEncoderDescriptor);

                    bundleEncoder.setPipeline(renderPass.renderPipeline);

                    if (this.#uniforms.length) {
                        bundleEncoder.setBindGroup(0, renderPass.vertexBindGroup);
                        bundleEncoder.setBindGroup(1, renderPass.fragmentBindGroup);
                    }
                    bundleEncoder.setVertexBuffer(0, renderPass.vertexBuffer);

                    // TODO: move this to renderPass because we can ask this just one time and have it as property
                    const isThereInstancing = renderPass.meshes.some(mesh => mesh.instanceCount > 1);
                    if (isThereInstancing) {
                        let vertexOffset = 0;
                        renderPass.meshes.forEach(mesh => {
                            bundleEncoder.draw(mesh.verticesCount, mesh.instanceCount, vertexOffset, 0);
                            vertexOffset = mesh.verticesCount;
                        })
                    } else {
                        // no instancing, regular draw with all the meshes
                        bundleEncoder.draw(renderPass.vertexBufferInfo.vertexCount, 1);
                    }
                    renderPass.bundle = bundleEncoder.finish();
                    renderPass.device = this.#device;
                }

                const passEncoder = commandEncoder.beginRenderPass(renderPass.descriptor);
                // passEncoder.setBindGroup(1, renderPass.updateBindgroup);
                passEncoder.executeBundles([renderPass.bundle]);
                passEncoder.end();


                // Copy the rendering results from the swapchain into |texture2d.texture|.
                this.#textures2d.forEach(texture2d => {
                    if (texture2d.renderPassIndex === renderPass.index || (!texture2d.renderPassIndex && texture2d.renderPassIndex !== 0)) {
                        if (texture2d.copyCurrentTexture) {
                            commandEncoder.copyTextureToTexture(
                                {
                                    texture: swapChainTexture,
                                },
                                {
                                    texture: texture2d.texture,
                                },
                                this.#presentationSize
                            );
                        }
                    }
                });
                this.#texturesToCopy.forEach(texturePair => {
                    // this.#createTextureToSize(texturePair.b, texturePair.a.width, texturePair.a.height);
                    commandEncoder.copyTextureToTexture(
                        {
                            texture: texturePair.a,
                        },
                        {
                            texture: texturePair.b,
                        },
                        [texturePair.a.width, texturePair.a.height]
                    );
                });
                this.#texturesToCopy = [];
            }
            if (renderPass.hasComputeShader) {
                if (this.#texturesExternal.length || !renderPass.computeBindGroup) {
                    this.#passBindGroup(renderPass, GPUShaderStage.COMPUTE);
                }

                const passEncoder = commandEncoder.beginComputePass();
                passEncoder.setPipeline(renderPass.computePipeline);
                if (this.#uniforms.length) {
                    passEncoder.setBindGroup(0, renderPass.computeBindGroup);
                }
                passEncoder.dispatchWorkgroups(
                    renderPass.workgroupCountX,
                    renderPass.workgroupCountY,
                    renderPass.workgroupCountZ
                );
                passEncoder.end();
            }
        });
        this.#screenResized = false;
        this.#textureUpdated = false;


        // let descriptor0 = null;
        // const group0 = this.#renderPasses.map(renderPass => {
        //     if(renderPass.depthWriteEnabled){
        //         descriptor0 = renderPass.descriptor
        //         return renderPass.bundle
        //     }
        // })
        // if(descriptor0){
        //     const passEncoder0 = commandEncoder.beginRenderPass(descriptor0);
        //     passEncoder0.executeBundles(group0);
        //     passEncoder0.end();
        // }


        // let descriptor1 = null;
        // const group1 = this.#renderPasses.map(renderPass => {
        //     if(!renderPass.depthWriteEnabled){
        //         descriptor1 = renderPass.descriptor
        //         return renderPass.bundle
        //     }
        // })
        // if(descriptor1){
        //     const passEncoder1 = commandEncoder.beginRenderPass(descriptor1);
        //     passEncoder1.executeBundles(group1);
        //     passEncoder1.end();
        // }





        this.#readStorage.forEach(readStorageItem => {
            let storageItem = this.#storage.find(storageItem => storageItem.name === readStorageItem.name);
            commandEncoder.copyBufferToBuffer(
                storageItem.buffer /* source buffer */,
                0 /* source offset */,
                readStorageItem.buffer /* destination buffer */,
                0 /* destination offset */,
                readStorageItem.buffer.size /* size */
            );
        });
        // ---------------------
        this.#commandsFinished.push(commandEncoder.finish());
        this.#device.queue.submit(this.#commandsFinished);
        this.#commandsFinished = [];
        //
        //this.#vertexArray = [];
        // reset mouse values because it doesn't happen by itself
        this.#mouseClick = false;
        this.#mouseWheel = false;
        this.#mouseDelta = [0, 0];
        await this.read();
    }
    async read() {
        for (const [key, event] of this.#events) {
            const { name } = event;
            const eventRead = await this.readStorage(name);
            if (eventRead) {
                const id = eventRead[0];
                if (id != 0) {
                    const dataRead = await this.readStorage(`${name}_data`)
                    event?.callback(dataRead);
                    const storageToUpdate = this.#nameExists(this.#storage, name);
                    const data = storageToUpdate.array;
                    data[0] = 0;
                    this.setStorageMap(name, data);
                }
            }
        }
    }

    /**
     * Reference to the canvas assigned in the constructor
     * @type {HTMLCanvasElement}
     */
    get canvas() {
        return this.#canvas;
    }

    /**
     * @type {GPUDevice}
     */
    get device() {
        return this.#device;
    }
    get context() {
        return this.#context;
    }
    get presentationFormat() {
        return this.#presentationFormat;
    }
    get buffer() {
        return this.#buffer;
    }
    get fullscreen() {
        return this.#fullscreen;
    }

    /**
     * Triggers the app to run in full screen mode
     * @type {Boolean}
     *
     * @example
     * points.fullscreen = true
     */
    set fullscreen(value) {
        if (value) {
            this.#lastFitWindow = this.#fitWindow;
            this.fitWindow = value;
            this.#canvas.requestFullscreen().catch(err => {
                throw `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`;
            });
            this.#fullscreen = true;
        } else {
            document.exitFullscreen();
            this.#fullscreen = false;
            this.#resizeCanvasToDefault();
        }
    }

    /**
     * If the canvas has a fixed size e.g. `800x800`, `fitWindow` will fill
     * the available window space.
     * @param {Boolean} value
     * @throws {String} {@link Points#init} has not been called
     *
     * @example
     *  if (await points.init(renderPasses)) {
     *      points.fitWindow = isFitWindowData.isFitWindow;
     *      update();
     *  }
     */
    set fitWindow(value) {
        if (!this.#context) {
            throw 'fitWindow must be assigned after Points.init() call or you don\'t have a Canvas assigned in the constructor';
        }
        this.#fitWindow = value;
        if (this.#fitWindow) {
            this.#resizeCanvasToFitWindow();
        } else {
            this.#resizeCanvasToDefault();
        }
    }

    get presentationFormat() {
        return this.#presentationFormat;
    }

    /**
     * Set the maximum range the render textures can hold.
     * If you need HDR values use `16` or `32` float formats.
     * This value is used in the texture that is created when a fragment shader
     * returns its data, so if you use a `vec4` that goes beyond the default
     * capped of `0..1` like `vec4(16,0,1,1)`, then use `16` or `32`.
     *
     * By default it has the `navigator.gpu.getPreferredCanvasFormat();` value.
     * @param {PresentationFormat|String|GPUTextureFormat} value
     */
    set presentationFormat(value) {
        this.#presentationFormat = value;
    }

    destroy() {

        this.#uniforms = new UniformsArray();
        this.#meshUniforms = new UniformsArray();

        this.#texturesExternal.forEach(textureExternal => {
            const stream = textureExternal?.video.srcObject;
            stream?.getTracks().forEach(track => track.stop());
        })
    }
}

export default Points;
export { RenderPass, RenderPasses, PrimitiveTopology, LoadOp, PresentationFormat };
