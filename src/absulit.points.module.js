'use strict';
import Coordinate from './coordinate.js';
import RGBAColor from './color.js';
import defaultStructs from './core/defaultStructs.js';
import { defaultVertexBody } from './core/defaultFunctions.js';

export class ShaderType {
    static VERTEX = 1;
    static COMPUTE = 2;
    static FRAGMENT = 3;
}

class UniformKeys {
    static TIME = 'time';
    static EPOCH = 'epoch';
    static SCREEN_WIDTH = 'screenWidth';
    static SCREEN_HEIGHT = 'screenHeight';
    static MOUSE_X = 'mouseX';
    static MOUSE_Y = 'mouseY';
    static MOUSE_CLICK = 'mouseClick';
    static MOUSE_DOWN = 'mouseDown';
    static MOUSE_WHEEL = 'mouseWheel';
    static MOUSE_DELTA_X = 'mouseDeltaX';
    static MOUSE_DELTA_Y = 'mouseDeltaY';
}

export class RenderPass {
    /**
     * A collection of Vertex, Compute and Fragment shaders that represent a RenderPass.
     * This is useful for PostProcessing.
     * @param {String} vertexShader  WGSL Vertex Shader in a String.
     * @param {String} fragmentShader  WGSL Fragment Shader in a String.
     * @param {String} computeShader  WGSL Compute Shader in a String.
     */
    constructor(vertexShader, fragmentShader, computeShader, workgroupCountX, workgroupCountY, workgroupCountZ) {
        this._vertexShader = vertexShader;
        this._computeShader = computeShader;
        this._fragmentShader = fragmentShader;

        this._computePipeline = null;
        this._renderPipeline = null;

        this._computeBindGroup = null;
        this._uniformBindGroup = null;

        this._internal = false;

        this._compiledShaders = {
            vertex: '',
            compute: '',
            fragment: '',
        }

        this._hasComputeShader = !!this._computeShader;
        this._hasVertexShader = !!this._vertexShader;
        this._hasFragmentShader = !!this._fragmentShader;

        this._hasVertexAndFragmentShader = this._hasVertexShader && this._hasFragmentShader;

        this._workgroupCountX = workgroupCountX || 8;
        this._workgroupCountY = workgroupCountY || 8;
        this._workgroupCountZ = workgroupCountZ || 1;
    }

    get internal() {
        return this._internal;
    }

    set internal(value) {
        this._internal = value;
    }

    get vertexShader() {
        return this._vertexShader;
    }

    get computeShader() {
        return this._computeShader;
    }

    get fragmentShader() {
        return this._fragmentShader;
    }

    set computePipeline(value) {
        this._computePipeline = value;
    }

    get computePipeline() {
        return this._computePipeline;
    }

    set renderPipeline(value) {
        this._renderPipeline = value;
    }

    get renderPipeline() {
        return this._renderPipeline;
    }

    set computeBindGroup(value) {
        this._computeBindGroup = value;
    }

    get computeBindGroup() {
        return this._computeBindGroup;
    }

    set uniformBindGroup(value) {
        this._uniformBindGroup = value;
    }

    get uniformBindGroup() {
        return this._uniformBindGroup;
    }

    get compiledShaders() {
        return this._compiledShaders;
    }

    get hasComputeShader() {
        return this._hasComputeShader;
    }

    get hasVertexShader() {
        return this._hasVertexShader;
    }

    get hasFragmentShader() {
        return this._hasFragmentShader;
    }

    get hasVertexAndFragmentShader() {
        return this._hasVertexAndFragmentShader;
    }

    get workgroupCountX() {
        return this._workgroupCountX;
    }

    get workgroupCountY() {
        return this._workgroupCountY;
    }

    get workgroupCountZ() {
        return this._workgroupCountZ;
    }
}

