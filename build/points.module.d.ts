/**
 * A numeric value that may be negative or positive.
 */
export type SignedNumber = number;
export class RenderPass {
    /**
     * A collection of Vertex, Compute and Fragment shaders that represent a RenderPass.
     * This is useful for PostProcessing.
     * @param {String} vertexShader  WGSL Vertex Shader in a String.
     * @param {String} fragmentShader  WGSL Fragment Shader in a String.
     * @param {String} computeShader  WGSL Compute Shader in a String.
     */
    constructor(vertexShader: string, fragmentShader: string, computeShader: string, workgroupCountX: any, workgroupCountY: any, workgroupCountZ: any);
    set internal(value: boolean);
    get internal(): boolean;
    get vertexShader(): string;
    get computeShader(): string;
    get fragmentShader(): string;
    set computePipeline(value: any);
    get computePipeline(): any;
    set renderPipeline(value: any);
    get renderPipeline(): any;
    set computeBindGroup(value: any);
    get computeBindGroup(): any;
    set uniformBindGroup(value: any);
    get uniformBindGroup(): any;
    get compiledShaders(): {
        vertex: string;
        compute: string;
        fragment: string;
    };
    get hasComputeShader(): boolean;
    get hasVertexShader(): boolean;
    get hasFragmentShader(): boolean;
    get hasVertexAndFragmentShader(): boolean;
    get workgroupCountX(): any;
    get workgroupCountY(): any;
    get workgroupCountZ(): any;
    #private;
}
/**
 * List of predefined Render Passes for Post Processing.
 * @class
 */
