import UniformKeys from './UniformKeys.js';
import VertexBufferInfo from './VertexBufferInfo.js';
import ShaderType from './ShaderType.js';
import RenderPass from './RenderPass.js';
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
    #device = null;
    #context = null;
    #presentationFormat = null;
    #renderPasses = null;
    #postRenderPasses = [];
    #vertexBufferInfo = null;
    #buffer = null;
    #internal = false;
    #presentationSize = null;
    #depthTexture = null;
    #vertexArray = [];
    #numColumns = 1;
    #numRows = 1;
    #commandsFinished = [];
    #renderPassDescriptor = null;
    #uniforms = new UniformsArray();
    #storage = [];
    #readStorage = [];
    #samplers = [];
    #textures2d = [];
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
            document.addEventListener("fullscreenchange", e => {
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
        if (this.#fitWindow) {
            const { offsetWidth, offsetHeight } = this.#canvas.parentNode;
            this.#canvas.width = offsetWidth;
            this.#canvas.height = offsetHeight;
            this.#setScreenSize();
        }
    }

    #resizeCanvasToDefault = () => {
        this.#canvas.width = this.#originalCanvasWidth;
        this.#canvas.height = this.#originalCanvasHeigth;
        this.#setScreenSize();
    }

    #setScreenSize = () => {
        this.#presentationSize = [
            this.#canvas.clientWidth,
            this.#canvas.clientHeight,
        ];
        this.#context.configure({
            device: this.#device,
            format: this.#presentationFormat,
            //size: this.#presentationSize,
            width: this.#canvas.clientWidth,
            height: this.#canvas.clientHeight,
            alphaMode: 'premultiplied',
            // Specify we want both RENDER_ATTACHMENT and COPY_SRC since we
            // will copy out of the swapchain texture.
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        });
        this.#depthTexture = this.#device.createTexture({
            size: this.#presentationSize,
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
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
        let uniformToUpdate = this.#nameExists(this.#uniforms, name);
        if (uniformToUpdate && structName) {
            // if name exists is an update
            throw '`setUniform()` can\'t set the structName of an already defined uniform.';
        }
        if (uniformToUpdate) {
            uniformToUpdate.value = value;
            return;
        }
        if (structName && isArray(structName)) {
            throw `${structName} is an array, which is currently not supported for Uniforms.`;
        }
        const uniform = {
            name: name,
            value: value,
            type: structName,
            size: null,
            internal: this.#internal
        }
        this.#uniforms.push(uniform);
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
     * Creates a persistent memory buffer across every frame call. See [GPUBuffer](https://www.w3.org/TR/webgpu/#gpubuffer)
     * <br>
     * Meaning it can be updated in the shaders across the execution of every frame.
     * <br>
     * It can have almost any type, like `f32` or `vec2f` or even array<f32>.
     * @param {string} name Name that the Storage will have in the shader
     * @param {string} structName Name of the struct already existing on the
     * shader. This will be the type of the Storage.
     * @param {boolean} read if this is going to be used to read data back
     * @param {ShaderType} shaderType this tells to what shader the storage is bound
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
    setStorage(name, structName, read, shaderType, arrayData) {
        if (this.#nameExists(this.#storage, name)) {
            throw `\`setStorage()\` You have already defined \`${name}\``;
        }
        const storage = {
            mapped: !!arrayData,
            name: name,
            structName: structName,
            // structSize: null,
            shaderType: shaderType,
            read: read,
            buffer: null,
            internal: this.#internal
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
     * @param {Uint8Array<ArrayBuffer>} arrayData array with the data that must match the struct.
     * @param {string} structName Name of the struct already existing on the
     * shader. This will be the type of the Storage.
     * @param {boolean} read if this is going to be used to read data back.
     * @param {ShaderType} shaderType this tells to what shader the storage is bound
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
    setStorageMap(name, arrayData, structName, read = false, shaderType = null) {
        const storageToUpdate = this.#nameExists(this.#storage, name)
        if (storageToUpdate) {
            storageToUpdate.array = arrayData;
            return storageToUpdate;
        }
        const storage = {
            mapped: true,
            name: name,
            structName: structName,
            shaderType: shaderType,
            array: arrayData,
            buffer: null,
            read: read,
            internal: this.#internal
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
     * @param {ShaderType} shaderType
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
                buffer: null,
                internal: this.#internal
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
            internal: this.#internal
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
            name: name,
            copyCurrentTexture: copyCurrentTexture,
            shaderType: shaderType,
            texture: null,
            renderPassIndex: renderPassIndex,
            internal: this.#internal
        }
        this.#textures2d.push(texture2d);
        return texture2d;
    }


    copyTexture(nameTextureA, nameTextureB) {
        const texture2d_A = this.#nameExists(this.#textures2d, nameTextureA);
        const texture2d_B = this.#nameExists(this.#textures2d, nameTextureB);
        if (!(texture2d_A && texture2d_B)) {
            console.error('One of the textures does not exist.');
        }
        const a = texture2d_A.texture;
        const cubeTexture = this.#device.createTexture({
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
     * @param {ShaderType} shaderType in what shader type it will exist only
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
            texture2dToUpdate.imageTexture.bitmap = imageBitmap;
            const cubeTexture = this.#device.createTexture({
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
            imageTexture: {
                bitmap: imageBitmap
            },
            internal: this.#internal
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
     * @param {String} shaderType
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
     * @param {ShaderType} shaderType
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
            console.log(path);
            const response = await fetch(path);
            const blob = await response.blob();
            imageBitmaps.push(await createImageBitmap(blob));
        }
        this.#textures2dArray.push({
            name: name,
            copyCurrentTexture: false,
            shaderType: shaderType,
            texture: null,
            imageTextures: {
                bitmaps: imageBitmaps
            },
            internal: this.#internal,
        });
    }

    /**
     * Loads a video as `texture_external`and then
     * it will be available to read data from in the shaders.
     * Supports web formats like mp4 and webm.
     * @param {string} name id of the wgsl variable in the shader
     * @param {string} path video address in a web server
     * @param {ShaderType} shaderType
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
            internal: this.#internal
        };
        this.#texturesExternal.push(textureExternal);
        return textureExternal;
    }

    /**
     * Loads webcam as `texture_external`and then
     * it will be available to read data from in the shaders.
     * @param {String} name id of the wgsl variable in the shader
     * @param {ShaderType} shaderType
     * @returns {Object}
     *
     * @example
     * // js
     * await points.setTextureWebcam('video');
     *
     * // wgsl string
     * et rgba = textureExternalPosition(video, imageSampler, position, uvr, true);
     */
    async setTextureWebcam(name, shaderType) {
        if (this.#nameExists(this.#texturesExternal, name)) {
            throw `setTextureWebcam: ${name} already exists.`;
        }
        const video = document.createElement('video');
        //video.loop = true;
        //video.autoplay = true;
        video.muted = true;
        //document.body.appendChild(video);
        if (navigator.mediaDevices.getUserMedia) {
            await navigator.mediaDevices.getUserMedia({ video: true })
                .then(async function (stream) {
                    video.srcObject = stream;
                    await video.play();
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
        const textureExternal = {
            name: name,
            shaderType: shaderType,
            video: video,
            internal: this.#internal
        };
        this.#texturesExternal.push(textureExternal);
        return textureExternal;
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
        let resume = _ => { audioContext.resume() }
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
        );
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
            internal: this.#internal
        };
        this.#texturesStorage2d.push(texturesStorage2d);
        return texturesStorage2d;
    }

    /**
     * Special texture where data can be written to it in the Compute Shader and
     * Is a one way communication method.
     * Ideal to store data to it in the Compute Shader and later visualize it in
     * the Fragment Shader.
     * @param {string} computeName name of the variable in the compute shader
     * @param {string} fragmentName name of the variable in the fragment shader
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
    setBindingTexture(computeName, fragmentName, size) {
        // TODO: validate that names don't exist already
        const bindingTexture = {
            compute: {
                name: computeName,
                shaderType: ShaderType.COMPUTE
            },
            fragment: {
                name: fragmentName,
                shaderType: ShaderType.FRAGMENT
            },
            texture: null,
            size: size,
            internal: this.#internal
        }
        this.#bindingTextures.push(bindingTexture);
        return bindingTexture;
    }

    /**
     * Listens for an event dispatched from WGSL code
     * @param {String} name Number that represents an event Id
     * @param {Function} callback function to be called when the event occurs
     * @param {Number} structSize size of the data to be returned
     *
     * @example
     * // js
     * // the event name will be reflected as a variable name in the shader
     * points.addEventListener('click_event', data => {
     *     // response action in JS
     * }, 4);
     *
     * // wgsl string
     *  if(params.mouseClick == 1.){
     *      // Same name of the Event
     *      // we fire the event with a 1
     *      // it will be set to 0 in the next frame
     *      click_event.updated = 1;
     *  }
     *
     */
    addEventListener(name, callback, structSize) {
        // TODO: remove structSize
        // this extra 4 is for the boolean flag in the Event struct
        let data = new Uint8Array(Array(structSize + 4).fill(0));
        this.setStorageMap(name, data, 'Event', true);
        this.#events.set(this.#events_ids,
            {
                id: this.#events_ids,
                name: name,
                callback: callback,
            }
        );
        ++this.#events_ids;
    }
    /**
     * for internal use:
     * to flag add* methods and variables as part of the RenderPasses
     * @private
     * @ignore
     */
    _setInternal(value) {
        this.#internal = value;
    }
    /**
     * @param {ShaderType} shaderType
     * @param {boolean} internal
     * @returns {String} string with bindings
     */
    #createDynamicGroupBindings(shaderType, internal) {
        // `internal` here is a flag for a custom pass
        internal = internal || false;
        if (!shaderType) {
            throw '`ShaderType` is required';
        }
        const groupId = 0;
        let dynamicGroupBindings = '';
        let bindingIndex = 0;
        if (this.#uniforms.length) {
            dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <uniform> params: Params;\n`;
            bindingIndex += 1;
        }
        this.#storage.forEach(storageItem => {
            let internalCheck = internal == storageItem.internal;
            if (!storageItem.shaderType && internalCheck || storageItem.shaderType == shaderType && internalCheck) {
                let T = storageItem.structName;
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <storage, read_write> ${storageItem.name}: ${T};\n`
                bindingIndex += 1;
            }
        });
        if (this.#layers.length) {
            if (!this.#layers.shaderType || this.#layers.shaderType == shaderType) {
                let totalSize = 0;
                this.#layers.forEach(layerItem => totalSize += layerItem.size);
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <storage, read_write> layers: array<array<vec4f, ${totalSize}>>;\n`
                bindingIndex += 1;
            }
        }
        this.#samplers.forEach((sampler, index) => {
            let internalCheck = internal == sampler.internal;
            if (!sampler.shaderType && internalCheck || sampler.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${sampler.name}: sampler;\n`;
                bindingIndex += 1;
            }
        });
        this.#texturesStorage2d.forEach((texture, index) => {
            let internalCheck = internal && texture.internal;
            if (!texture.shaderType && internalCheck || texture.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_storage_2d<rgba8unorm, write>;\n`;
                bindingIndex += 1;
            }
        });
        this.#textures2d.forEach((texture, index) => {
            let internalCheck = internal == texture.internal;
            if (!texture.shaderType && internalCheck || texture.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_2d<f32>;\n`;
                bindingIndex += 1;
            }
        });
        this.#textures2dArray.forEach((texture, index) => {
            let internalCheck = internal == texture.internal;
            if (!texture.shaderType && internalCheck || texture.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_2d_array<f32>;\n`;
                bindingIndex += 1;
            }
        });
        this.#texturesExternal.forEach(externalTexture => {
            let internalCheck = internal == externalTexture.internal;
            if (!externalTexture.shaderType && internalCheck || externalTexture.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${externalTexture.name}: texture_external;\n`;
                bindingIndex += 1;
            }
        });
        this.#bindingTextures.forEach(bindingTexture => {
            let internalCheck = internal == bindingTexture.internal;
            if (bindingTexture.compute.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${bindingTexture.compute.name}: texture_storage_2d<rgba8unorm, write>;\n`;
                bindingIndex += 1;
            }
            if (bindingTexture.fragment.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${bindingTexture.fragment.name}: texture_2d<f32>;\n`;
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
        this.#uniforms.forEach(u => {
            u.type = u.type || 'f32';
            dynamicStructParams += /*wgsl*/`${u.name}:${u.type}, \n\t`;
        });
        if (this.#uniforms.length) {
            dynamicStructParams = /*wgsl*/`struct Params {\n\t${dynamicStructParams}\n}\n`;
        }
        renderPass.hasVertexShader && (dynamicGroupBindingsVertex += dynamicStructParams);
        renderPass.hasComputeShader && (dynamicGroupBindingsCompute += dynamicStructParams);
        renderPass.hasFragmentShader && (dynamicGroupBindingsFragment += dynamicStructParams);
        renderPass.hasVertexShader && (dynamicGroupBindingsVertex += this.#createDynamicGroupBindings(ShaderType.VERTEX, renderPass.internal));
        renderPass.hasComputeShader && (dynamicGroupBindingsCompute += this.#createDynamicGroupBindings(ShaderType.COMPUTE, renderPass.internal));
        dynamicGroupBindingsFragment += this.#createDynamicGroupBindings(ShaderType.FRAGMENT, renderPass.internal);
        renderPass.hasVertexShader && (colorsVertWGSL = dynamicGroupBindingsVertex + defaultStructs + defaultVertexBody + colorsVertWGSL);
        renderPass.hasComputeShader && (colorsComputeWGSL = dynamicGroupBindingsCompute + defaultStructs + colorsComputeWGSL);
        renderPass.hasFragmentShader && (colorsFragWGSL = dynamicGroupBindingsFragment + defaultStructs + colorsFragWGSL);
        console.groupCollapsed(`Render Pass ${index}`);
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
        this.#renderPasses.forEach(this.#compileRenderPass);
        this.#generateDataSize();
        //
        let adapter = null;
        try {
            adapter = await navigator.gpu.requestAdapter();
        } catch (err) {
            console.log(err);
        }
        if (!adapter) { return false; }
        this.#device = await adapter.requestDevice();
        this.#device.lost.then(info => {
            console.log(info);
        });
        if (this.#canvas !== null) this.#context = this.#canvas.getContext('webgpu');
        this.#presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        if (this.#canvasId) {
            if (this.#fitWindow) {
                this.#resizeCanvasToFitWindow();
            } else {
                this.#resizeCanvasToDefault();
            }
        }
        this.#renderPassDescriptor = {
            colorAttachments: [
                {
                    //view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }
            ],
            depthStencilAttachment: {
                //view: this.#depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store'
            }
        };
        this.createScreen();
        return true;
    }

    /**
     * Mainly to be used with {@link RenderPasses}<br>
     * Injects a render pass after all the render passes added by the user.
     * @param {RenderPass} renderPass
     * @ignore
     */
    addRenderPass(renderPass) {
        this.#postRenderPasses.push(renderPass);
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
    createScreen() {
        let hasVertexAndFragmentShader = this.#renderPasses.some(renderPass => renderPass.hasVertexAndFragmentShader)
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
                    this.addPoint(coordinate, this.#canvas.clientWidth / this.#numColumns, this.#canvas.clientHeight / this.#numRows, colors);
                }
            }
            this.#createVertexBuffer(new Float32Array(this.#vertexArray));
        }
        this.#createComputeBuffers();
        this.#createPipeline();
    }
    /**
     * @param {Float32Array} vertexArray
     * @returns buffer
     */
    #createVertexBuffer(vertexArray) {
        this.#vertexBufferInfo = new VertexBufferInfo(vertexArray);
        this.#buffer = this.#createAndMapBuffer(vertexArray, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
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
     * It creates with size, no with data, so it's empty
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

    #writeBuffer(buffer, values) {
        this.#device.queue.writeBuffer(
            buffer,
            0,
            new Float32Array(values)
        );
    }

    #createUniformValues() {
        const paramsDataSize = this.#dataSize.get('Params')
        const paddings = paramsDataSize.paddings;
        // we check the paddings list and add 0's to just the ones that need it
        const uniformsClone = structuredClone(this.#uniforms);
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
        const { values, paramsDataSize } = this.#createUniformValues();
        this.#uniforms.buffer = this.#createAndMapBuffer(values, GPUBufferUsage.UNIFORM + GPUBufferUsage.COPY_DST, true, paramsDataSize.bytes);
    }

    #writeParametersUniforms() {
        const { values } = this.#createUniformValues();
        this.#writeBuffer(this.#uniforms.buffer, values);
    }

    #createComputeBuffers() {
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
                size: this.#presentationSize,
                format: 'rgba8unorm',
                usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
            });
        });
        //--------------------------------------------
        this.#textures2d.forEach(texture2d => {
            if (texture2d.imageTexture) {
                let cubeTexture;
                const imageBitmap = texture2d.imageTexture.bitmap;
                cubeTexture = this.#device.createTexture({
                    label: texture2d.name,
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
        this.#textures2dArray.forEach(texture2dArray => {
            if (texture2dArray.imageTextures) {
                let cubeTexture;
                const imageBitmaps = texture2dArray.imageTextures.bitmaps;
                cubeTexture = this.#device.createTexture({
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
                source: externalTexture.video
            });
        });
        //--------------------------------------------
        this.#bindingTextures.forEach(bindingTexture => {
            bindingTexture.texture = this.#device.createTexture({
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

    #createTextureToSize(texture2d, width, height) {
        texture2d.texture = this.#device.createTexture({
            label: texture2d.name,
            size: [width, height],
            format: this.#presentationFormat, // if 'depth24plus' throws error
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
    }

    #createComputeBindGroup() {
        this.#renderPasses.forEach((renderPass, index) => {
            if (renderPass.hasComputeShader) {
                const entries = this.#createEntries(ShaderType.COMPUTE);
                if (entries.length) {
                    let bglEntries = [];
                    entries.forEach((entry, index) => {
                        let bglEntry = {
                            binding: index,
                            visibility: GPUShaderStage.COMPUTE
                        }
                        bglEntry[entry.type.name] = { 'type': entry.type.type };
                        if (entry.type.format) {
                            bglEntry[entry.type.name].format = entry.type.format
                        }
                        if (entry.type.viewDimension) {
                            bglEntry[entry.type.name].viewDimension = entry.type.viewDimension
                        }
                        bglEntries.push(bglEntry);
                    });
                    renderPass.bindGroupLayout = this.#device.createBindGroupLayout({ entries: bglEntries });
                    /**
                     * @type {GPUBindGroup}
                     */
                    renderPass.computeBindGroup = this.#device.createBindGroup({
                        label: `_createComputeBindGroup 0 - ${index}`,
                        layout: renderPass.bindGroupLayout,
                        entries: entries
                    });
                }
            }
        });
    }

    #createPipeline() {
        this.#createComputeBindGroup();
        this.#renderPasses.forEach((renderPass, index) => {
            if (renderPass.hasComputeShader) {
                renderPass.computePipeline = this.#device.createComputePipeline({
                    layout: this.#device.createPipelineLayout({
                        bindGroupLayouts: [renderPass.bindGroupLayout]
                    }),
                    label: `_createPipeline() - ${index}`,
                    compute: {
                        module: this.#device.createShaderModule({
                            code: renderPass.compiledShaders.compute
                        }),
                        entryPoint: "main"
                    }
                });
            }
        });

        //--------------------------------------

        this.#createParams();
        //this.createVertexBuffer(new Float32Array(this.#vertexArray));
        // enum GPUPrimitiveTopology {
        //     'point-list',
        //     'line-list',
        //     'line-strip',
        //     'triangle-list',
        //     'triangle-strip',
        // };
        this.#renderPasses.forEach(renderPass => {
            if (renderPass.hasVertexAndFragmentShader) {
                renderPass.renderPipeline = this.#device.createRenderPipeline({
                    // layout: 'auto',
                    layout: this.#device.createPipelineLayout({
                        bindGroupLayouts: [renderPass.bindGroupLayout]
                    }),
                    //primitive: { topology: 'triangle-strip' },
                    primitive: { topology: 'triangle-list' },
                    depthStencil: {
                        depthWriteEnabled: true,
                        depthCompare: 'less',
                        format: 'depth24plus',
                    },
                    vertex: {
                        module: this.#device.createShaderModule({
                            code: renderPass.compiledShaders.vertex,
                        }),
                        entryPoint: 'main', // shader function name
                        buffers: [
                            {
                                arrayStride: this.#vertexBufferInfo.vertexSize,
                                attributes: [
                                    {
                                        // position
                                        shaderLocation: 0,
                                        offset: this.#vertexBufferInfo.vertexOffset,
                                        format: 'float32x4',
                                    },
                                    {
                                        // colors
                                        shaderLocation: 1,
                                        offset: this.#vertexBufferInfo.colorOffset,
                                        format: 'float32x4',
                                    },
                                    {
                                        // uv
                                        shaderLocation: 2,
                                        offset: this.#vertexBufferInfo.uvOffset,
                                        format: 'float32x2',
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
    #createEntries(shaderType, internal) {
        internal = internal || false;
        let entries = [];
        let bindingIndex = 0;
        if (this.#uniforms.length) {
            entries.push(
                {
                    binding: bindingIndex++,
                    resource: {
                        label: 'uniform',
                        buffer: this.#uniforms.buffer
                    },
                    type: {
                        name: 'buffer',
                        type: 'uniform'
                    }
                }
            );
        }
        if (this.#storage.length) {
            this.#storage.forEach(storageItem => {
                let internalCheck = internal == storageItem.internal;
                if (!storageItem.shaderType && internalCheck || storageItem.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            binding: bindingIndex++,
                            resource: {
                                label: 'storage',
                                buffer: storageItem.buffer
                            },
                            type: {
                                name: 'buffer',
                                type: 'storage'
                            }
                        }
                    );
                }
            });
        }
        if (this.#layers.length) {
            if (!this.#layers.shaderType || this.#layers.shaderType == shaderType) {
                entries.push(
                    {
                        binding: bindingIndex++,
                        resource: {
                            label: 'layer',
                            buffer: this.#layers.buffer
                        },
                        type: {
                            name: 'buffer',
                            type: 'storage'
                        }
                    }
                );
            }
        }
        if (this.#samplers.length) {
            this.#samplers.forEach((sampler, index) => {
                let internalCheck = internal == sampler.internal;
                if (!sampler.shaderType && internalCheck || sampler.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            binding: bindingIndex++,
                            resource: sampler.resource,
                            type: {
                                name: 'sampler',
                                type: 'filtering'
                            }
                        }
                    );
                }
            });
        }
        if (this.#texturesStorage2d.length) {
            this.#texturesStorage2d.forEach((textureStorage2d, index) => {
                let internalCheck = internal == textureStorage2d.internal;
                if (!textureStorage2d.shaderType && internalCheck || textureStorage2d.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            label: 'texture storage 2d',
                            binding: bindingIndex++,
                            resource: textureStorage2d.texture.createView(),
                            type: {
                                name: 'storageTexture',
                                type: 'write-only'
                            }
                        }
                    );
                }
            });
        }
        if (this.#textures2d.length) {
            this.#textures2d.forEach((texture2d, index) => {
                let internalCheck = internal == texture2d.internal;
                if (!texture2d.shaderType && internalCheck || texture2d.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            label: 'texture 2d',
                            binding: bindingIndex++,
                            resource: texture2d.texture.createView(),
                            type: {
                                name: 'texture',
                                type: 'float'
                            }
                        }
                    );
                }
            });
        }
        if (this.#textures2dArray.length) {
            this.#textures2dArray.forEach((texture2dArray, index) => {
                let internalCheck = internal == texture2dArray.internal;
                if (!texture2dArray.shaderType && internalCheck || texture2dArray.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            label: 'texture 2d array',
                            binding: bindingIndex++,
                            resource: texture2dArray.texture.createView({
                                dimension: '2d-array',
                                baseArrayLayer: 0,
                                arrayLayerCount: texture2dArray.imageTextures.bitmaps.length
                            }),
                            type: {
                                name: 'texture',
                                type: 'float',
                                viewDimension: '2d-array'
                            }
                        }
                    );
                }
            });
        }
        if (this.#texturesExternal.length) {
            this.#texturesExternal.forEach(externalTexture => {
                let internalCheck = internal == externalTexture.internal;
                if (!externalTexture.shaderType && internalCheck || externalTexture.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            label: 'external texture',
                            binding: bindingIndex++,
                            resource: externalTexture.texture,
                            type: {
                                name: 'externalTexture',
                                // type: 'write-only'
                            }
                        }
                    );
                }
            });
        }
        if (this.#bindingTextures.length) {
            this.#bindingTextures.forEach(bindingTexture => {
                let internalCheck = internal == bindingTexture.internal;
                if (bindingTexture.compute.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            label: 'binding texture',
                            binding: bindingIndex++,
                            resource: bindingTexture.texture.createView(),
                            type: {
                                name: 'storageTexture',
                                type: 'write-only',
                                format: 'rgba8unorm'
                            }
                        }
                    );
                }
            });
            this.#bindingTextures.forEach(bindingTexture => {
                let internalCheck = internal == bindingTexture.internal;
                if (bindingTexture.fragment.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            label: 'binding texture 2',
                            binding: bindingIndex++,
                            resource: bindingTexture.texture.createView(),
                            type: {
                                name: 'texture',
                                type: 'float'
                            }
                        }
                    );
                }
            });
        }
        return entries;
    }

    #createParams() {
        this.#renderPasses.forEach(renderPass => {
            const entries = this.#createEntries(ShaderType.FRAGMENT, renderPass.internal);
            if (entries.length) {
                let bglEntries = [];
                entries.forEach((entry, index) => {
                    let bglEntry = {
                        binding: index,
                        visibility: GPUShaderStage.FRAGMENT
                    }
                    bglEntry[entry.type.name] = { 'type': entry.type.type };
                    if (entry.type.viewDimension) {
                        bglEntry[entry.type.name].viewDimension = entry.type.viewDimension
                    }
                    // TODO: 1262
                    // if you remove this there's an error that I think is not explained right
                    // it talks about a storage in index 1 but it was actually the 0
                    // and so is to this uniform you have to change the visibility
                    // not remove the type and leaving it empty as it seems you have to do here:
                    // https://gpuweb.github.io/gpuweb/#bindgroup-examples
                    if (entry.type.type == 'uniform') {
                        bglEntry.visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT
                    }
                    bglEntries.push(bglEntry);
                });
                renderPass.bindGroupLayout = this.#device.createBindGroupLayout({ entries: bglEntries });
                renderPass.uniformBindGroup = this.#device.createBindGroup({
                    label: '_createParams() 0',
                    layout: renderPass.bindGroupLayout,
                    entries: entries
                });
            }
        });
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
        // this.#createParametersUniforms();
        this.#writeParametersUniforms();
        // TODO: create method for this
        this.#storage.forEach(storageItem => {
            if (storageItem.mapped) {
                const values = new Float32Array(storageItem.array);
                this.#writeBuffer(storageItem.buffer, values);
            }
        });
        // AUDIO
        // this.#analyser.getByteTimeDomainData(this.#dataArray);
        this.#sounds.forEach(sound => sound.analyser?.getByteFrequencyData(sound.data));
        // END AUDIO
        this.#texturesExternal.forEach(externalTexture => {
            externalTexture.texture = this.#device.importExternalTexture({
                source: externalTexture.video
            });
            if ('requestVideoFrameCallback' in externalTexture.video) {
                externalTexture.video.requestVideoFrameCallback(_ => { });
            }
        });

        this.#createComputeBindGroup();

        const commandEncoder = this.#device.createCommandEncoder();

        this.#renderPasses.forEach(renderPass => {
            if (renderPass.hasComputeShader) {
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

        // ---------------------
        const swapChainTexture = this.#context.getCurrentTexture();
        this.#renderPassDescriptor.colorAttachments[0].view = swapChainTexture.createView();
        this.#renderPassDescriptor.depthStencilAttachment.view = this.#depthTexture.createView();

        //commandEncoder = this.#device.createCommandEncoder();
        this.#renderPasses.forEach((renderPass, renderPassIndex) => {
            if (renderPass.hasVertexAndFragmentShader) {
                const passEncoder = commandEncoder.beginRenderPass(this.#renderPassDescriptor);
                passEncoder.setPipeline(renderPass.renderPipeline);
                this.#createParams();
                if (this.#uniforms.length) {
                    passEncoder.setBindGroup(0, renderPass.uniformBindGroup);
                }
                passEncoder.setVertexBuffer(0, this.#buffer);
                /**
                 * vertexCount: number The number of vertices to draw
                 * instanceCount?: number | undefined The number of instances to draw
                 * firstVertex?: number | undefined Offset into the vertex buffers, in vertices, to begin drawing from
                 * firstInstance?: number | undefined First instance to draw
                 */
                //passEncoder.draw(3, 1, 0, 0);
                passEncoder.draw(this.#vertexBufferInfo.vertexCount);
                passEncoder.end();
                // Copy the rendering results from the swapchain into |texture2d.texture|.
                this.#textures2d.forEach(texture2d => {
                    if (texture2d.renderPassIndex == renderPassIndex || texture2d.renderPassIndex == null) {
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
                    // console.log(texturePair.a);
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
        });

        if (this.#readStorage.length) {
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
        }
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
            let eventRead = await this.readStorage(event.name);
            if (eventRead) {
                let id = eventRead[0];
                if (id != 0) {
                    event.callback && event.callback(eventRead.slice(1, -1));
                }
            }
        }
    }

    #getWGSLCoordinate(value, side, invert = false) {
        const direction = invert ? -1 : 1;
        const p = value / side;
        return (p * 2 - 1) * direction;
    };
    /**
     * - **currently for internal use**<br>
     * - **might be private in the future**<br>
     * Adds two triangles as a quad called Point
     * @param {Coordinate} coordinate `x` from 0 to canvas.width, `y` from 0 to canvas.height, `z` it goes from 0.0 to 1.0 and forward
     * @param {Number} width point width
     * @param {Number} height point height
     * @param {Array<RGBAColor>} colors one color per corner
     * @param {Boolean} useTexture
     * @ignore
     */
    addPoint(coordinate, width, height, colors, useTexture = false) {
        const { x, y, z } = coordinate;
        const nx = this.#getWGSLCoordinate(x, this.#canvas.width);
        const ny = this.#getWGSLCoordinate(y, this.#canvas.height, true);
        const nz = z;
        const nw = this.#getWGSLCoordinate(x + width, this.#canvas.width);
        const nh = this.#getWGSLCoordinate(y + height, this.#canvas.height);
        const { r: r0, g: g0, b: b0, a: a0 } = colors[0];
        const { r: r1, g: g1, b: b1, a: a1 } = colors[1];
        const { r: r2, g: g2, b: b2, a: a2 } = colors[2];
        const { r: r3, g: g3, b: b3, a: a3 } = colors[3];
        this.#vertexArray.push(
            +nx, +ny, nz, 1, r0, g0, b0, a0, (+nx + 1) * .5, (+ny + 1) * .5,// 0 top left
            +nw, +ny, nz, 1, r1, g1, b1, a1, (+nw + 1) * .5, (+ny + 1) * .5,// 1 top right
            +nw, -nh, nz, 1, r3, g3, b3, a3, (+nw + 1) * .5, (-nh + 1) * .5,// 2 bottom right
            +nx, +ny, nz, 1, r0, g0, b0, a0, (+nx + 1) * .5, (+ny + 1) * .5,// 3 top left
            +nx, -nh, nz, 1, r2, g2, b2, a2, (+nx + 1) * .5, (-nh + 1) * .5,// 4 bottom left
            +nw, -nh, nz, 1, r3, g3, b3, a3, (+nw + 1) * .5, (-nh + 1) * .5,// 5 bottom right
        );
    }
    /**
     * Reference to the canvas assigned in the constructor
     * @type {HTMLCanvasElement}
     */
    get canvas() {
        return this.#canvas;
    }
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
     * @type {Boolean}
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
}

export default Points;
export { ShaderType, RenderPass, RenderPasses };