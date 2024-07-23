'use strict';
import UniformKeys from './UniformKeys.js';
import VertexBufferInfo from './VertexBufferInfo.js';
import ShaderType from './ShaderType.js';
import Coordinate from './coordinate.js';
import RGBAColor from './color.js';
import Clock from './clock.js';
import defaultStructs from './core/defaultStructs.js';
import { defaultVertexBody } from './core/defaultFunctions.js';
import { dataSize, getArrayTypeData, isArray, typeSizes } from './data-size.js';

export default class Points {
    constructor(canvasId) {
        /** @private */
        this._canvasId = canvasId;
        /** @private */
        this._canvas = document.getElementById(this._canvasId);
        /** @private */
        this._device = null;
        /** @private */
        this._context = null;
        /** @private */
        this._presentationFormat = null;
        /** @private */
        this._renderPasses = null;
        /** @private */
        this._postRenderPasses = [];
        /** @private */
        this._vertexBufferInfo = null;
        /** @private */
        this._buffer = null;
        /** @private */
        this._internal = false;

        /** @private */
        this._presentationSize = null;
        /** @private */
        this._depthTexture = null;
        /** @private */
        this._commandEncoder = null;

        /** @private */
        this._vertexArray = [];

        /** @private */
        this._numColumns = 1;
        /** @private */
        this._numRows = 1;

        /** @private */
        this._commandsFinished = [];

        /** @private */
        this._renderPassDescriptor = null;

        /** @private */
        this._uniforms = [];
        /** @private */
        this._storage = [];
        /** @private */
        this._readStorage = [];
        /** @private */
        this._samplers = [];
        /** @private */
        this._textures2d = [];
        /** @private */
        this._textures2dArray = [];
        /** @private */
        this._texturesExternal = [];
        /** @private */
        this._texturesStorage2d = [];
        /** @private */
        this._bindingTextures = [];

        /** @private */
        this._layers = [];

        /** @private */
        this._originalCanvasWidth = null;
        /** @private */
        this._originalCanvasHeigth = null;


        /** @private */
        this._clock = new Clock();
        /** @private */
        this._time = 0;
        /** @private */
        this._epoch = 0;
        /** @private */
        this._mouseX = 0;
        /** @private */
        this._mouseY = 0;
        /** @private */
        this._mouseDown = false;
        /** @private */
        this._mouseClick = false;
        /** @private */
        this._mouseWheel = false;
        /** @private */
        this._mouseDelta = [0, 0];

        /** @private */
        this._fullscreen = false;
        /** @private */
        this._fitWindow = false;
        /** @private */
        this._lastFitWindow = false;

        // audio
        /** @private */
        this._sounds = [];

        /** @private */
        this._events = new Map();
        /** @private */
        this._events_ids = 0;

        if (this._canvasId) {
            this._canvas.addEventListener('click', e => {
                this._mouseClick = true;
            });
            this._canvas.addEventListener('mousemove', this._onMouseMove, { passive: true });
            this._canvas.addEventListener('mousedown', e => {
                this._mouseDown = true;
            });
            this._canvas.addEventListener('mouseup', e => {
                this._mouseDown = false;
            });

            this._canvas.addEventListener('wheel', e => {
                this._mouseWheel = true;
                this._mouseDelta = [e.deltaX, e.deltaY];
            }, { passive: true });
            this._originalCanvasWidth = this._canvas.clientWidth;
            this._originalCanvasHeigth = this._canvas.clientHeight;
            window.addEventListener('resize', this._resizeCanvasToFitWindow, false);

            document.addEventListener("fullscreenchange", e => {
                let isFullscreen = !!document.fullscreenElement;
                this._fullscreen = isFullscreen;
                if (!isFullscreen && !this._fitWindow) {
                    this._resizeCanvasToDefault();
                }
                if (!isFullscreen) {
                    this.fitWindow = this._lastFitWindow;
                }
            });
        }


    }

    /** @private */
    _resizeCanvasToFitWindow = () => {
        if (this._fitWindow) {
            this._canvas.width = window.innerWidth;
            this._canvas.height = window.innerHeight;
            this._setScreenSize();
        }
    }

    /** @private */
    _resizeCanvasToDefault = () => {
        this._canvas.width = this._originalCanvasWidth;
        this._canvas.height = this._originalCanvasHeigth;
        this._setScreenSize();
    }