export class RenderPasses {
    static COLOR: number;
    static GRAYSCALE: number;
    static CHROMATIC_ABERRATION: number;
    static PIXELATE: number;
    static LENS_DISTORTION: number;
    static FILM_GRAIN: number;
    static BLOOM: number;
    static BLUR: number;
    static WAVES: number;
    static "__#11@#LIST": {
        1: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        2: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        3: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        4: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        5: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => Promise<void>;
        };
        6: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        7: {
            vertexShader: string;
            fragmentShader: string;
            /**
             *
             * @param {Points} points
             * @param {*} params
             */
            init: (points: Points, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        8: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        9: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
    };
    /**
     * Add a `RenderPass` from the `RenderPasses` list
     * @param {Points} points References a `Points` instance
     * @param {RenderPasses} renderPassId Select a static property from `RenderPasses`
     * @param {Object} params An object with the params needed by the `RenderPass`
     * @returns {Promise<void>}
     */
    static add(points: Points, renderPassId: RenderPasses, params: any): Promise<void>;
    /**
     * Color postprocessing
     * @param {Points} points a `Points` reference
     * @param {Number} r red
     * @param {Number} g green
     * @param {Number} b blue
     * @param {Number} a alpha
     * @param {Number} blendAmount how much you want to blend it from 0..1
     * @returns {Promise<void>}
     */
    static color(points: Points, r: number, g: number, b: number, a: number, blendAmount: number): Promise<void>;
    /**
     * Grayscale postprocessing. Takes the brightness of an image and returns it; that makes the grayscale result.
     * @param {Points} points a `Points` reference
     * @returns {Promise<void>}
     */
    static grayscale(points: Points): Promise<void>;
    /**
     * Chromatic Aberration postprocessing. Color bleeds simulating a lens effect without distortion.
     * @param {Points} points a `Points` reference
     * @param {Number} distance from 0..1 how far the channels are visually apart from each other in the screen, but the value can be greater and negative
     * @returns {Promise<void>}
     */
    static chromaticAberration(points: Points, distance: number): Promise<void>;
    /**
     * Pixelate postprocessing. It reduces the amount of pixels in the output preserving the scale.
     * @param {Points} points a `Points` reference
     * @param {Number} width width of the pixel in pixels
     * @param {Number} height width of the pixel in pixels
     * @returns {Promise<void>}
     */
    static pixelate(points: Points, width: number, height: number): Promise<void>;
    /**
     * Lens Distortion postprocessing. A fisheye distortion with chromatic aberration.
     * @param {Points} points a `Points` reference
     * @param {Number} amount positive or negative value on how distorted the image will be
     * @param {Number} distance of chromatic aberration: from 0..1 how far the channels are visually apart from each other in the screen, but the value can be greater and negative
     * @returns {Promise<void>}
     */
    static lensDistortion(points: Points, amount: number, distance: number): Promise<void>;
    /**
     * Film grain postprocessing. White noise added to the output to simulate film irregularities.
     * @param {Points} points a `Points` reference
     * @returns {Promise<void>}
     */
    static filmgrain(points: Points): Promise<void>;
    /**
     * Bloom postprocessing. Increases brightness of already bright areas to create a haze effect.
     * @param {Points} points a `Points` reference
     * @param {Number} amount how bright the effect will be
     * @returns {Promise<void>}
     */
    static bloom(points: Points, amount: number): Promise<void>;
    /**
     * Blur postprocessing. Softens an image by creating multiple samples.
     * @param {Points} points a `Points` reference
     * @param {Number} resolutionX Samples in X
     * @param {Number} resolutionY Samples in Y
     * @param {Number} directionX direction in X
     * @param {Number} directionY directon in Y
     * @param {Number} radians rotation in radians
     * @returns {Promise<void>}
     */
    static blur(points: Points, resolutionX: number, resolutionY: number, directionX: number, directionY: number, radians: number): Promise<void>;
    /**
     * Waves postprocessing. Distorts the image with noise to create a water like effect.
     * @param {Points} points a `Points` reference
     * @param {Number} scale how big the wave noise is
     * @param {Number} intensity a soft or hard effect
     * @returns {Promise<void>}
     */
    static waves(points: Points, scale: number, intensity: number): Promise<void>;
}
export class ShaderType {
    static VERTEX: number;
    static COMPUTE: number;
    static FRAGMENT: number;
}
declare class Points {
    constructor(canvasId: any);
    set fitWindow(value: boolean);
    get fitWindow(): boolean;
    /**
     * @deprecated use setUniform
     */
    addUniform(name: any, value: any, structName: any): void;
    /**
     * @deprecated use setUniform
     */
    updateUniform(name: any, value: any): void;
    /**
     * Set a param as uniform to send to all shaders.
     * A Uniform is a value that can only be changed
     * from the outside, and unless changed it remains
     * consistent.
     * @param {string} name name of the Param, you can invoke it later in shaders as `Params.[name]`
     * @param {Number|Boolean|Array<Number>} value Single number or a list of numbers. Boolean is converted to Number.
     * @param {string} structName type as `f32` or a custom struct. Default `few`
     */
    setUniform(name: string, value: number | boolean | Array<number>, structName?: string): {
        name: string;
        value: number | boolean | number[];
        type: string;
        size: any;
        internal: boolean;
    };
    /**
     * Update a list of uniforms
     * @param {Array<Object>} arr object array of the type: `{name, value}`
     */
    updateUniforms(arr: Array<any>): void;
    /**
     * @deprecated use setStorage()
     */
    addStorage(name: any, structName: any, read: any, shaderType: any, arrayData: any): void;
    /**
     * Creates a persistent memory buffer across every frame call.
     * @param {string} name Name that the Storage will have in the shader
     * @param {string} structName Name of the struct already existing on the
     * shader that will be the array<structName> of the Storage
     * @param {boolean} read if this is going to be used to read data back
     * @param {ShaderType} shaderType this tells to what shader the storage is bound
     */
    setStorage(name: string, structName: string, read: boolean, shaderType: ShaderType, arrayData: any): {
        mapped: boolean;
        name: string;
        structName: string;
        shaderType: ShaderType;
        read: boolean;
        buffer: any;
        internal: boolean;
    };
    /**
     * @deprecated
     */
    addStorageMap(name: any, arrayData: any, structName: any, read: any, shaderType: any): void;
    /**
     * @deprecated use setStorageMap
     */
    updateStorageMap(name: any, arrayData: any): void;
    /**
     * Creates a persistent memory buffer across every frame call that can be updated.
     * @param {string} name Name that the Storage will have in the shader.
     * @param {Uint8Array<ArrayBuffer>} arrayData array with the data that must match the struct.
     * @param {string} structName Name of the struct already existing on the
     * shader that will be the array<structName> of the Storage.
     * @param {boolean} read if this is going to be used to read data back.
     * @param {ShaderType} shaderType this tells to what shader the storage is bound
     */
    setStorageMap(name: string, arrayData: Uint8Array<ArrayBuffer>, structName: string, read?: boolean, shaderType?: ShaderType): any;
    readStorage(name: any): Promise<Float32Array<any>>;
    /**
     * @deprecated use {@link setLayers}
     */
    addLayers(numLayers: any, shaderType: any): void;
    /**
     * Layers of data made of `vec4f`
     * @param {Number} numLayers
     * @param {ShaderType} shaderType
     */
    setLayers(numLayers: number, shaderType: ShaderType): void;
    /**
     * @deprecated use setSampler
     */
    addSampler(name: any, descriptor: any, shaderType: any): void;
    /**
     * Creates a `sampler` to be sent to the shaders.
     * @param {string} name Name of the `sampler` to be called in the shaders.
     * @param {GPUSamplerDescriptor} descriptor
     */
    setSampler(name: string, descriptor: GPUSamplerDescriptor, shaderType: any): {
        name: string;
        descriptor: GPUSamplerDescriptor;
        shaderType: any;
        resource: any;
        internal: boolean;
    };
    /**
     * @deprecated use setTexture2d
     */
    addTexture2d(name: any, copyCurrentTexture: any, shaderType: any, renderPassIndex: any): void;
    /**
     * Create a `texture_2d` in the shaders.
     * @param {string} name Name to call the texture in the shaders.
     * @param {boolean} copyCurrentTexture If you want the fragment output to be copied here.
     */
    setTexture2d(name: string, copyCurrentTexture: boolean, shaderType: any, renderPassIndex: any): {
        name: string;
        copyCurrentTexture: boolean;
        shaderType: any;
        texture: any;
        renderPassIndex: any;
        internal: boolean;
    };
    copyTexture(nameTextureA: any, nameTextureB: any): void;
    /**
     * @deprecated use setTextureImage
     */
    addTextureImage(name: any, path: any, shaderType: any): Promise<void>;
    /**
     * @deprecated use setTextureImage
     */
    updateTextureImage(name: any, path: any, shaderType: any): Promise<void>;
    /**
     * Load an image as texture_2d
     * @param {string} name
     * @param {string} path
     * @param {ShaderType} shaderType
     * @returns {Object}
     */
    setTextureImage(name: string, path: string, shaderType?: ShaderType): any;
    /**
     * Loads a text string as a texture.
     * Using an Atlas or a Spritesheet with UTF-16 chars (`path`) it will create a new texture
     * that contains only the `text` characters.
     * Characters in the atlas `path` must be in order of the UTF-16 chars.
     * It can have missing characters at the end or at the start, so the `offset` is added to take account for those chars.
     * For example, `A` is 65, but if one character is removed before the letter `A`, then offset is -1
     * @param {String} name id of the wgsl variable in the shader
     * @param {String} text text you want to load as texture
     * @param {String} path atlas to grab characters from
     * @param {{x: number, y: number}} size size of a individual character e.g.: `{x:10, y:20}`
     * @param {Number} offset how many characters back or forward it must move to start
     * @param {String} shaderType
     * @returns {Object}
     */
    setTextureString(name: string, text: string, path: string, size: {
        x: number;
        y: number;
    }, offset?: number, shaderType?: string): any;
    /**
     * Load images as texture_2d_array
     * @param {string} name
     * @param {Array} paths
     * @param {ShaderType} shaderType
     */
    setTextureImageArray(name: string, paths: any[], shaderType: ShaderType): Promise<void>;
    /**
     * @deprecated use setTextureVideo
     */
    addTextureVideo(name: any, path: any, shaderType: any): Promise<void>;
    /**
     * Load an video as texture2d
     * @param {string} name
     * @param {string} path
     * @param {ShaderType} shaderType
     */
    setTextureVideo(name: string, path: string, shaderType: ShaderType): Promise<{
        name: string;
        shaderType: ShaderType;
        video: HTMLVideoElement;
        internal: boolean;
    }>;
    /**
     * @deprecated use setTextureWebcam
     */
    addTextureWebcam(name: any, shaderType: any): Promise<void>;
    /**
     * Load webcam as texture2d
     * @param {string} name
     * @param {ShaderType} shaderType
     */
    setTextureWebcam(name: string, shaderType: ShaderType): Promise<{
        name: string;
        shaderType: ShaderType;
        video: HTMLVideoElement;
        internal: boolean;
    }>;
    /**
     * @deprecated use setAudio
     */
    addAudio(name: any, path: any, volume: any, loop: any, autoplay: any): HTMLAudioElement;
    /**
     * Assigns an audio FrequencyData to a StorageMap
     * @param {string} name name of the Storage and prefix of the length variable e.g. `[name]Length`.
     * @param {string} path
     * @param {Number} volume
     * @param {boolean} loop
     * @param {boolean} autoplay
     * @returns {HTMLAudioElement}
     */
    setAudio(name: string, path: string, volume: number, loop: boolean, autoplay: boolean): HTMLAudioElement;
    setTextureStorage2d(name: any, shaderType: any): {
        name: any;
        shaderType: any;
        texture: any;
        internal: boolean;
    };
    /**
     * @deprecated use setBindingTexture
     */
    addBindingTexture(computeName: any, fragmentName: any, size: any): void;
    /**
     * Sets a texture to the compute and fragment shader, in the compute you can
     * write to the texture, and in the fragment you can read the texture, so is
     * a one way communication method.
     * @param {string} computeName name of the variable in the compute shader
     * @param {string} fragmentName name of the variable in the fragment shader
     * @param {Array<number, 2>} size dimensions of the texture, by default screen
     * size
     * @returns {Object}
     */
    setBindingTexture(computeName: string, fragmentName: string, size: Array<number, 2>): any;
    /**
     * Listen for an event dispatched from WGSL code
     * @param {String} name Number that represents an event Id
     * @param {Function} callback function to be called when the event occurs
     */
    addEventListener(name: string, callback: Function, structSize: any): void;
    /**
     * for internal use:
     * to flag add* methods and variables as part of the RenderPasses
     * @private
     */
    private _setInternal;
    /**
     * Establishes the density of the base mesh, by default 1x1, meaning two triangles.
     * The final number of triangles is `numColumns` * `numRows` * `2` ( 2 being the triangles )
     * @param {Number} numColumns quads horizontally
     * @param {Number} numRows quads vertically
     */
    setMeshDensity(numColumns: number, numRows: number): void;
    /**
     * One time function to call to initialize the shaders.
     * @param {Array<RenderPass>} renderPasses Collection of RenderPass, which contain Vertex, Compute and Fragment shaders.
     * @returns {Boolean} false | undefined
     */
    init(renderPasses: Array<RenderPass>): boolean;
    /**
     * Mainly to be used with RenderPasses.js
     * @param {RenderPass} renderPass
     */
    addRenderPass(renderPass: RenderPass): void;
    get renderPasses(): any;
    /**
     * Adds two triangles called points per number of columns and rows
     */
    createScreen(): Promise<void>;
    update(): Promise<void>;
    read(): Promise<void>;
    /**
     * Adds two triangles as a quad called Point
     * @param {Coordinate} coordinate `x` from 0 to canvas.width, `y` from 0 to canvas.height, `z` it goes from 0.0 to 1.0 and forward
     * @param {Number} width point width
     * @param {Number} height point height
     * @param {Array<RGBAColor>} colors one color per corner
     * @param {Boolean} useTexture
     */
    addPoint(coordinate: Coordinate, width: number, height: number, colors: Array<RGBAColor>, useTexture?: boolean): void;
    get canvas(): any;
    get device(): any;
    get context(): any;
    get presentationFormat(): any;
    get buffer(): any;
    set fullscreen(value: boolean);
    get fullscreen(): boolean;
    #private;
}
declare class Coordinate {
    constructor(x?: number, y?: number, z?: number);
    set x(value: number);
    get x(): number;
    set y(value: number);
    get y(): number;
    set z(value: number);
    get z(): number;
    get value(): number[];
    set(x: any, y: any, z: any): void;
    #private;
}
declare class RGBAColor {
    static average(colors: any): RGBAColor;
    static difference(c1: any, c2: any): RGBAColor;
    static colorRGBEuclideanDistance(c1: any, c2: any): number;
    static getClosestColorInPalette(color: any, palette: any): any;
    constructor(r?: number, g?: number, b?: number, a?: number);
    set r(value: number);
    get r(): number;
    set g(value: number);
    get g(): number;
    set b(value: number);
    get b(): number;
    set a(value: number);
    get a(): number;
    get value(): number[];
    set brightness(value: number);
    get brightness(): number;
    set(r: any, g: any, b: any, a: any): void;
    setColor(color: any): void;
    add(color: any): void;
    blend(color: any): void;
    additive(color: any): void;
    equal(color: any): boolean;
    isNull(): boolean;
    /**
     * Checks how close two colors are. Closest is `0`.
     * @param {RGBAColor} color : Color to check distance;
     * @returns Number distace up to `1.42` I think...
     */
    euclideanDistance(color: RGBAColor): number;
    #private;
}
export { Points as default };
