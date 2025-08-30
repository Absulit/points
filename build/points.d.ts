/**
 * A numeric value that may be negative or positive.
 */
export type SignedNumber = number;
/**
 * A RenderPass is a way to have a block of shaders to pass to your application pipeline and
 * these render passes will be executed in the order you pass them in the {@link Points#init} method.
 *
 * @example
 * import Points, { RenderPass } from 'points';
 * // vert, frag and compute are strings with the wgsl shaders.
 * let renderPasses = [
 *     new RenderPass(vert1, frag1, compute1),
 *     new RenderPass(vert2, frag2, compute2)
 * ];

 * // we pass the array of renderPasses
 * await points.init(renderPasses);
 *
 * @example
 * // init param example
 * const waves = new RenderPass(vertexShader, fragmentShader, null, 8, 8, 1, (points, params) => {
 *     points.setSampler('renderpass_feedbackSampler', null);
 *     points.setTexture2d('renderpass_feedbackTexture', true);
 *     points.setUniform('waves_scale', params.scale || .45);
 *     points.setUniform('waves_intensity', params.intensity || .03);
 * });
 * waves.required = ['scale', 'intensity'];
 */
export class RenderPass {
    /**
     * A collection of Vertex, Compute and Fragment shaders that represent a RenderPass.
     * This is useful for PostProcessing.
     * @param {String} vertexShader  WGSL Vertex Shader in a String.
     * @param {String} fragmentShader  WGSL Fragment Shader in a String.
     * @param {String} computeShader  WGSL Compute Shader in a String.
     * @param {String} workgroupCountX  Workgroup amount in X.
     * @param {String} workgroupCountY  Workgroup amount in Y.
     * @param {String} workgroupCountZ  Workgroup amount in Z.
     * @param {function(points:Points, params:Object):void} init Method to add custom
     * uniforms or storage (points.set* methods).
     * This is made for post processing multiple `RenderPass`.
     * The method `init` will be called to initialize the buffer parameters.
     *
     */
    constructor(vertexShader: string, fragmentShader: string, computeShader: string, workgroupCountX: string, workgroupCountY: string, workgroupCountZ: string, init: any);
    set index(value: any);
    /**
     * Get the current RenderPass index order in the pipeline.
     * When you add a RenderPass to the constructor or via
     * {@link Points#addRenderPass}, this is the order it receives.
     */
    get index(): any;
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
    set bindGroupLayout(value: any);
    get bindGroupLayout(): any;
    set bindGroupLayoutCompute(value: any);
    get bindGroupLayoutCompute(): any;
    set entries(value: any);
    get entries(): any;
    get compiledShaders(): {
        vertex: string;
        compute: string;
        fragment: string;
    };
    get hasComputeShader(): boolean;
    get hasVertexShader(): boolean;
    get hasFragmentShader(): boolean;
    get hasVertexAndFragmentShader(): boolean;
    /**
     * How many workgroups are in the X dimension.
     */
    get workgroupCountX(): string | number;
    /**
     * How many workgroups are in the Y dimension.
     */
    get workgroupCountY(): string | number;
    /**
     * How many workgroups are in the Z dimension.
     */
    get workgroupCountZ(): string | number;
    /**
     * Function where the `init` parameter (set in the constructor) is executed
     * and this call will pass the parameters that the RenderPass
     * requires to run.
     * @param {Points} points instance of {@link Points} to call set* functions
     * like {@link Points#setUniform}  and others.
     * @param {Object} params data that can be assigned to the RenderPass when
     * the {@link Points#addRenderPass} method is called.
     */
    init(points: Points, params: any): void;
    /**
     * List of buffer names that are required for this RenderPass so if it shows
     * them in the console.
     * @param {Array<String>} val names of the parameters `params` in
     * {@link RenderPass#setInit} that are required.
     * This is only  used for a post processing RenderPass.
     */
    set required(val: Array<string>);
    get required(): Array<string>;
    #private;
}
/**
 * List of predefined Render Passes for Post Processing.
 * Parameters required are shown as a warning in the JS console.
 * @class
 *
 * @example
 * import Points, { RenderPass, RenderPasses } from 'points';
 * const points = new Points('canvas');
 *
 * // option 1: along with the RenderPasses pased into `Points.init()`
 * let renderPasses = [
 *     new RenderPass(vert1, frag1, compute1),
 *     new RenderPass(vert2, frag2, compute2)
 * ];
 *
 * // option 2: calling `points.addRenderPass()` method
 * points.addRenderPass(RenderPasses.GRAYSCALE);
 * points.addRenderPass(RenderPasses.CHROMATIC_ABERRATION, { distance: .02 });
 * points.addRenderPass(RenderPasses.COLOR, { color: [.5, 1, 0, 1], blendAmount: .5 });
 * points.addRenderPass(RenderPasses.PIXELATE);
 * points.addRenderPass(RenderPasses.LENS_DISTORTION);
 * points.addRenderPass(RenderPasses.FILM_GRAIN);
 * points.addRenderPass(RenderPasses.BLOOM);
 * points.addRenderPass(RenderPasses.BLUR, { resolution: [100, 100], direction: [.4, 0], radians: 0 });
 * points.addRenderPass(RenderPasses.WAVES, { scale: .05 });
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
    /**
     * Apply a color {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.COLOR, { color: [.5, 1, 0, 1], blendAmount: .5 });
     */
    static COLOR: RenderPass;
    /**
     * Apply a grayscale {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.GRAYSCALE);
     */
    static GRAYSCALE: RenderPass;
    /**
     * Apply a chromatic aberration {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.CHROMATIC_ABERRATION, { distance: .02 });
     */
    static CHROMATIC_ABERRATION: RenderPass;
    /**
     * Apply a pixelation {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.PIXELATE);
     */
    static PIXELATE: RenderPass;
    /**
     * Apply a lens distortion {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.LENS_DISTORTION);
     */
    static LENS_DISTORTION: RenderPass;
    /**
     * Apply a film grain {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.FILM_GRAIN);
     */
    static FILM_GRAIN: RenderPass;
    /**
     * Apply a bloom {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.BLOOM);
     */
    static BLOOM: RenderPass;
    /**
     * Apply a blur {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.BLUR, { resolution: [100, 100], direction: [.4, 0], radians: 0 });
     */
    static BLUR: RenderPass;
    /**
     * Apply a waives noise {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.WAVES, { scale: .05 });
     */
    static WAVES: RenderPass;
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
declare class Points {
    constructor(canvasId: any);
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
    set fitWindow(value: any);
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
     *     size : vec2f,
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
     * @param {String} shaderType To what {@link ShaderType} you want to exclusively use this variable.
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
    setTexture2d(name: string, copyCurrentTexture: boolean, shaderType: string, renderPassIndex: number): any;
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
     * @param {String} shaderType To what {@link ShaderType} you want to exclusively use this variable.
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
    };
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
    setBindingTexture(writeName: string, readName: string, writeIndex: number, readIndex: number, size: Array<number, 2>): any;
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
     * Injects a render pass after all the render passes added by the user.
     * @param {RenderPass} renderPass
     * @param {Object} params
     */
    addRenderPass(renderPass: RenderPass, params: any): void;
    /**
     * Get the active list of {@link RenderPass}
     */
    get renderPasses(): any;
    /**
     * Adds two triangles called points per number of columns and rows
     * @ignore
     */
    createScreen(): void;
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
    /**
     * Reference to the canvas assigned in the constructor
     * @type {HTMLCanvasElement}
     */
    get canvas(): HTMLCanvasElement;
    get device(): any;
    get context(): any;
    get presentationFormat(): any;
    get buffer(): any;
    /**
     * Triggers the app to run in full screen mode
     * @type {Boolean}
     *
     * @example
     * points.fullscreen = true
     */
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