    /** @private */
    _setScreenSize = () => {
        this._presentationSize = [
            this._canvas.clientWidth,
            this._canvas.clientHeight,
        ];

        this._context.configure({
            device: this._device,
            format: this._presentationFormat,
            //size: this._presentationSize,
            width: this._canvas.clientWidth,
            height: this._canvas.clientHeight,
            alphaMode: 'premultiplied',

            // Specify we want both RENDER_ATTACHMENT and COPY_SRC since we
            // will copy out of the swapchain texture.
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        });

        this._depthTexture = this._device.createTexture({
            size: this._presentationSize,
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        // this is to solve an issue that requires the texture to be resized
        // if the screen dimensions change, this for a `addTexture2d` with
        // `copyCurrentTexture` parameter set to `true`.
        this._textures2d.forEach(texture2d => {
            if (!texture2d.imageTexture && texture2d.texture) {
                this._createTextureBindingToCopy(texture2d);
            }
        })
    }

    /** @private */
    _onMouseMove = e => {
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;
    }

    /**
     * Set a param as uniform to send to all shaders.
     * A Uniform is a value that can only be changed
     * from the outside, and unless changed it remains
     * consistent. To change it use `updateUniform()`
     * @param {string} name name of the Param, you can invoke it later in shaders as `Params.[name]`
     * @param {Number|Array} value Single number or a list of numbers
     * @param {string} structName type as `f32` or a custom struct
     */
    addUniform(name, value, structName) {
        if (structName && isArray(structName)) {
            throw `${structName} is an array, which is currently not supported for Uniforms.`;
        }
        if (this._nameExists(this._uniforms, name)) {
            return;
        }

        this._uniforms.push({
            name: name,
            value: value,
            type: structName,
            size: null,
            internal: this._internal
        });
    }

    /**
     * Update a param as uniform already existing
     * @param {string} name name of the param to update
     * @param {*} value Number will be converted to `f32`
     */
    updateUniform(name, value) {
        const variable = this._uniforms.find(v => v.name === name);
        if (!variable) {
            throw '`updateUniform()` can\'t be called without first `addUniform()`.';
        }
        variable.value = value;
    }

    /**
     * 
     * @param {Array} arr 
     */
    updateUniforms(arr) {
        arr.forEach(uniform => {
            const variable = this._uniforms.find(v => v.name === uniform.name);
            if (!variable) {
                throw '`updateUniform()` can\'t be called without first `addUniform()`.';
            }
            variable.value = uniform.value;
        })
    }

    /**
     * Creates a persistent memory buffer across every frame call.
     * @param {string} name Name that the Storage will have in the shader
     * @param {Number} size Number of items it will have.
     * Multiply this by number of properties in the struct if necessary.
     * @param {string} structName Name of the struct already existing on the
     * shader that will be the array<structName> of the Storage
     * @param {boolean} read if this is going to be used to read data back
     * @param {ShaderType} shaderType this tells to what shader the storage is bound
     */
    addStorage(name, structName, read, shaderType, arrayData) {
        if (this._nameExists(this._storage, name)) {
            return;
        }
        this._storage.push({
            mapped: !!arrayData,
            name: name,
            structName: structName,
            // structSize: null,
            shaderType: shaderType,
            read: read,
            buffer: null,
            internal: this._internal
        });
    }

    addStorageMap(name, arrayData, structName, read, shaderType) {
        if (this._nameExists(this._storage, name)) {
            return;
        }
        this._storage.push({
            mapped: true,
            name: name,
            structName: structName,
            shaderType: shaderType,
            array: arrayData,
            buffer: null,
            read: read,
            internal: this._internal
        });
    }

    updateStorageMap(name, arrayData) {
        const variable = this._storage.find(v => v.name === name);
        if (!variable) {
            throw '`updateStorageMap()` can\'t be called without first `addStorageMap()`.';
        }
        variable.array = arrayData;
    }

    async readStorage(name) {
        let storageItem = this._readStorage.find(storageItem => storageItem.name === name);
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

    addLayers(numLayers, shaderType) {
        for (let layerIndex = 0; layerIndex < numLayers; layerIndex++) {
            this._layers.shaderType = shaderType;
            this._layers.push({
                name: `layer${layerIndex}`,
                size: this._canvas.width * this._canvas.height,
                structName: 'vec4<f32>',
                structSize: 16,
                array: null,
                buffer: null,
                internal: this._internal
            });
        }
    }

    /** @private */
    _nameExists(arrayOfObjects, name) {
        return arrayOfObjects.some(obj => obj.name == name);
    }

    /**
     * Creates a `sampler` to be sent to the shaders.
     * @param {string} name Name of the `sampler` to be called in the shaders.
     * @param {GPUSamplerDescriptor} descriptor
     */
    addSampler(name, descriptor, shaderType) {
        if ('sampler' == name) {
            throw '`name` can not be sampler since is a WebGPU keyword';
        }

        if (this._nameExists(this._samplers, name)) {
            return;
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

        this._samplers.push({
            name: name,
            descriptor: descriptor,
            shaderType: shaderType,
            resource: null,
            internal: this._internal
        });
    }

    /**
     * Create a `texture_2d` in the shaders.
     * @param {string} name Name to call the texture in the shaders.
     * @param {boolean} copyCurrentTexture If you want the fragment output to be copied here.
     */
    addTexture2d(name, copyCurrentTexture, shaderType, renderPassIndex) {
        if (this._nameExists(this._textures2d, name)) {
            return;
        }
        this._textures2d.push({
            name: name,
            copyCurrentTexture: copyCurrentTexture,
            shaderType: shaderType,
            texture: null,
            renderPassIndex: renderPassIndex,
            internal: this._internal
        });
    }

    /**
     * Load an image as texture_2d
     * @param {string} name
     * @param {string} path
     * @param {ShaderType} shaderType
     */
    async addTextureImage(name, path, shaderType) {
        if (this._nameExists(this._textures2d, name)) {
            return;
        }

        const response = await fetch(path);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);

        this._textures2d.push({
            name: name,
            copyCurrentTexture: false,
            shaderType: shaderType,
            texture: null,
            imageTexture: {
                bitmap: imageBitmap
            },
            internal: this._internal
        });
    }

    /**
     * Load images as texture_2d_array
     * @param {string} name
     * @param {Array} paths
     * @param {ShaderType} shaderType
     */
    async addTextureImageArray(name, paths, shaderType) {
        if (this._nameExists(this._textures2dArray, name)) {
            return;
        }

        const imageBitmaps = [];
        for await (const path of paths) {
            console.log(path);
            const response = await fetch(path);
            const blob = await response.blob();
            imageBitmaps.push(await createImageBitmap(blob));
        }

        this._textures2dArray.push({
            name: name,
            copyCurrentTexture: false,
            shaderType: shaderType,
            texture: null,
            imageTextures: {
                bitmaps: imageBitmaps
            },
            internal: this._internal,
        });
    }

    /**
     * Load an video as texture2d
     * @param {string} name
     * @param {string} path
     * @param {ShaderType} shaderType
     */
    async addTextureVideo(name, path, shaderType) {
        if (this._nameExists(this._texturesExternal, name)) {
            return;
        }
        const video = document.createElement('video');
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        video.src = new URL(path, import.meta.url).toString();
        await video.play();

        this._texturesExternal.push({
            name: name,
            shaderType: shaderType,
            video: video,
            internal: this._internal
        });
    }

    async addTextureWebcam(name, shaderType) {
        if (this._nameExists(this._texturesExternal, name)) {
            return;
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

        this._texturesExternal.push({
            name: name,
            shaderType: shaderType,
            video: video,
            internal: this._internal
        });
    }

    addAudio(name, path, volume, loop, autoplay) {
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

        // this._audio.play();

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
        this.addStorageMap(name, data,
            // `array<f32, ${bufferLength}>`
            'Sound' // custom struct in defaultStructs.js
        );
        // uniform that will have the data length as a quick reference
        this.addUniform(`${name}Length`, analyser.frequencyBinCount);

        sound.analyser = analyser;
        sound.data = data;
        this._sounds.push(sound);

        return audio;
    }

    // TODO: verify this method
    addTextureStorage2d(name, shaderType) {
        if (this._nameExists(this._texturesStorage2d, name)) {
            return;
        }
        this._texturesStorage2d.push({
            name: name,
            shaderType: shaderType,
            texture: null,
            internal: this._internal
        });
    }

    /**
     * Adds a texture to the compute and fragment shader, in the compute you can
     * write to the texture, and in the fragment you can read the texture, so is
     * a one way communication method.
     * @param {string} computeName name of the variable in the compute shader
     * @param {string} fragmentName name of the variable in the fragment shader
     * @param {Array<number, 2>} size dimensions of the texture, by default screen
     * size
     */
    addBindingTexture(computeName, fragmentName, size) {
        this._bindingTextures.push({
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
            internal: this._internal
        });
    }

    /**
     * Listen for an event dispatched from WGSL code
     * @param {Number} id Number that represents an event Id
     * @param {Function} callback function to be called when the event occurs
     */
    addEventListener(name, callback, structSize) {
        // TODO: remove structSize
        // this extra 4 is for the boolean flag in the Event struct
        let data = Array(structSize + 4).fill(0);
        this.addStorageMap(name, data, 'Event', true);
        this._events.set(this._events_ids,
            {
                id: this._events_ids,
                name: name,
                callback: callback,
            }
        );

        ++this._events_ids;
    }

    /**
     * @private
     * for internal use:
     * to flag add* methods and variables as part of the RenderPasses
     */
    _setInternal(value) {
        this._internal = value;
    }

    /**
     * @private
     * @param {ShaderType} shaderType
     * @param {boolean} internal
     * @returns string with bindings
     */
    _createDynamicGroupBindings(shaderType, internal) {
        // `internal` here is a flag for a custom pass
        internal = internal || false;
        if (!shaderType) {
            throw '`ShaderType` is required';
        }
        const groupId = 0;
        let dynamicGroupBindings = '';
        let bindingIndex = 0;
        if (this._uniforms.length) {
            dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <uniform> params: Params;\n`;
            bindingIndex += 1;
        }

        this._storage.forEach(storageItem => {
            let internalCheck = internal == storageItem.internal;
            if (!storageItem.shaderType && internalCheck || storageItem.shaderType == shaderType && internalCheck) {
                let T = storageItem.structName;
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <storage, read_write> ${storageItem.name}: ${T};\n`
                bindingIndex += 1;
            }
        });

        if (this._layers.length) {
            if (!this._layers.shaderType || this._layers.shaderType == shaderType) {
                let totalSize = 0;
                this._layers.forEach(layerItem => totalSize += layerItem.size);
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <storage, read_write> layers: array<array<vec4<f32>, ${totalSize}>>;\n`
                bindingIndex += 1;
            }
        }

        this._samplers.forEach((sampler, index) => {
            let internalCheck = internal == sampler.internal;
            if (!sampler.shaderType && internalCheck || sampler.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${sampler.name}: sampler;\n`;
                bindingIndex += 1;
            }
        });

        this._texturesStorage2d.forEach((texture, index) => {
            let internalCheck = internal && texture.internal;
            if (!texture.shaderType && internalCheck || texture.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_storage_2d<rgba8unorm, write>;\n`;
                bindingIndex += 1;
            }
        });

        this._textures2d.forEach((texture, index) => {
            let internalCheck = internal == texture.internal;
            if (!texture.shaderType && internalCheck || texture.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_2d<f32>;\n`;
                bindingIndex += 1;
            }
        });

        this._textures2dArray.forEach((texture, index) => {
            let internalCheck = internal == texture.internal;
            if (!texture.shaderType && internalCheck || texture.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_2d_array<f32>;\n`;
                bindingIndex += 1;
            }
        });

        this._texturesExternal.forEach(externalTexture => {
            let internalCheck = internal == externalTexture.internal;
            if (!externalTexture.shaderType && internalCheck || externalTexture.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${externalTexture.name}: texture_external;\n`;
                bindingIndex += 1;
            }
        });

        this._bindingTextures.forEach(bindingTexture => {
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
     */
    setMeshDensity(numColumns, numRows) {
        if (numColumns == 0 || numRows == 0) {
            throw 'Parameters should be greater than 0';
        }
        this._numColumns = numColumns;
        this._numRows = numRows;
    }

    /** @private */
    _compileRenderPass = (renderPass, index) => {
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
        this._uniforms.forEach(u => {
            u.type = u.type || 'f32';
            dynamicStructParams += /*wgsl*/`${u.name}:${u.type}, \n\t`;
        });

        if (this._uniforms.length) {
            dynamicStructParams = /*wgsl*/`struct Params {\n\t${dynamicStructParams}\n}\n`;
        }

        renderPass.hasVertexShader && (dynamicGroupBindingsVertex += dynamicStructParams);
        renderPass.hasComputeShader && (dynamicGroupBindingsCompute += dynamicStructParams);
        renderPass.hasFragmentShader && (dynamicGroupBindingsFragment += dynamicStructParams);

        renderPass.hasVertexShader && (dynamicGroupBindingsVertex += this._createDynamicGroupBindings(ShaderType.VERTEX, renderPass.internal));
        renderPass.hasComputeShader && (dynamicGroupBindingsCompute += this._createDynamicGroupBindings(ShaderType.COMPUTE, renderPass.internal));
        dynamicGroupBindingsFragment += this._createDynamicGroupBindings(ShaderType.FRAGMENT, renderPass.internal);

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

    _generateDataSize = () => {
        const allShaders = this._renderPasses.map(renderPass => {
            const { vertex, compute, fragment } = renderPass.compiledShaders;
            return vertex + compute + fragment;;
        }).join('\n');

        this._dataSize = dataSize(allShaders);

        // since uniforms are in a sigle struct
        // this is only required for storage
        this._storage.forEach(s => {
            if (!s.mapped) {
                if (isArray(s.structName)) {
                    const typeData = getArrayTypeData(s.structName, this._dataSize);
                    s.structSize = typeData.size;
                } else {
                    const d = this._dataSize.get(s.structName) || typeSizes[s.structName];
                    if (!d) {
                        throw `${s.structName} has not been defined.`
                    }
                    s.structSize = d.bytes || d.size;
                }
            }
        });
    }

    /**
     * One time function to call to initialize the shaders.
     * @param {Array<RenderPass>} renderPasses Collection of RenderPass, which contain Vertex, Compute and Fragment shaders.
     * @returns false | undefined
     */
    async init(renderPasses) {

        this._renderPasses = renderPasses.concat(this._postRenderPasses);

        // initializing internal uniforms
        this.addUniform(UniformKeys.TIME, this._time);
        this.addUniform(UniformKeys.DELTA, this._delta);
        this.addUniform(UniformKeys.EPOCH, this._epoch);
        this.addUniform(UniformKeys.SCREEN, [0, 0], 'vec2f');
        this.addUniform(UniformKeys.MOUSE, [0, 0], 'vec2f');
        this.addUniform(UniformKeys.MOUSE_CLICK, this._mouseClick);
        this.addUniform(UniformKeys.MOUSE_DOWN, this._mouseDown);
        this.addUniform(UniformKeys.MOUSE_WHEEL, this._mouseWheel);
        this.addUniform(UniformKeys.MOUSE_DELTA, this._mouseDelta, 'vec2f');

        let hasComputeShaders = this._renderPasses.some(renderPass => renderPass.hasComputeShader);
        if (!hasComputeShaders && this._bindingTextures.length) {
            throw ' `addBindingTexture` requires at least one Compute Shader in a `RenderPass`'
        }

        this._renderPasses.forEach(this._compileRenderPass);
        this._generateDataSize();
        //


        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) { return false; }
        this._device = await adapter.requestDevice();
        this._device.lost.then(info => {
            console.log(info);
        });

        if (this._canvas !== null) this._context = this._canvas.getContext('webgpu');

        this._presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        if (this._canvasId) {
            if (this._fitWindow) {
                this._resizeCanvasToFitWindow();
            } else {
                this._resizeCanvasToDefault();
            }
        }

        this._renderPassDescriptor = {
            colorAttachments: [
                {
                    //view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }
            ],
            depthStencilAttachment: {
                //view: this._depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store'
            }
        };

        await this.createScreen();
    }

    /**
     * Adds two triangles called points per number of columns and rows
     */
    async createScreen() {
        let hasVertexAndFragmentShader = this._renderPasses.some(renderPass => renderPass.hasVertexAndFragmentShader)

        if (hasVertexAndFragmentShader) {
            let colors = [
                new RGBAColor(1, 0, 0),
                new RGBAColor(0, 1, 0),
                new RGBAColor(0, 0, 1),
                new RGBAColor(1, 1, 0),
            ];

            for (let xIndex = 0; xIndex < this._numRows; xIndex++) {
                for (let yIndex = 0; yIndex < this._numColumns; yIndex++) {
                    const coordinate = new Coordinate(xIndex * this._canvas.clientWidth / this._numColumns, yIndex * this._canvas.clientHeight / this._numRows, .3);
                    this.addPoint(coordinate, this._canvas.clientWidth / this._numColumns, this._canvas.clientHeight / this._numRows, colors);
                }
            }
            this._createVertexBuffer(new Float32Array(this._vertexArray));
        }

        this._createComputeBuffers();

        await this._createPipeline();
    }

    /**
     * @private
     * @param {Float32Array} vertexArray
     * @returns buffer
     */
    _createVertexBuffer(vertexArray) {
        this._vertexBufferInfo = new VertexBufferInfo(vertexArray);
        this._buffer = this._createAndMapBuffer(vertexArray, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
    }

    /**
     * @private
     * @param {Float32Array} data
     * @param {GPUBufferUsageFlags} usage
     * @param {Boolean} mappedAtCreation
     * @returns mapped buffer
     */
    _createAndMapBuffer(data, usage, mappedAtCreation = true, size) {
        const buffer = this._device.createBuffer({
            mappedAtCreation: mappedAtCreation,
            size: size || data.byteLength,
            usage: usage,
        });
        new Float32Array(buffer.getMappedRange()).set(data);
        buffer.unmap();
        return buffer;
    }


    /**
     * @private
     * It creates with size, no with data, so it's empty
     * @param {Number} size numItems * instanceByteSize ;
     * @param {GPUBufferUsageFlags} usage
     * @returns buffer
     */
    _createBuffer(size, usage) {
        const buffer = this._device.createBuffer({
            size: size,
            usage: usage,
        });
        return buffer
    }

    /** @private */
    _createParametersUniforms() {
        const paramsDataSize = this._dataSize.get('Params')
        const paddings = paramsDataSize.paddings;

        // we check the paddings list and add 0's to just the ones that need it
        const uniformsClone = JSON.parse(JSON.stringify(this._uniforms));
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

        const values = new Float32Array(arrayValues);
        this._uniforms.buffer = this._createAndMapBuffer(values, GPUBufferUsage.UNIFORM, true, paramsDataSize.bytes);
    }

    /** @private */
    _createComputeBuffers() {
        //--------------------------------------------
        this._createParametersUniforms();
        //--------------------------------------------
        this._storage.forEach(storageItem => {
            let usage = GPUBufferUsage.STORAGE;

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

                this._readStorage.push(readStorageItem);
                usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC;
            }
            storageItem.usage = usage;
            if (storageItem.mapped) {
                const values = new Float32Array(storageItem.array);
                storageItem.buffer = this._createAndMapBuffer(values, usage);
            } else {
                storageItem.buffer = this._createBuffer(storageItem.structSize, usage);
            }
        });
        //--------------------------------------------
        this._readStorage.forEach(readStorageItem => {
            readStorageItem.buffer = this._device.createBuffer({
                size: readStorageItem.size,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
            });
        });
        //--------------------------------------------
        if (this._layers.length) {
            //let layerValues = [];
            let layersSize = 0;
            this._layers.forEach(layerItem => {
                layersSize += layerItem.size * layerItem.structSize;
            });
            this._layers.buffer = this._createBuffer(layersSize, GPUBufferUsage.STORAGE);
        }

        //--------------------------------------------
        this._samplers.forEach(sampler => sampler.resource = this._device.createSampler(sampler.descriptor));
        //--------------------------------------------
        this._texturesStorage2d.forEach(textureStorage2d => {
            textureStorage2d.texture = this._device.createTexture({
                size: this._presentationSize,
                format: 'rgba8unorm',
                usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
            });
        });
        //--------------------------------------------
        this._textures2d.forEach(texture2d => {
            if (texture2d.imageTexture) {
                let cubeTexture;
                const imageBitmap = texture2d.imageTexture.bitmap;

                cubeTexture = this._device.createTexture({
                    size: [imageBitmap.width, imageBitmap.height, 1],
                    format: 'rgba8unorm',
                    usage:
                        GPUTextureUsage.TEXTURE_BINDING |
                        GPUTextureUsage.COPY_DST |
                        GPUTextureUsage.RENDER_ATTACHMENT,
                });

                this._device.queue.copyExternalImageToTexture(
                    { source: imageBitmap },
                    { texture: cubeTexture },
                    [imageBitmap.width, imageBitmap.height]
                );

                texture2d.texture = cubeTexture;
            } else {
                this._createTextureBindingToCopy(texture2d);
            }
        });
        //--------------------------------------------
        this._textures2dArray.forEach(texture2dArray => {
            if (texture2dArray.imageTextures) {
                let cubeTexture;
                const imageBitmaps = texture2dArray.imageTextures.bitmaps;

                cubeTexture = this._device.createTexture({
                    size: [imageBitmaps[0].width, imageBitmaps[0].height, imageBitmaps.length],
                    format: 'rgba8unorm',
                    usage:
                        GPUTextureUsage.TEXTURE_BINDING |
                        GPUTextureUsage.COPY_DST |
                        GPUTextureUsage.RENDER_ATTACHMENT,
                });

                imageBitmaps.forEach((imageBitmap, i) => {
                    this._device.queue.copyExternalImageToTexture(
                        { source: imageBitmap },
                        { texture: cubeTexture, origin: { x: 0, y: 0, z: i } },
                        [imageBitmap.width, imageBitmap.height, 1]
                    );
                })


                texture2dArray.texture = cubeTexture;
            } else {
                this._createTextureBindingToCopy(texture2dArray);
            }
        });
        //--------------------------------------------
        this._texturesExternal.forEach(externalTexture => {
            externalTexture.texture = this._device.importExternalTexture({
                source: externalTexture.video
            });
        });
        //--------------------------------------------
        this._bindingTextures.forEach(bindingTexture => {
            bindingTexture.texture = this._device.createTexture({
                size: bindingTexture.size || this._presentationSize,
                format: 'rgba8unorm',
                usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
            });
        });
    }

    /** @private */
    _createTextureBindingToCopy(texture2d) {
        texture2d.texture = this._device.createTexture({
            size: this._presentationSize,
            format: this._presentationFormat, // if 'depth24plus' throws error
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
    }

    /** @private */
    _createComputeBindGroup() {
        this._renderPasses.forEach((renderPass, index) => {
            if (renderPass.hasComputeShader) {
                const entries = this._createEntries(ShaderType.COMPUTE);
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

                    renderPass.bindGroupLayout = this._device.createBindGroupLayout({ entries: bglEntries });

                    /**
                     * @type {GPUBindGroup}
                     */
                    renderPass.computeBindGroup = this._device.createBindGroup({
                        label: `_createComputeBindGroup 0 - ${index}`,
                        layout: renderPass.bindGroupLayout,
                        entries: entries
                    });
                }
            }
        });
    }

    /** @private */
    async _createPipeline() {

        this._createComputeBindGroup();

        this._renderPasses.forEach((renderPass, index) => {
            if (renderPass.hasComputeShader) {
                renderPass.computePipeline = this._device.createComputePipeline({
                    layout: this._device.createPipelineLayout({
                        bindGroupLayouts: [renderPass.bindGroupLayout]
                    }),
                    label: `_createPipeline() - ${index}`,
                    compute: {
                        module: this._device.createShaderModule({
                            code: renderPass.compiledShaders.compute
                        }),
                        entryPoint: "main"
                    }
                });
            }
        });


        //--------------------------------------


        this._createParams();

        //this.createVertexBuffer(new Float32Array(this._vertexArray));
        // enum GPUPrimitiveTopology {
        //     'point-list',
        //     'line-list',
        //     'line-strip',
        //     'triangle-list',
        //     'triangle-strip',
        // };
        this._renderPasses.forEach(renderPass => {

            if (renderPass.hasVertexAndFragmentShader) {

                renderPass.renderPipeline = this._device.createRenderPipeline({
                    // layout: 'auto',
                    layout: this._device.createPipelineLayout({
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
                        module: this._device.createShaderModule({
                            code: renderPass.compiledShaders.vertex,
                        }),
                        entryPoint: 'main', // shader function name

                        buffers: [
                            {
                                arrayStride: this._vertexBufferInfo.vertexSize,
                                attributes: [
                                    {
                                        // position
                                        shaderLocation: 0,
                                        offset: this._vertexBufferInfo.vertexOffset,
                                        format: 'float32x4',
                                    },
                                    {
                                        // colors
                                        shaderLocation: 1,
                                        offset: this._vertexBufferInfo.colorOffset,
                                        format: 'float32x4',
                                    },
                                    {
                                        // uv
                                        shaderLocation: 2,
                                        offset: this._vertexBufferInfo.uvOffset,
                                        format: 'float32x2',
                                    },
                                ],
                            },
                        ],
                    },
                    fragment: {
                        module: this._device.createShaderModule({
                            code: renderPass.compiledShaders.fragment,
                        }),
                        entryPoint: 'main', // shader function name
                        targets: [
                            {
                                format: this._presentationFormat,

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
     * @private
     * Creates the entries for the pipeline
     * @returns an array with the entries
     */
    _createEntries(shaderType, internal) {
        internal = internal || false;
        let entries = [];
        let bindingIndex = 0;
        if (this._uniforms.length) {
            entries.push(
                {
                    binding: bindingIndex++,
                    resource: {
                        label: 'uniform',
                        buffer: this._uniforms.buffer
                    },
                    type: {
                        name: 'buffer',
                        type: 'uniform'
                    }
                }
            );
        }

        if (this._storage.length) {
            this._storage.forEach(storageItem => {
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

        if (this._layers.length) {
            if (!this._layers.shaderType || this._layers.shaderType == shaderType) {
                entries.push(
                    {
                        binding: bindingIndex++,
                        resource: {
                            label: 'layer',
                            buffer: this._layers.buffer
                        },
                        type: {
                            name: 'buffer',
                            type: 'storage'
                        }
                    }
                );
            }
        }

        if (this._samplers.length) {
            this._samplers.forEach((sampler, index) => {
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

        if (this._texturesStorage2d.length) {
            this._texturesStorage2d.forEach((textureStorage2d, index) => {
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

        if (this._textures2d.length) {
            this._textures2d.forEach((texture2d, index) => {
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

        if (this._textures2dArray.length) {
            this._textures2dArray.forEach((texture2dArray, index) => {
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

        if (this._texturesExternal.length) {
            this._texturesExternal.forEach(externalTexture => {
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

        if (this._bindingTextures.length) {
            this._bindingTextures.forEach(bindingTexture => {
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

            this._bindingTextures.forEach(bindingTexture => {
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

    /** @private */
    _createParams() {
        this._renderPasses.forEach(renderPass => {

            const entries = this._createEntries(ShaderType.FRAGMENT, renderPass.internal);
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

                renderPass.bindGroupLayout = this._device.createBindGroupLayout({ entries: bglEntries });

                renderPass.uniformBindGroup = this._device.createBindGroup({
                    label: '_createParams() 0',
                    layout: renderPass.bindGroupLayout,
                    entries: entries
                });
            }
        });

    }

    async update() {
        if (!this._canvas || !this._device) return;

        //--------------------------------------------
        this._delta = this._clock.getDelta();
        this._time = this._clock.time;
        this._epoch = new Date() / 1000;
        this.updateUniform(UniformKeys.TIME, this._time);
        this.updateUniform(UniformKeys.DELTA, this._delta);
        this.updateUniform(UniformKeys.EPOCH, this._epoch);
        this.updateUniform(UniformKeys.SCREEN, [this._canvas.width, this._canvas.height]);
        this.updateUniform(UniformKeys.MOUSE, [this._mouseX, this._mouseY]);

        this.updateUniform(UniformKeys.MOUSE_CLICK, this._mouseClick);
        this.updateUniform(UniformKeys.MOUSE_DOWN, this._mouseDown);
        this.updateUniform(UniformKeys.MOUSE_WHEEL, this._mouseWheel);
        this.updateUniform(UniformKeys.MOUSE_DELTA, this._mouseDelta);
        //--------------------------------------------

        this._createParametersUniforms();

        // TODO: create method for this
        this._storage.forEach(storageItem => {
            if (storageItem.mapped) {
                const values = new Float32Array(storageItem.array);
                storageItem.buffer = this._createAndMapBuffer(values, storageItem.usage);
            }
        });

        // AUDIO
        // this._analyser.getByteTimeDomainData(this._dataArray);
        this._sounds.forEach(sound => {
            sound.analyser?.getByteFrequencyData(sound.data);
        });
        // END AUDIO

        this._texturesExternal.forEach(externalTexture => {
            externalTexture.texture = this._device.importExternalTexture({
                source: externalTexture.video
            });

            if ('requestVideoFrameCallback' in externalTexture.video) {
                externalTexture.video.requestVideoFrameCallback(() => { });
            }
        });


        this._createComputeBindGroup();


        let commandEncoder = this._device.createCommandEncoder();


        this._renderPasses.forEach(renderPass => {
            if (renderPass.hasComputeShader) {
                const passEncoder = commandEncoder.beginComputePass();
                passEncoder.setPipeline(renderPass.computePipeline);
                if (this._uniforms.length) {
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


        this._renderPassDescriptor.colorAttachments[0].view = this._context.getCurrentTexture().createView();
        this._renderPassDescriptor.depthStencilAttachment.view = this._depthTexture.createView();


        const swapChainTexture = this._context.getCurrentTexture();


        //commandEncoder = this._device.createCommandEncoder();
        this._renderPasses.forEach((renderPass, renderPassIndex) => {
            if (renderPass.hasVertexAndFragmentShader) {
                const passEncoder = commandEncoder.beginRenderPass(this._renderPassDescriptor);
                passEncoder.setPipeline(renderPass.renderPipeline);

                this._createParams();
                if (this._uniforms.length) {
                    passEncoder.setBindGroup(0, renderPass.uniformBindGroup);
                }
                passEncoder.setVertexBuffer(0, this._buffer);

                /**
                 * vertexCount: number The number of vertices to draw
                 * instanceCount?: number | undefined The number of instances to draw
                 * firstVertex?: number | undefined Offset into the vertex buffers, in vertices, to begin drawing from
                 * firstInstance?: number | undefined First instance to draw
                 */
                //passEncoder.draw(3, 1, 0, 0);
                passEncoder.draw(this._vertexBufferInfo.vertexCount);
                passEncoder.end();

                // Copy the rendering results from the swapchain into |texture2d.texture|.

                this._textures2d.forEach(texture2d => {
                    if (texture2d.renderPassIndex == renderPassIndex || texture2d.renderPassIndex == null) {
                        if (texture2d.copyCurrentTexture) {
                            commandEncoder.copyTextureToTexture(
                                {
                                    texture: swapChainTexture,
                                },
                                {
                                    texture: texture2d.texture,
                                },
                                this._presentationSize
                            );
                        }
                    }
                });
            }
        });




        if (this._readStorage.length) {
            this._readStorage.forEach(readStorageItem => {
                let storageItem = this._storage.find(storageItem => storageItem.name === readStorageItem.name);

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

        this._commandsFinished.push(commandEncoder.finish());
        this._device.queue.submit(this._commandsFinished);
        this._commandsFinished = [];

        //
        //this._vertexArray = [];

        // reset mouse values because it doesn't happen by itself
        this._mouseClick = false;
        this._mouseWheel = false;
        this._mouseDelta = [0, 0];

        await this.read();
    }

    async read() {
        for (const [key, event] of this._events) {
            let eventRead = await this.readStorage(event.name);
            if (eventRead) {
                let id = eventRead[0];
                if (id != 0) {
                    event.callback && event.callback(eventRead.slice(1, -1));
                }
            }
        }
    }

    /** @private */
    _getWGSLCoordinate(value, side, invert = false) {
        const direction = invert ? -1 : 1;
        const p = value / side;
        return (p * 2 - 1) * direction;
    };

    /**
     * Adds two triangles as a quad called Point
     * @param {Coordinate} coordinate `x` from 0 to canvas.width, `y` from 0 to canvas.height, `z` it goes from 0.0 to 1.0 and forward
     * @param {Number} width point width
     * @param {Number} height point height
     * @param {Array<RGBAColor>} colors one color per corner
     * @param {Boolean} useTexture
     */
    addPoint(coordinate, width, height, colors) {
        const { x, y, z } = coordinate;
        const nx = this._getWGSLCoordinate(x, this._canvas.width);
        const ny = this._getWGSLCoordinate(y, this._canvas.height, true);
        const nz = z;

        const nw = this._getWGSLCoordinate(x + width, this._canvas.width);
        const nh = this._getWGSLCoordinate(y + height, this._canvas.height);

        const { r: r0, g: g0, b: b0, a: a0 } = colors[0];
        const { r: r1, g: g1, b: b1, a: a1 } = colors[1];
        const { r: r2, g: g2, b: b2, a: a2 } = colors[2];
        const { r: r3, g: g3, b: b3, a: a3 } = colors[3];
        this._vertexArray.push(
            +nx, +ny, nz, 1, r0, g0, b0, a0, (+nx + 1) * .5, (+ny + 1) * .5,// 0 top left
            +nw, +ny, nz, 1, r1, g1, b1, a1, (+nw + 1) * .5, (+ny + 1) * .5,// 1 top right
            +nw, -nh, nz, 1, r3, g3, b3, a3, (+nw + 1) * .5, (-nh + 1) * .5,// 2 bottom right

            +nx, +ny, nz, 1, r0, g0, b0, a0, (+nx + 1) * .5, (+ny + 1) * .5,// 3 top left
            +nx, -nh, nz, 1, r2, g2, b2, a2, (+nx + 1) * .5, (-nh + 1) * .5,// 4 bottom left
            +nw, -nh, nz, 1, r3, g3, b3, a3, (+nw + 1) * .5, (-nh + 1) * .5,// 5 bottom right
        );
    }

    get canvas() {
        return this._canvas;
    }

    get device() {
        return this._device;
    }

    get context() {
        return this._context;
    }

    get presentationFormat() {
        return this._presentationFormat;
    }

    get buffer() {
        return this._buffer;
    }

    get fullscreen() {
        return this._fullscreen;
    }

    set fullscreen(value) {
        if (value) {
            this._lastFitWindow = this._fitWindow;
            this.fitWindow = value;
            this._canvas.requestFullscreen().catch(err => {
                throw `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`;
            });
            this._fullscreen = true;
        } else {
            document.exitFullscreen();
            this._fullscreen = false;
            this._resizeCanvasToDefault();
        }
    }

    get fitWindow() {
        return this._fitWindow;
    }

    set fitWindow(value) {
        if (!this._context) {
            throw 'fitWindow must be assigned after Points.init() call or you don\'t have a Canvas assigned in the constructor';
        }
        this._fitWindow = value;
        if (this._fitWindow) {
            this._resizeCanvasToFitWindow();
        } else {
            this._resizeCanvasToDefault();
        }
    }

    // -----------------------------
    videoStream = null;
    mediaRecorder = null;
    videoRecordStart() {
        const options = {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 6000000,
            mimeType: 'video/webm',
        };
        this.videoStream = this._canvas.captureStream(60);
        this.mediaRecorder = new MediaRecorder(this.videoStream, options);

        let chunks = [];
        this.mediaRecorder.ondataavailable = function (e) {
            chunks.push(e.data);
        };
        this.mediaRecorder.onstop = function (e) {
            const blob = new Blob(chunks, { 'type': 'video/webm' });
            chunks = [];
            let videoURL = URL.createObjectURL(blob);
            window.open(videoURL);
        };
        this.mediaRecorder.ondataavailable = function (e) {
            chunks.push(e.data);
        };

        this.mediaRecorder.start();
    }

    videoRecordStop() {
        this.mediaRecorder.stop();
    }
}