export class VertexBufferInfo {
    /**
     * Along with the vertexArray it calculates some info like offsets required for the pipeline.
     * @param {Float32Array} vertexArray array with vertex, color and uv data
     * @param {Number} triangleDataLength how many items does a triangle row has in vertexArray
     * @param {Number} vertexOffset index where the vertex data starts in a row of `triangleDataLength` items
     * @param {Number} colorOffset index where the color data starts in a row of `triangleDataLength` items
     * @param {Number} uvOffset index where the uv data starts in a row of `triangleDataLength` items
     */
    constructor(vertexArray, triangleDataLength = 10, vertexOffset = 0, colorOffset = 4, uvOffset = 8) {
        this._vertexSize = vertexArray.BYTES_PER_ELEMENT * triangleDataLength; // Byte size of ONE triangle data (vertex, color, uv). (one row)
        this._vertexOffset = vertexArray.BYTES_PER_ELEMENT * vertexOffset;
        this._colorOffset = vertexArray.BYTES_PER_ELEMENT * colorOffset; // Byte offset of triangle vertex color attribute.
        this._uvOffset = vertexArray.BYTES_PER_ELEMENT * uvOffset;
        this._vertexCount = vertexArray.byteLength / this._vertexSize;
    }

    get vertexSize() {
        return this._vertexSize
    }

    get vertexOffset() {
        return this._vertexOffset;
    }

    get colorOffset() {
        return this._colorOffset;
    }

    get uvOffset() {
        return this._uvOffset;
    }

    get vertexCount() {
        return this._vertexCount;
    }
}

export default class Points {
    constructor(canvasId) {
        this._canvasId = canvasId;
        this._canvas = null;
        this._device = null;
        this._context = null;
        this._presentationFormat = null;
        this._renderPasses = null;
        this._postRenderPasses = [];
        this._vertexBufferInfo = null;
        this._buffer = null;
        this._internal = false;

        this._presentationSize = null;
        this._depthTexture = null;
        this._commandEncoder = null;

        this._vertexArray = [];

        this._numColumns = 1;
        this._numRows = 1;

        this._commandsFinished = [];

        this._renderPassDescriptor = null;

        this._uniforms = [];
        this._storage = [];
        this._readStorage = [];
        this._samplers = [];
        this._textures2d = [];
        this._texturesExternal = [];
        this._texturesStorage2d = [];
        this._bindingTextures = [];

        this._layers = [];

        this._canvas = document.getElementById(this._canvasId);

        this._time = 0;
        this._epoch = 0;
        this._mouseX = 0;
        this._mouseY = 0;
        this._mouseDown = false;
        this._mouseClick = false;
        this._mouseWheel = false;
        this._mouseDeltaX = 0;
        this._mouseDeltaY = 0;

        if (this._canvasId) {
            this._canvas.addEventListener('click', e => {
                this._mouseClick = true;
            });
            this._canvas.addEventListener('mousemove', e => {
                this._mouseX = e.clientX;
                this._mouseY = e.clientY;
            });
            this._canvas.addEventListener('mousedown', e => {
                this._mouseDown = true;
            });
            this._canvas.addEventListener('mouseup', e => {
                this._mouseDown = false;
            });

            this._canvas.addEventListener('wheel', e => {
                this._mouseWheel = true;
                this._mouseDeltaX = e.deltaX;
                this._mouseDeltaY = e.deltaY;
            });
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

        this._fullscreen = false;
        this._fitWindow = false;
        this._lastFitWindow = false;

        // audio
        this._sounds = [];

        this._events = {};
    }

    _resizeCanvasToFitWindow = () => {
        if (this._fitWindow) {
            this._canvas.width = window.innerWidth;
            this._canvas.height = window.innerHeight;
            this._setScreenSize();
        }
    }

    _resizeCanvasToDefault = () => {
        this._canvas.width = this._originalCanvasWidth;
        this._canvas.height = this._originalCanvasHeigth;
        this._setScreenSize();
    }

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
    }

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
     * @param {Number} value Number will be converted to `f32`
     */
    addUniform(name, value) {
        if (this._nameExists(this._uniforms, name)) {
            return;
        }
        // TODO: add a third parameter with a type, so a struct can be defined and pass things like booleans
        this._uniforms.push({
            name: name,
            value: value,
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
     * Creates a persistent memory buffer across every frame call.
     * @param {string} name Name that the Storage will have in the shader
     * @param {Number} size Number of items it will have.
     * Multiply this by number of properties in the struct if necessary.
     * @param {string} structName Name of the struct already existing on the
     * shader that will be the array<structName> of the Storage
     * @param {Number} structSize this tells how many sub items the struct has
     * @param {boolean} read if this is going to be used to read data back
     * @param {ShaderType} shaderType this tells to what shader the storage is bound
     */
    addStorage(name, size, structName, structSize, read, shaderType, arrayData) {
        if (this._nameExists(this._storage, name)) {
            return;
        }
        this._storage.push({
            mapped: !!arrayData,
            name: name,
            size: size,
            structName: structName,
            structSize: structSize,
            shaderType: shaderType,
            read: read,
            buffer: null,
            internal: this._internal
        });

        if (read) {
            let storageItem = {
                name: name,
                size: structSize * size
            }
            this._readStorage.push(storageItem);
        }
    }

    addStorageMap(name, arrayData, structName, shaderType) {
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
        // TODO: if read true add flag in addStorage
        let storageItem = this._readStorage.find(storageItem => storageItem.name === name);
        let arrayBuffer = null;
        let arrayBufferCopy = null;
        if (storageItem) {
            await storageItem.buffer.mapAsync(GPUMapMode.READ)
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
                structSize: 4,
                array: null,
                buffer: null,
                internal: this._internal
            });
        }
    }

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
     * Load an image as texture2d
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
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(audio);

        // // audioCtx.createMediaStreamSource()
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;

        source.connect(analyser);
        analyser.connect(audioCtx.destination);

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
    }

