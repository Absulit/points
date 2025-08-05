/**
 * A numeric value that may be negative or positive.
 */
export type SignedNumber = number;
/**
 * A RenderPass is a way to have a block of shaders to pass to your application pipeline and
 * these render passes will be executed in the order you pass them in the {@link Points#init} method.
 *
 * @example
 * // vert, frag and compute are strings with the wgsl shaders.
 * let renderPasses = [
 *     new RenderPass(vert1, frag1, compute1),
 *     new RenderPass(vert2, frag2, compute2)
 * ];

 * // we pass the array of renderPasses
 * await points.init(renderPasses);
 */
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
    /**
     * To use with {link RenderPasses} so it's internal
     * @ignore
     */
    get internal(): boolean;
    /**
     * get the vertex shader content
     */
    get vertexShader(): string;
    /**
     * get the compute shader content
     */
    get computeShader(): string;
    /**
     * get the fragment shader content
     */
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
 *
 * @example
 * import Points from 'points';
 * const points = new Points('canvas');
 *
 * let renderPasses = [
 *     new RenderPass(vert1, frag1, compute1),
 *     new RenderPass(vert2, frag2, compute2)
 * ];
 *
 * RenderPasses.grayscale(points);
 * RenderPasses.chromaticAberration(points, .02);
 * RenderPasses.color(points, .5, 1, 0, 1, .5);
 * RenderPasses.pixelate(points, 10, 10);
 * RenderPasses.lensDistortion(points, .4, .01);
 * RenderPasses.filmgrain(points);
 * RenderPasses.bloom(points, .5);
 * RenderPasses.blur(points, 100, 100, .4, 0, 0.0);
 * RenderPasses.waves(points, .05, .03);
 *
 * await points.init(renderPasses);
 *
 * update();
 *
 * function update() {
 *     points.update();
 *     requestAnimationFrame(update);
 * }
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
    static "__#4@#LIST": {
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
     * Adds a `RenderPass` from the `RenderPasses` list
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
/**
 * In different calls to the main {@link Points} class, it is used to
 * tell the library in what stage of the shaders the data to be sent.
 * @class ShaderType
 *
 * @example
 * // Send storage data to the Fragment Shaders only
 * points.setStorage('variables', 'Variables', false, ShaderType.FRAGMENT);
 * points.setStorage('objects', `array<Object, ${numObjects}>`, false, ShaderType.FRAGMENT);
 *
 * @example
 * // Send storage data to the Compute Shaders only
 * points.setStorage('variables', 'Variable', false, ShaderType.COMPUTE);
 *
 *
 */
export class ShaderType {
    /**
     * Vertex Shader
     */
    static VERTEX: number;
    /**
     * Compute Shader
     */
    static COMPUTE: number;
    /**
     * Fragment Shader
     */
    static FRAGMENT: number;
}
/**
 * Main class Points
 * @class Points
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
 * @category Main
 *
 */
declare class Points {
    constructor(canvasId: any);
    set fitWindow(value: boolean);
    get fitWindow(): boolean;
    /**
     * Sets a `param` (predefined struct already in all shader)
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
     * let finalColor:vec4f = mix(color0, color1, params.scale);
     */
    setUniform(name: string, value: number | boolean | Array<number>, structName?: string): any;
    /**
     * Updates a list of uniforms
     * @param {Array<{name:String, value:Number}>} arr object array of the type: `{name, value}`
     */
    updateUniforms(arr: Array<{
        name: string;
        value: number;
    }>): void;
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
    setStorage(name: string, structName: string, read: boolean, shaderType: ShaderType, arrayData: any): any;
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
     *     size : vec2<f32>,
     *     numbers: array<f32>,
     * }
     *
     * resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);
     */
    setStorageMap(name: string, arrayData: Uint8Array<ArrayBuffer>, structName: string, read?: boolean, shaderType?: ShaderType): any;
    readStorage(name: any): Promise<Float32Array<any>>;
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
    setLayers(numLayers: number, shaderType: ShaderType): void;
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
    setSampler(name: string, descriptor: GPUSamplerDescriptor, shaderType: any): any;
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
     *     vec2<f32>(f32(GlobalId.x), f32(GlobalId.y)),
     *     0.0
     * );
     *
     */
    setTexture2d(name: string, copyCurrentTexture: boolean, shaderType: any, renderPassIndex: any): any;
    copyTexture(nameTextureA: any, nameTextureB: any): void;
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
    setTextureImage(name: string, path: string, shaderType?: ShaderType): any;
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
    setTextureString(name: string, text: string, path: string, size: {
        x: number;
        y: number;
    }, offset?: number, shaderType?: string): any;
    /**
     * Load images as texture_2d_array
     * @param {string} name id of the wgsl variable in the shader
     * @param {Array} paths image addresses in a web server
     * @param {ShaderType} shaderType
     */
    setTextureImageArray(name: string, paths: any[], shaderType: ShaderType): Promise<void>;
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
    setTextureVideo(name: string, path: string, shaderType: ShaderType): any;
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
    setTextureWebcam(name: string, shaderType: ShaderType): any;
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
    setAudio(name: string, path: string, volume: number, loop: boolean, autoplay: boolean): HTMLAudioElement;
    setTextureStorage2d(name: any, shaderType: any): {
        name: any;
        shaderType: any;
        texture: any;
        internal: boolean;
    };
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
    setBindingTexture(computeName: string, fragmentName: string, size: Array<number, 2>): any;
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
    addEventListener(name: string, callback: Function, structSize: number): void;
    /**
     * for internal use:
     * to flag add* methods and variables as part of the RenderPasses
     * @private
     * @ignore
     */
    private _setInternal;
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
    setMeshDensity(numColumns: number, numRows: number): void;
    /**
     * One time function call to initialize the shaders.
     * @param {Array<RenderPass>} renderPasses Collection of {@link RenderPass}, which contain Vertex, Compute and Fragment shaders.
     * @returns {Boolean} false | undefined
     *
     * @example
     * await points.init(renderPasses)
     */
    init(renderPasses: Array<RenderPass>): boolean;
    /**
     * Mainly to be used with {@link RenderPasses}<br>
     * Injects a render pass after all the render passes added by the user.
     * @param {RenderPass} renderPass
     * @ignore
     */
    addRenderPass(renderPass: RenderPass): void;
    get renderPasses(): any;
    /**
     * Adds two triangles called points per number of columns and rows
     * @ignore
     */
    createScreen(): Promise<void>;
    update(): Promise<void>;
    read(): Promise<void>;
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
/**
 * @class RGBAColor
 * @ignore
 */
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