    //
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
    addEventListener(id, callback) {
        this._events[id] = callback;
    }

    /**
     * for internal use:
     * to flag add* methods and variables as part of the RenderPasses
     */
    _setInternal(value) {
        this._internal = value;
    }

    /**
     *
     * @param {ShaderType} shaderType
     * @param {boolean} internal
     * @returns string with bindings
     */
    _createDynamicGroupBindings(shaderType, internal) {
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
                if (!storageItem.mapped) {
                    if (storageItem.array?.length) {
                        storageItem.size = storageItem.array.length;
                    }
                    if (storageItem.size > 1) {
                        T = `array<${storageItem.structName}>`;
                    }
                }
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
        this._uniforms.forEach(variable => {
            let uniformType = variable.type || 'f32';
            dynamicStructParams += /*wgsl*/`${variable.name}:${uniformType}, \n\t`;
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

    /**
     * One time function to call to initialize the shaders.
     * @param {array<RenderPass>} renderPasses Collection of RenderPass, which contain Vertex, Compute and Fragment shaders.
     * @returns false | undefined
     */
    async init(renderPasses) {

        this._renderPasses = renderPasses.concat(this._postRenderPasses);

        // initializing internal uniforms
        this.addUniform(UniformKeys.TIME, this._time);
        this.addUniform(UniformKeys.EPOCH, this._epoch);
        this.addUniform(UniformKeys.SCREEN_WIDTH, 0);
        this.addUniform(UniformKeys.SCREEN_HEIGHT, 0);
        this.addUniform(UniformKeys.MOUSE_X, this._mouseX);
        this.addUniform(UniformKeys.MOUSE_Y, this._mouseY);
        this.addUniform(UniformKeys.MOUSE_CLICK, this._mouseClick);
        this.addUniform(UniformKeys.MOUSE_DOWN, this._mouseDown);
        this.addUniform(UniformKeys.MOUSE_WHEEL, this._mouseWheel);
        this.addUniform(UniformKeys.MOUSE_DELTA_X, this._mouseDeltaX);
        this.addUniform(UniformKeys.MOUSE_DELTA_Y, this._mouseDeltaY);

        let hasComputeShaders = this._renderPasses.some(renderPass => renderPass.hasComputeShader);
        if (!hasComputeShaders && this._bindingTextures.length) {
            throw ' `addBindingTexture` requires at least one Compute Shader in a `RenderPass`'
        }

        this._renderPasses.forEach(this._compileRenderPass);
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
            this.createVertexBuffer(new Float32Array(this._vertexArray));
        }

        this.createComputeBuffers();

        await this.createPipeline();
    }

    /**
     *
     * @param {Float32Array} vertexArray
     * @returns buffer
     */
    createVertexBuffer(vertexArray) {
        this._vertexBufferInfo = new VertexBufferInfo(vertexArray);
        this._buffer = this._createAndMapBuffer(vertexArray, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
    }

    /**
     *
     * @param {Float32Array} data
     * @param {GPUBufferUsageFlags} usage
     * @param {Boolean} mappedAtCreation
     * @returns mapped buffer
     */
    _createAndMapBuffer(data, usage, mappedAtCreation = true) {
        const buffer = this._device.createBuffer({
            mappedAtCreation: mappedAtCreation,
            size: data.byteLength,
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
     * @returns buffer
     */
    _createBuffer(size, usage) {
        const buffer = this._device.createBuffer({
            size: size,
            usage: usage,
        });
        return buffer
    }

    _createParametersUniforms() {
        const values = new Float32Array(this._uniforms.map(v => v.value));
        this._uniforms.buffer = this._createAndMapBuffer(values, GPUBufferUsage.UNIFORM);
    }

    createComputeBuffers() {
        //--------------------------------------------
        this._createParametersUniforms();
        //--------------------------------------------
        this._storage.forEach(storageItem => {
            if (storageItem.mapped) {
                const values = new Float32Array(storageItem.array);
                storageItem.buffer = this._createAndMapBuffer(values, GPUBufferUsage.STORAGE);
            } else {
                let usage = GPUBufferUsage.STORAGE;
                if (storageItem.read) {
                    usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC;
                }
                storageItem.buffer = this._createBuffer(storageItem.size * storageItem.structSize * 4, usage);
            }
        });
        //--------------------------------------------
        this._readStorage.forEach(readStorageItem => {
            readStorageItem.buffer = this._device.createBuffer({
                size: readStorageItem.size * 4,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
            });
        });
        //--------------------------------------------
        if (this._layers.length) {
            //let layerValues = [];
            let layersSize = 0;
            this._layers.forEach(layerItem => {
                layersSize += layerItem.size * layerItem.structSize * 4;
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
                texture2d.texture = this._device.createTexture({
                    size: this._presentationSize,
                    format: this._presentationFormat, // if 'depth24plus' throws error
                    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
                });
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

    async createPipeline() {

        this._createComputeBindGroup();

        this._renderPasses.forEach((renderPass, index) => {
            if (renderPass.hasComputeShader) {
                renderPass.computePipeline = this._device.createComputePipeline({
                    layout: this._device.createPipelineLayout({
                        bindGroupLayouts: [renderPass.bindGroupLayout]
                    }),
                    label: `createPipeline() - ${index}`,
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
        if (!this._canvas) return;
        if (!this._device) return;

        //--------------------------------------------
        this._time += 0.016666666666666666;//1 / 60; TODO: change to delta
        this._epoch = new Date() / 1000;
        this.updateUniform(UniformKeys.TIME, this._time);
        this.updateUniform(UniformKeys.EPOCH, this._epoch);
        this.updateUniform(UniformKeys.SCREEN_WIDTH, this._canvas.width);
        this.updateUniform(UniformKeys.SCREEN_HEIGHT, this._canvas.height);
        this.updateUniform(UniformKeys.MOUSE_X, this._mouseX);
        this.updateUniform(UniformKeys.MOUSE_Y, this._mouseY);
        this.updateUniform(UniformKeys.MOUSE_CLICK, this._mouseClick);
        this.updateUniform(UniformKeys.MOUSE_DOWN, this._mouseDown);
        this.updateUniform(UniformKeys.MOUSE_WHEEL, this._mouseWheel);
        this.updateUniform(UniformKeys.MOUSE_DELTA_X, this._mouseDeltaX);
        this.updateUniform(UniformKeys.MOUSE_DELTA_Y, this._mouseDeltaY);
        //--------------------------------------------

        this._createParametersUniforms();

        // TODO: create method for this
        this._storage.forEach(storageItem => {
            if (storageItem.mapped) {
                const values = new Float32Array(storageItem.array);
                storageItem.buffer = this._createAndMapBuffer(values, GPUBufferUsage.STORAGE);
            }
        });

        // AUDIO
        // this._analyser.getByteTimeDomainData(this._dataArray);
        this._sounds.forEach(sound => {
            sound.analyser?.getByteFrequencyData(sound.data);
        })
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
        this._mouseDeltaX = 0;
        this._mouseDeltaY = 0;

        await this.read();
    }

    async read() {
        let eventRead = await this.readStorage('event');
        let id = eventRead[0];
        if(id != -1){
            // console.log(id);
            let callback = this._events[id];
            console.log(callback);
            callback(eventRead.slice(1, -1));
        }
    }

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
            mimeType: "video/webm",
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
