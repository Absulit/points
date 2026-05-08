/**
 * A numeric value that may be negative or positive.
 */
export type SignedNumber = number;
/**
 * Constant is a container for const declarations.
 * They work in two ways with the `override` attribute.
 *
 * @class Constant
 */
export class Constant {
    /**
     * @param {{name:String, value:(Number|Array<Number>), type:String, override:Boolean}} config
     */
    constructor({ name, value, type, override }: {
        name: string;
        value: (number | Array<number>);
        type: string;
        override: boolean;
    });
    /**
     * The name that the Constant will have on the WGSL side.
     * @param {String} value name of the Constant. The name is used in the WGSL
     * shader.
     * @example
     * // js
     * myConstant.name = 'MYCONST';
     *
     * // wgsl
     * let newVal = MYCONST + 3;
     * @memberof Constant
     */
    set name(value: string);
    get name(): string;
    /**
     * Get or set the value that the constant will have on the WGSL side.
     * @warning It can only be assigned once.
     * @param {Number|Array<Number>} value
     * @memberof Constant
     */
    set value(value: number | Array<number>);
    get value(): number | Array<number>;
    /**
     * Get or set the type of the constant.
     * It can be inferred automatically by just passing the value, but if
     * something more specific is required, then you should use `type`.
     * @param {String} value WGSL data type of the constant
     * @example
     * myConstant.type = 'u32';
     * @memberof Constant
     */
    set type(value: string);
    get type(): string;
    /**
     * A constant override is a constant you can change per shader.
     * By default, POINTS interpolates constant declarations inside the WGSL
     * string shader like this:
     * ```wgsl
     * const MYCONST:u32 = 10;
     * ```
     * These declarations are added by default to all shaders in the pipeline
     * and in all render passes. These can not be changed.
     *
     * With overrides you can have the same constant in different shaders with
     * different values. The default value is passed to each pipeline and then
     * it can be overwritten in a specific shader by hand.
     * @example
     * ```js
     * // js side
     * constants.PI.setOverride(true).setValue(3.14);
     * ```
     * ```wgsl
     * // wgsl side
     * override MYCONST:u32 = 3.1415;
     * ```
     * @memberof Constant
     */
    set override(value: boolean);
    get override(): boolean;
    /**
     * Tells WebGPU to which shader it can only be used.
     * @param {GPUShaderStage}
     * @memberof Constant
     */
    set shaderStage(value: number);
    get shaderStage(): number;
    /**
     * Sets the value of a Constant
     * @param {Number|Array<Number>} value
     * @returns {Constant}
     * @memberof Constant
     */
    setValue(value: number | Array<number>): Constant;
    /**
     * Set the data type of the Constant.
     * @param {String} value WGSL data type of the constant
     * @example
     * myUniform.setType('u32')
     * @memberof Constant
     */
    setType(value: string): this;
    /**
     * A constant override is a constant you can change per shader.
     * By default, POINTS interpolates constant declarations inside the WGSL
     * string shader like this:
     * ```wgsl
     * const MYCONST:u32 = 10;
     * ```
     * These declarations are added by default to all shaders in the pipeline
     * and in all render passes. These can not be changed.
     *
     * With overrides you can have the same constant in different shaders with
     * different values. The default value is passed to each pipeline and then
     * it can be overwritten in a specific shader by hand.
     * @example
     * ```js
     * // js side
     * constants.PI.setOverride(true).setValue(3.14);
     * ```
     * ```wgsl
     * // wgsl side
     * override MYCONST:u32 = 3.1415;
     * ```
     * @memberof Constant
     */
    setOverride(value: any): this;
    /**
     * Tells WebGPU to which shader it can only be used.
     * @param {GPUShaderStage} value
     * @returns {Constant}
     * @memberof Constant
     */
    setShaderStage(value: GPUShaderStage): Constant;
    #private;
}
/**
 * To tell the {@link RenderPass} what polygons should be discarded
 * Default `BACK`
 * @example
 *
 * renderPass.cullMode = CullMode.BACK;
 */
export class CullMode {
    /** @type {GPUCullMode} */
    static NONE: GPUCullMode;
    /** @type {GPUCullMode} */
    static FRONT: GPUCullMode;
    /** @type {GPUCullMode} */
    static BACK: GPUCullMode;
}
/**
 * To tell the {@link RenderPass} what polygons are Front Facing
 * Default `CCW`
 * @example
 *
 * renderPass.frontFace = FrontFace.CCW;
 */
export class FrontFace {
    /** @type {GPUFrontFace} */
    static CCW: GPUFrontFace;
    /** @type {GPUFrontFace} */
    static CW: GPUFrontFace;
}
/**
 * To tell the {@link RenderPass} how the data from the previous RenderPass
 * is preserved on screen or cleared.
 * Default `CLEAR`
 * @example
 *
 * renderPass.loadOp = LoadOp.LOAD;
 */
export class LoadOp {
    /** @type {GPULoadOp} */
    static CLEAR: GPULoadOp;
    /** @type {GPULoadOp} */
    static LOAD: GPULoadOp;
}
/**
 * Class to be used to decide if the output textures can hold more data beyond
 * the range from 0..1. Useful for HDR images.
 *
 * @example
 * points.presentationFormat = PresentationFormat.RGBA16FLOAT;
 *
 * @class PresentationFormat
 */
export class PresentationFormat {
    /**
     * @memberof PresentationFormat
     */
    static BGRA8UNORM: string;
    /**
     * @memberof PresentationFormat
     */
    static RGBA8UNORM: string;
    /**
     * @memberof PresentationFormat
     */
    static RGBA16FLOAT: string;
    /**
     * @memberof PresentationFormat
     */
    static RGBA32FLOAT: string;
}
/**
 * To tell the {@link RenderPass} how to display the triangles.
 * Default `TRIANGLE_LIST`
 * @example
 *
 * renderPass.topology = PrimitiveTopology.POINT_LIST;
 */
export class PrimitiveTopology {
    /** @type {GPUPrimitiveTopology} */
    static POINT_LIST: GPUPrimitiveTopology;
    /** @type {GPUPrimitiveTopology} */
    static LINE_LIST: GPUPrimitiveTopology;
    /** @type {GPUPrimitiveTopology} */
    static LINE_STRIP: GPUPrimitiveTopology;
    /** @type {GPUPrimitiveTopology} */
    static TRIANGLE_LIST: GPUPrimitiveTopology;
    /** @type {GPUPrimitiveTopology} */
    static TRIANGLE_STRIP: GPUPrimitiveTopology;
}
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
    set computeBindGroup(value: GPUBindGroup);
    get computeBindGroup(): GPUBindGroup;
    set fragmentBindGroup(value: GPUBindGroup);
    get fragmentBindGroup(): GPUBindGroup;
    set vertexBindGroup(value: GPUBindGroup);
    get vertexBindGroup(): GPUBindGroup;
    set bindGroupLayoutFragment(value: GPUBindGroupLayout);
    get bindGroupLayoutFragment(): GPUBindGroupLayout;
    set bindGroupLayoutVertex(value: GPUBindGroupLayout);
    get bindGroupLayoutVertex(): GPUBindGroupLayout;
    set bindGroupLayoutCompute(value: GPUBindGroupLayout);
    get bindGroupLayoutCompute(): GPUBindGroupLayout;
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
     * @param {Number} val
     */
    set workgroupCountX(val: number);
    /**
     * How many workgroups are in the X dimension.
     */
    get workgroupCountX(): number;
    /**
     * @param {Number} val
     */
    set workgroupCountY(val: number);
    /**
     * How many workgroups are in the Y dimension.
     */
    get workgroupCountY(): number;
    /**
     * @param {Number} val
     */
    set workgroupCountZ(val: number);
    /**
     * How many workgroups are in the Z dimension.
     */
    get workgroupCountZ(): number;
    /**
     * Function where the `init` parameter (set in the constructor) is executed
     * and this call will pass the parameters that the RenderPass
     * requires to run.
     * @param {Points} points instance of {@link Points} to call set* functions
     * like {@link Points#setUniform}  and others.
     */
    init(points: Points): void;
    /**
     * List of buffer names that are required for this RenderPass so if it shows
     * them in the console.
     * @param {Array<String>} val names of the parameters `params` in
     * {@link RenderPass#setInit} that are required.
     * This is only  used for a post processing RenderPass.
     */
    set required(val: Array<string>);
    get required(): Array<string>;
    /**
     * Number of instances that will be created of the current mesh (Vertex Buffer)
     * in this RenderPass. This means if you have a quad, it will create
     * `instanceCount` number of independent quads on the screen.
     * Useful for instanced particles driven by a Storage buffer.
     */
    get instanceCount(): number;
    set name(val: any);
    get name(): any;
    get internal(): boolean;
    /**
     * @param {Object} val data that can be assigned to the RenderPass when
     * the {@link Points#addRenderPass} method is called.
     */
    set params(val: any);
    /**
     * Parameters specifically for Post RenderPass
     */
    get params(): any;
    set vertexArray(val: Float32Array<ArrayBuffer>);
    get vertexArray(): Float32Array<ArrayBuffer>;
    set vertexBufferInfo(val: any);
    get vertexBufferInfo(): any;
    set vertexBuffer(val: any);
    get vertexBuffer(): any;
    /**
     * Controls whether your fragment shader can write to the depth buffer.
     * By default `true`.
     * To allow transparency and a custom type of sort, set this as false;
     * @param {Boolean} val
     */
    set depthWriteEnabled(val: boolean);
    get depthWriteEnabled(): boolean;
    /**
     * Holder for the depth map for this RenderPass only
     * @param {GPUTexture} val
     */
    set textureDepth(val: GPUTexture);
    get textureDepth(): GPUTexture;
    /**
     * Controls if the last RenderPass data is preserved on screen or cleared.
     * Default {@link LoadOp#CLEAR}
     * @param {LoadOp | GPULoadOp} val
     */
    set loadOp(val: LoadOp | GPULoadOp);
    get loadOp(): LoadOp | GPULoadOp;
    /**
     * Sets the color used to clear the RenderPass before drawing.
     * (only if {@link RenderPass#loadOp | loadOp} is set to `clear`)
     * default: black
     * @param {{ r: Number, g: Number, b: Number, a: Number }} val
     */
    set clearValue(val: {
        r: number;
        g: number;
        b: number;
        a: number;
    });
    get clearValue(): {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    /**
     * @type {GPURenderPassDescriptor}
     */
    get descriptor(): GPURenderPassDescriptor;
    /**
     * To render as Triangles, lines or points.
     * Use class {@link PrimitiveTopology}
     * @param {GPUPrimitiveTopology} val
     */
    set topology(val: GPUPrimitiveTopology);
    get topology(): GPUPrimitiveTopology;
    /**
     * Triangles to discard.
     * Default `BACK`.
     * Use class {@link CullMode}
     * @param {CullMode | GPUCullMode} val
     */
    set cullMode(val: CullMode | GPUCullMode);
    get cullMode(): CullMode | GPUCullMode;
    /**
     * Direction of the triangles.
     * Counter Clockwise (CCW) or Clockwise (CW)
     * Default `CCW`.
     * Use class {@link frontFace}
     * @param {FrontFace | GPUFrontFace} val
     */
    set frontFace(val: FrontFace | GPUFrontFace);
    get frontFace(): FrontFace | GPUFrontFace;
    /**
     * Render Bundle for performance
     * @param {GPURenderBundle} val
     */
    set bundle(val: GPURenderBundle);
    get bundle(): GPURenderBundle;
    /**
     * Device reference to check if RenderBundle needs to be rebuilt
     * @param {GPUDevice} val
     */
    set device(val: GPUDevice);
    get device(): GPUDevice;
    /**
     * Disable the current RenderPass during runtime if the pass has
     * no other passes dependencies like sharing a texture.
     *
     * @param {Boolean} val
     *
     * @example
     * const renderPass = new RenderPass()
     *
     * renderPass.enabled = false;
     */
    set enabled(val: boolean);
    get enabled(): boolean;
    /**
     * To notify the RenderPass if a mesh has changed to update the vertexBuffer
     * @param {Boolean} val
     */
    set meshUpdated(val: boolean);
    get meshUpdated(): boolean;
    /**
     * - **currently for internal use**<br>
     * - **might be private in the future**<br>
     * Adds two triangles as a quad called Point
     * @param {Coordinate} coordinate `x` from 0 to canvas.width, `y` from 0 to canvas.height, `z` it goes from 0.0 to 1.0 and forward
     * @param {Number} width point width
     * @param {Number} height point height
     * @param {Array<RGBAColor>} colors one color per corner
     * @param {HTMLCanvasElement} canvas canvas element
     * @param {Boolean} useTexture
     * @ignore
     */
    addPoint(coordinate: Coordinate, width: number, height: number, colors: Array<RGBAColor>, canvas: HTMLCanvasElement, useTexture?: boolean): {
        name: string;
        id: number;
        instanceCount: number;
        verticesCount: number;
    };
    /**
     * Adds a mesh quad
     * @deprecated Since v0.8.0 use {@link setPlane}
     * @param {String} name The name will show up in the `mesh` Uniform.
     * @param {{x:Number, y:Number, z:Number}} coordinate
     * @param {{width:Number, height:Number}} dimensions
     * @param {{r:Number, g:Number, b:Number, a:Number}} color
     * @param {{x:Number, y:Number }} segments mesh subdivisions
     *
     * @example
     *
     * renderPass.addPlane('plane', { x: 0, y: 0, z: 0 }, { width: 2, height: 2 }).instanceCount = NUMPARTICLES;
     */
    addPlane(name: string, coordinate?: {
        x: number;
        y: number;
        z: number;
    }, dimensions?: {
        width: number;
        height: number;
    }, color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    }, segments?: {
        x: number;
        y: number;
    }): {
        name: string;
        id: number;
        instanceCount: number;
        verticesCount: number;
    };
    /**
     * Adds or replaces a mesh quad
     * @param {String} name The name will show up in the `mesh` Uniform.
     * @param {{x:Number, y:Number, z:Number}} coordinate
     * @param {{width:Number, height:Number}} dimensions
     * @param {{r:Number, g:Number, b:Number, a:Number}} color
     * @param {{x:Number, y:Number }} segments mesh subdivisions
     *
     * @example
     *
     * renderPass.setPlane('plane', { x: 0, y: 0, z: 0 }, { width: 2, height: 2 }).instanceCount = NUMPARTICLES;
     */
    setPlane(name: string, coordinate?: {
        x: number;
        y: number;
        z: number;
    }, dimensions?: {
        width: number;
        height: number;
    }, color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    }, segments?: {
        x: number;
        y: number;
    }): any;
    /**
     * Adds a mesh cube
     * @deprecated since v0.8.0. Use {@link setCube}
     * @param {String} name The name will show up in the `mesh` Uniform.
     * @param {{x:Number, y:Number, z:Number}} coordinate
     * @param {{width:Number, height:Number, depth:Number}} dimensions
     * @param {{r:Number, g:Number, b:Number, a:Number}} color
     *
     * @example
     *
     * renderPass.addCube('base_cube').instanceCount = NUMPARTICLES;
     */
    addCube(name: string, coordinate?: {
        x: number;
        y: number;
        z: number;
    }, dimensions?: {
        width: number;
        height: number;
        depth: number;
    }, color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    }): {
        name: string;
        id: number;
        instanceCount: number;
        verticesCount: number;
    };
    /**
     * Adds or replaces a mesh cube
     * @param {String} name The name will show up in the `mesh` Uniform.
     * @param {{x:Number, y:Number, z:Number}} coordinate
     * @param {{width:Number, height:Number, depth:Number}} dimensions
     * @param {{r:Number, g:Number, b:Number, a:Number}} color
     *
     * @example
     *
     * renderPass.setCube('base_cube').instanceCount = NUMPARTICLES;
     */
    setCube(name: string, coordinate?: {
        x: number;
        y: number;
        z: number;
    }, dimensions?: {
        width: number;
        height: number;
        depth: number;
    }, color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    }): any;
    /**
     * Adds a mesh sphere
     * @deprecated since v0.8.0. Use {@link setSphere}
     * @param {String} name The name will show up in the `mesh` Uniform.
     * @param {{x:Number, y:Number, z:Number}} coordinate
     * @param {{r:Number, g:Number, b:Number, a:Number}} color
     * @param {Number} radius
     * @param {Number} segments
     * @param {Number} rings
     *
     * @example
     *
     * renderPass.addSphere('sphere').instanceCount = 100;
     */
    addSphere(name: string, coordinate?: {
        x: number;
        y: number;
        z: number;
    }, color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    }, radius?: number, segments?: number, rings?: number): {
        name: string;
        id: number;
        instanceCount: number;
        verticesCount: number;
    };
    /**
     * Adds or replaces a mesh sphere
     * @param {String} name The name will show up in the `mesh` Uniform.
     * @param {{x:Number, y:Number, z:Number}} coordinate
     * @param {{r:Number, g:Number, b:Number, a:Number}} color
     * @param {Number} radius
     * @param {Number} segments
     * @param {Number} rings
     *
     * @example
     *
     * renderPass.setSphere('sphere').instanceCount = 100;
     */
    setSphere(name: string, coordinate?: {
        x: number;
        y: number;
        z: number;
    }, color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    }, radius?: number, segments?: number, rings?: number): any;
    /**
     * Adds a Torus mesh
     * @deprecated since v0.8.0. Use {@link setTorus}
     * @param {String} name The name will show up in the `mesh` Uniform.
     * @param {{x:Number, y:Number, z:Number}} coordinate
     * @param {Number} radius
     * @param {Number} tube
     * @param {Number} radialSegments
     * @param {Number} tubularSegments
     * @param {{r:Number, g:Number, b:Number, a:Number}} color
     * @returns {Object}
     *
     * @example
     *
     * renderPass.addTorus('myTorus');
     */
    addTorus(name: string, coordinate?: {
        x: number;
        y: number;
        z: number;
    }, radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number, color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    }): any;
    /**
     * Adds or replaces a Torus mesh
     * @param {String} name The name will show up in the `mesh` Uniform.
     * @param {{x:Number, y:Number, z:Number}} coordinate
     * @param {Number} radius
     * @param {Number} tube
     * @param {Number} radialSegments
     * @param {Number} tubularSegments
     * @param {{r:Number, g:Number, b:Number, a:Number}} color
     * @returns {Object}
     *
     * @example
     *
     * renderPass.setTorus('myTorus');
     */
    setTorus(name: string, coordinate?: {
        x: number;
        y: number;
        z: number;
    }, radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number, color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    }): any;
    /**
     * Adds a Cylinder mesh
     * @deprecated since v0.8.0. Use {@link setCylinder}
     * @param {String} name The name will show up in the `mesh` Uniform.
     * @param {{x:Number, y:Number, z:Number}} coordinate
     * @param {Number} radius
     * @param {Number} height
     * @param {Number} radialSegments
     * @param {Boolean} cap
     * @param {{r:Number, g:Number, b:Number, a:Number}} color
     * @returns {Object}
     *
     * @example
     * renderPass.addCylinder('myCylinder');
     */
    addCylinder(name: string, coordinate?: {
        x: number;
        y: number;
        z: number;
    }, radius?: number, height?: number, radialSegments?: number, cap?: boolean, color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    }): any;
    /**
     * Adds or replaces a Cylinder mesh
     * @param {String} name The name will show up in the `mesh` Uniform.
     * @param {{x:Number, y:Number, z:Number}} coordinate
     * @param {Number} radius
     * @param {Number} height
     * @param {Number} radialSegments
     * @param {Boolean} cap
     * @param {{r:Number, g:Number, b:Number, a:Number}} color
     * @returns {Object}
     *
     * @example
     * renderPass.setCylinder('myCylinder');
     */
    setCylinder(name: string, coordinate?: {
        x: number;
        y: number;
        z: number;
    }, radius?: number, height?: number, radialSegments?: number, cap?: boolean, color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    }): any;
    /**
     * Add a external mesh with the provided required data.
     * @deprecated since v0.8.0. Use {@link setMesh}
     * @param {String} name The name will show up in the `mesh` Uniform.
     * @param {Array<{x:Number, y:Number, z:Number}>} vertices
     * @param {Array<{r:Number, g:Number, b:Number, a:Number}>} colors
     * @param {Array<{u:Number, v:Number}>} uvs
     * @param {Array<Number>} normals
     *
     * @example
     *
     * const url = '../models/monkey.glb';
     * const data = await loadAndExtract(url);
     * const { positions, colors, uvs, normals, indices, colorSize, texture } = data[0]
     * renderPass.addMesh('monkey', positions, colors, colorSize, uvs, normals, indices)
     * renderPass.depthWriteEnabled = true;
     *
     */
    addMesh(name: string, vertices: Array<{
        x: number;
        y: number;
        z: number;
    }>, colors: Array<{
        r: number;
        g: number;
        b: number;
        a: number;
    }>, colorSize: any, uvs: Array<{
        u: number;
        v: number;
    }>, normals: Array<number>, indices: any): {
        name: string;
        id: number;
        instanceCount: number;
        verticesCount: any;
    };
    /**
     * Add or replace external mesh with the provided required data.
     * @param {String} name The name will show up in the `mesh` Uniform.
     * @param {Array<{x:Number, y:Number, z:Number}>} vertices
     * @param {Array<{r:Number, g:Number, b:Number, a:Number}>} colors
     * @param {Array<{u:Number, v:Number}>} uvs
     * @param {Array<Number>} normals
     *
     * @example
     *
     * const url = '../models/monkey.glb';
     * const data = await loadAndExtract(url);
     * const { positions, colors, uvs, normals, indices, colorSize, texture } = data[0]
     * renderPass.setMesh('monkey', positions, colors, colorSize, uvs, normals, indices)
     * renderPass.depthWriteEnabled = true;
     *
     */
    setMesh(name: string, vertices: Array<{
        x: number;
        y: number;
        z: number;
    }>, colors: Array<{
        r: number;
        g: number;
        b: number;
        a: number;
    }>, colorSize: any, uvs: Array<{
        u: number;
        v: number;
    }>, normals: Array<number>, indices: any): any;
    /**
     * For internal purposes
     * ids and names of the meshes
     */
    get meshes(): any[];
    destroy(): void;
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
 * points.update(update);
 *
 * function update() {
 * // update uniforms and other animation variables
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
    /**
     * Apply a CRT tv pixels effect {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.CRT, { scale: .05 });
     */
    static CRT: RenderPass;
}
/**
 * Class to be used to select how the content should be displayed on different
 * screen sizes.
 * ```text
 * FIT: Preserves both, but might show black bars or extend empty content. All content is visible.
 * COVER: Preserves both, but might crop width or height. All screen is covered.
 * WIDTH: Preserves the visibility of the width, but might crop the height.
 * HEIGHT: Preserves the visibility of the height, but might crop the width.
 * ```
 * @example
 *
 * points.scaleMode = ScaleMode.COVER;
 *
 * @class ScaleMode
 */
export class ScaleMode {
    /**
     * ```text
     * All content is visible.
     * Black bars shown to compensate.
     * No content is cropped.
     *
     * PORTRAIT        LANDSCAPE
     * ░░░░░░░░░░░░░░░ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ░░░░░░░░░░░░░░░ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ░░░░░░░░░░░░░░░
     * ░░░░░░░░░░░░░░░
     * ```
     * @memberof ScaleMode
     */
    static FIT: number;
    /**
     * ```text
     * Not all content is visible.
     * No black bars shown.
     * Content is cropped on the sides.
     * `
     * PORTRAIT            LANDSCAPE
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ```
     * @memberof ScaleMode
     */
    static COVER: number;
    /**
     * ```text
     * Content is visible in portrait.
     * Black bars shown to compensate in portrait.
     * Content is cropped in landscape.
     *
     * PORTRAIT        LANDSCAPE
     * ░░░░░░░░░░░░░░░ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ░░░░░░░░░░░░░░░ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ░░░░░░░░░░░░░░░ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ░░░░░░░░░░░░░░░ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ```
     * @memberof ScaleMode
     */
    static WIDTH: number;
    /**
     * ```text
     * Not all content is visible.
     * Black bars shown to compensate in landscape.
     * Content is cropped in portrait.
     *
     * PORTRAIT            LANDSCAPE
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
     * ```
     * @memberof ScaleMode
     */
    static HEIGHT: number;
}
/**
 * Storage is a container for storage buffer related data and actions.
 * @class Storage
 */
export class Storage {
    /**
     * @param {{name:String, value:(Number|Array<Number>), type:String, readable:Boolean, shaderStage:GPUShaderStage, stream:bool, updated:bool, size:Number}} config
     */
    constructor({ name, value, type, readable, shaderStage, stream, updated, size }: {
        name: string;
        value: (number | Array<number>);
        type: string;
        readable: boolean;
        shaderStage: GPUShaderStage;
        stream: bool;
        updated: bool;
        size: number;
    });
    /**
     * The name that the Storage will have on the WGSL side.
     * @param {String} value name of the Storage. The name is used in the WGSL
     * shader.
     * @example
     * // js
     * myStorage.name = 'myStorageName';
     *
     * // wgsl
     * myStorageName = 13.1;
     * @memberof Storage
     */
    set name(value: string);
    get name(): string;
    /**
     * @param {Boolean} value tells WebGPU if the Storage is mapped or not. This
     * allows for the initialization of the Storage with data, which is a
     * different route.
     * @memberof Storage
     */
    set mapped(value: boolean);
    get mapped(): boolean;
    /**
     * @param {String} value WGSL data type of the Storage.
     * @example
     * myStorage.type = 'u32'
     * @memberof Storage
     */
    set type(value: string);
    get type(): string;
    /**
     * Tells WebGPU to which shader it can only be used.
     * @param {GPUShaderStage} value
     * @memberof Storage
     */
    set shaderStage(value: GPUShaderStage);
    get shaderStage(): GPUShaderStage;
    /**
     * If data is read back in JS from WGSL, then set to `true`.
     * @param {Boolean} value
     * @memberof Storage
     */
    set readable(value: boolean);
    get readable(): boolean;
    /**
     * For internal use mostly. The actual {@link GPUBuffer} with the data.
     * @memberof Storage
     */
    set buffer(value: any);
    get buffer(): any;
    /**
     * Buffer for reading back
     * For internal use mostly. The actual GPUBufferRead with the data.
     * @memberof Storage
     */
    set bufferRead(value: any);
    get bufferRead(): any;
    set internal(value: boolean);
    get internal(): boolean;
    set size(value: any);
    get size(): any;
    /**
     * `updated` is set to true in data updates, but this is not true in
     * something like audio, where the data streams and needs to be updated
     * constantly, so if the storage map needs to be updated constantly then
     * `stream` needs to be set to true.
     * @param {boolean} value
     * @memberof Storage
     */
    set stream(value: boolean);
    get stream(): boolean;
    /**
     * Mostly internal. Set to `true` if a value has been updated.
     * @memberof Storage
     */
    set updated(value: boolean);
    get updated(): boolean;
    /**
     * @param {Number|Array<Number>} value data to send to the shader
     * @memberof Storage
     */
    set value(value: number | Array<number>);
    get value(): number | Array<number>;
    /**
     *
     * @param {Number|Array<Number>} value data to send to the shader
     * @returns {Storage}
     * @memberof Storage
     */
    setValue(value: number | Array<number>): Storage;
    /**
     * if this is going to be used to read data back set to `true`
     * @param {bool} value
     * @returns {Storage}
     * @memberof Storage
     */
    setReadable(value: bool): Storage;
    /**
     * Tells WebGPU to which shader it can only be used.
     * @param {GPUShaderStage} value
     * @returns {Storage}
     * @memberof Storage
     */
    setShaderStage(value: GPUShaderStage): Storage;
    /**
     * @param {String} value WGSL data type of the Storage.
     * @returns {Storage}
     * @example
     * myStorage.setType('u32');
     * @memberof Storage
     */
    setType(value: string): Storage;
    read(): Promise<Float32Array<any>>;
    valueOf(): number | number[];
    #private;
}
/**
 * Uniform is a container for uniform buffer related data and actions.
 *
 * @class Uniform
 */
export class Uniform {
    /**
     *
     * @param {{name:String, value:(Number|Boolean|Array<Number>), type:string, size:Number=}} config
     */
    constructor({ name, value, type, size }: {
        name: string;
        value: (number | boolean | Array<number>);
        type: string;
        size: number;
    });
    /**
     * The name that the Uniform will have on the WGSL side.
     * @param {String} value name of the Uniform. The name is used in the WGSL
     * shader.
     * @example
     * // js
     * myUniform.name = 'myUniformName';
     *
     * // wgsl
     * myUniformName = 13.0;
     * @memberof Uniform
     */
    set name(value: string);
    get name(): string;
    /**
     * To get or set the value of the uniform from the JS side to the WGSL side.
     * @param {Number|Boolean|Array<Number>} value The uniform value
     * @memberof Uniform
     */
    set value(value: number | boolean | Array<number>);
    get value(): number | boolean | Array<number>;
    /**
     * Get or set the type of the uniform.
     * It can be inferred automatically by just passing the value, but if
     * something more specific is required, then you should use `type`.
     * @param {String} value WGSL data type of the uniform
     * @example
     * myUniform.type = 'u32';
     * @memberof Uniform
     */
    set type(value: string);
    get type(): string;
    /**
     * For internal use mostly. Size in bytes.
     * @memberof Uniform
     */
    set size(value: number);
    get size(): number;
    /**
     * Clone of the Uniform data as a plain object to avoid modifications on
     * the original data.
     * @returns {Object}
     * @memberof Uniform
     */
    serialize(): any;
    /**
     * Sets or updates the value of the Uniform.
     * @param {Number|Boolean|Array<Number>} value
     * @memberof Uniform
     */
    setValue(value: number | boolean | Array<number>): this;
    /**
     * Set the data type of the uniform.
     * @param {String} value WGSL data type of the uniform
     * @example
     * myUniform.setType('u32')
     * @memberof Uniform
     */
    setType(value: string): this;
    valueOf(): number | boolean | number[];
    #private;
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
 * points.update(update);
 *
 * function update() {
 * // update uniforms and other animation variables
 * }
 *
 */
declare class Points {
    /**
     * Constructor of `Points`.
     * Set a width and height to be used if no `fitWindow` is called, and also
     * to be used by the `ScaleMode` to decide how to resize the screen content.
     * @param {String} canvasId id of an existing canvas
     * @param {Number} width default width
     * @param {Number} height default height
     */
    constructor(canvasId: string, width?: number, height?: number);
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
    set fitWindow(value: boolean);
    /**
     * Sets a `param` (predefined struct already in all shaders)
     * as uniform to send to all shaders.
     * A Uniform is a value that can only be changed
     * from the outside (js side, not the wgsl side),
     * and unless changed it remains consistent.
     * @param {string} name name of the Param, you can invoke it later in shaders as `Params.[name]`
     * @param {Number|Boolean|Array<Number>} value Single number or a list of numbers. Boolean is converted to Number.
     * @param {string} type type as `f32` or a custom struct. Default `f32`.
     * @return {Uniform}
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
    setUniform(name: string, value: number | boolean | Array<number>, type?: string): Uniform;
    /**
     * Updates a list of uniforms
     * @param {Array<{name:String, value:Number}>} arr object array of the type: `{name, value}`
     */
    updateUniforms(arr: Array<{
        name: string;
        value: number;
    }>): void;
    /**
     * Create a WGSL `const` initialized from JS.
     * Useful to set a value you can't initialize in WGSL because you don't have
     * the value yet.
     * The constant will be ready to use on the WGSL shder string.
     * @param {String} name
     * @param {string|Number} value
     * @param {String} type
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
    setConstant(name: string, value: string | number, type?: string): any;
    /**
     * Creates a persistent memory buffer across every frame call. See [GPUBuffer](https://www.w3.org/TR/webgpu/#gpubuffer)
     * <br>
     * Meaning it can be updated in the shaders across the execution of every frame.
     * <br>
     * It can have almost any type, like `f32` or `vec2f` or even array<f32>.
     * <br>
     * It can also be initialized with data with the {@link Storage#setValue} method
     * @param {string} name Name that the Storage will have in the shader
     * @param {string} type Name of the struct already existing on the
     * @param {Uint8Array<ArrayBuffer>|Array<Number>|Number} value array with the data that must match the struct.
     * shader. This will be the type of the Storage.
     * @returns {Storage}
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
     *
     * @example
     * // add data from initialization
     * // js
     * points.setStorage('vertex_data', `array<vec4f, ${vertex_data.length}>`)
        .setValue(vertex_data.flat());
     */
    setStorage(name: string, type?: string, value?: Uint8Array<ArrayBuffer> | Array<number> | number): Storage;
    /**
     * @deprecated Since v0.8.0 use {@link setStorage}
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
     * @param {Uint8Array<ArrayBuffer>|Array<Number>|Number} value array with the data that must match the struct.
     * @param {string} type Name of the struct already existing on the
     * shader. This will be the type of the Storage.
     * @param {boolean} readable if this is going to be used to read data back.
     * @param {GPUShaderStage} shaderStage this tells to what shader the storage is bound
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
    setStorageMap(name: string, value: Uint8Array<ArrayBuffer> | Array<number> | number, type: string, readable?: boolean, shaderStage?: GPUShaderStage): any;
    /**
     * To read data back from a `setStorage` with `readable` param `true`
     * @param {String} name name of the Storage to read data from
     * @warning If there's en error or warning here
     * `[Buffer "name"] used in submit while mapped.`
     * the update (or function that calls this method) needs an `await`
     * @returns {Float32Array} Array with the result
     */
    readStorage(name: string): Float32Array;
    /**
     * Layers of data made of `vec4f`.
     * This creates a storage array named `layers` of the size
     * of the screen in pixels;
     * @param {Number} numLayers
     * @param {GPUShaderStage} shaderStage
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
    setLayers(numLayers: number, shaderStage: GPUShaderStage): void;
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
     * let value = texturePosition(image, imageSampler, position, in.uvr, true);
     */
    setSampler(name: string, descriptor: GPUSamplerDescriptor, shaderStage: any): any;
    /**
     * Creates a `texture_2d` in the shaders.<br>
     * Used to write data and then print to screen.<br>
     * It can also be used for write the current render pass (what you see on the screen)
     * to this texture, to be used in the next cycle of this render pass; meaning
     * you effectively have the previous frame data before printing the next one.
     *
     * @param {String} name Name to call the texture in the shaders.
     * @param {boolean} copyCurrentTexture If you want the fragment output to be copied here.
     * @param {GPUShaderStage} shaderStage To what {@link GPUShaderStage} you want to exclusively use this variable.
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
    setTexture2d(name: string, copyCurrentTexture: boolean, shaderStage: GPUShaderStage, renderPassIndex: number): any;
    /**
     * Creates a depth map from the selected `renderPassIndex`
     * @param {String} name
     * @param {GPUShaderStage} shaderStage
     * @param {Number} renderPassIndex
     * @returns {Object}
     */
    setTextureDepth2d(name: string, shaderStage: GPUShaderStage, renderPassIndex: number): any;
    copyTexture(nameTextureA: any, nameTextureB: any): void;
    /**
     * Loads an image as `texture_2d` and then it will be available to read
     * data from in the shaders.<br>
     * Supports web formats like JPG, PNG.
     * @param {string} name identifier it will have in the shaders
     * @param {string} path image address in a web server
     * @param {GPUShaderStage} shaderStage in what shader type it will exist only
     * @returns {Object}
     *
     * @example
     * // js
     * await points.setTextureImage('image', './../myimage.jpg');
     *
     * // wgsl string
     * let rgba = texturePosition(image, imageSampler, position, in.uvr, true);
     */
    setTextureImage(name: string, path: string, shaderStage?: GPUShaderStage): any;
    /**
     * Loads a `HTMLElement` as `texture_2d`. It will automatically interpret
     * the CSS associated with the element to render it.
     * `@font-family` needs to be explicitly described in the element's css.
     * This will only generate an image, so animations will not work.
     * @param {String} name identifier it will have in the shaders
     * @param {HTMLElement} element element loaded in the DOM or dynamically
     * @param {GPUShaderStage} shaderStage in what shader type it will exist only
     * @returns {Object}
     *
     * @example
     * // js
     * const element = document.getElementById('my_element')
     * await points.setTextureElement('image', element);
     *
     * // wgsl string
     * let color = texture(image, imageSampler, in.uvr, true);
     */
    setTextureElement(name: string, element: HTMLElement, shaderStage?: GPUShaderStage): any;
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
     * @param {GPUShaderStage} shaderStage To what {@link GPUShaderStage} you want to exclusively use this variable.
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
     * let textColors = texture(textImg, imageSampler, in.uvr, true);
     *
     */
    setTextureString(name: string, text: string, path: string, size: {
        x: number;
        y: number;
    }, offset?: number, shaderStage?: GPUShaderStage): any;
    /**
     * Load images as texture_2d_array
     * @param {string} name id of the wgsl variable in the shader
     * @param {Array} paths image addresses in a web server
     * @param {GPUShaderStage} shaderStage
     */
    setTextureImageArray(name: string, paths: any[], shaderStage: GPUShaderStage): Promise<{
        name: string;
        copyCurrentTexture: boolean;
        shaderStage: GPUShaderStage;
        texture: any;
        imageTextures: {
            bitmaps: ImageBitmap[];
        };
        internal: boolean;
    }>;
    /**
     * Loads a video as `texture_external`and then
     * it will be available to read data from in the shaders.
     * Supports web formats like mp4 and webm.
     * @param {string} name id of the wgsl variable in the shader
     * @param {string} path video address in a web server
     * @param {GPUShaderStage} shaderStage
     * @returns {Object}
     *
     * @example
     * // js
     * await points.setTextureVideo('video', './../myvideo.mp4');
     *
     * // wgsl string
     * let rgba = textureExternalPosition(video, imageSampler, position, in.uvr, true);
     */
    setTextureVideo(name: string, path: string, shaderStage: GPUShaderStage): any;
    /**
     * Loads webcam as `texture_external`and then
     * it will be available to read data from in the shaders.
     * @param {String} name id of the wgsl variable in the shader
     * @param {{width:Number, height:Number}} size to crop the video. WebGPU might throw an error if size does not match.
     * @param {GPUShaderStage} shaderStage
     * @returns {Object}
     * @throws a WGSL error if the size doesn't match possible crop size
     * @example
     * // js
     * await points.setTextureWebcam('video');
     *
     * // wgsl string
     * et rgba = textureExternalPosition(video, imageSampler, position, in.uvr, true);
     */
    setTextureWebcam(name: string, size: {
        width: number;
        height: number;
    }, shaderStage: GPUShaderStage): any;
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
     * let audioX = audio.data[ u32(in.uvr.x * params.audioLength)] / 256;
     */
    setAudio(name: string, path: string, volume: number, loop: boolean, autoplay: boolean): HTMLAudioElement;
    setTextureStorage2d(name: any, shaderStage: any): {
        name: any;
        shaderStage: any;
        texture: any;
        internal: boolean;
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
     * Creates a Perspective camera with a given name to be used in the shaders.
     * The name is used as identifier in the shaders for the Projection and View matrices.
     *
     * The name will be inside the `camera` uniform and composed with the
     * projection and view identifiers: e.g.:
     * name: mycamera
     * uniform buffers:
     *  camera.mycamera_projection;
     *  camera.mycamera_view
     *
     * The camera must be called on the update method so the aspect is updated by default
     * with the canvas width and height.
     * @param {String} name camera name in the shader for the projection and view
     * @param {vec3f} position
     * @param {Number} fov field of view angle
     * @param {Number} near clipping near
     * @param {Number} far clipping far
     * @param {Number} aspect ratio of the camera, by default it choses the canvas aspect ratio
     *
     * @example
     * // js
     *  points.setCameraPerspective('camera', [0, 0, -5]);
     *
     * // wgsl string
     * let clip = camera.camera_projection * camera.camera_view * vec4f(world, 1.);
     */
    setCameraPerspective(name: string, position?: vec3f, lookAt?: number[], fov?: number, near?: number, far?: number, aspect?: number): void;
    /**
     * Creates an Orthographic camera with a given name to be used in the shaders.
     * The name is used as identifier in the shaders for the Projection matrix.
     *
     * The name will be inside the `camera` uniform and composed with the
     * projection identifier: e.g.:
     * name: mycamera
     * uniform buffer:
     *  camera.mycamera_projection;
     *
     * @param {String} name
     * @param {Number} left
     * @param {Number} right
     * @param {Number} top
     * @param {Number} bottom
     * @param {Number} near
     * @param {Number} far
     *
     * @example
     * // js
     * points.setCameraOrthographic('camera');
     *
     * // wgsl string
     * let clip = camera.camera_projection * vec4f(world, 0.0, 1.0);
     *
     */
    setCameraOrthographic(name: string, left?: number, right?: number, top?: number, bottom?: number, near?: number, far?: number, position?: number[], lookAt?: number[]): void;
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
    addEventListener(name: string, callback: Function, structSize?: number): void;
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
    get renderPasses(): RenderPass[];
    /**
     * Adds two triangles called points per number of columns and rows
     * @ignore
     */
    createScreen(renderPass: any): void;
    /**
     * Method executed on each {@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame | requestAnimationFrame}.
     * Here's where all the calls to update data will be executed.
     * @param {function(time:Number, deltaTime:number)} updateCallback method called on each frame update.
     * Here you will update uniforms, storage and general variables.
     * You will also have the `time` and `deltaTime` values used inside the library
     * to create animations. These are the same internal values in `params.time`
     * and `params.deltaTime`.
     * @example
     * points.setUniform('myvar', 3);
     * await points.init(renderPasses);
     * points.update(update);
     *
     * function update(time, timeDelta) {
     *     // update uniforms and other animation variables
     *     points.setUniform('myvar', 3); // already existing uniform to update
     * }
     */
    update(updateCallback: any): void;
    read(): Promise<void>;
    /**
     * Import and prepend a common string to all RenderPass shaders.
     * If a list of common functions or structs needs to be appended to all
     * RenderPass.
     * @param {String} common string to prepend
     *
     * @example
     * import { structs } from './structs.js';
     * points.import(structs);
     *
     */
    import(common: string): void;
    /**
     * Reference to the canvas assigned in the constructor
     * @type {HTMLCanvasElement}
     */
    get canvas(): HTMLCanvasElement;
    /**
     * @type {GPUDevice}
     */
    get device(): GPUDevice;
    get context(): any;
    /**
     * Triggers the app to run in full screen mode
     * @type {Boolean}
     *
     * @example
     * points.fullscreen = true
     */
    set fullscreen(value: boolean);
    get fullscreen(): boolean;
    /**
     * Gets the current time elapsed in milliseconds.
     */
    get time(): number;
    /**
     * Get the time elapsed since the last frame was renderd, in milliseconds.
     */
    get deltaTime(): number;
    /**
     * Set the maximum range the render textures can hold.
     * If you need HDR values use `16` or `32` float formats.
     * This value is used in the texture that is created when a fragment shader
     * returns its data, so if you use a `vec4` that goes beyond the default
     * capped of `0..1` like `vec4(16,0,1,1)`, then use `16` or `32`.
     *
     * {@link PresentationFormat}
     *
     * By default it has the `navigator.gpu.getPreferredCanvasFormat();` value.
     * @param {PresentationFormat|String|GPUTextureFormat} value
     */
    set presentationFormat(value: PresentationFormat | string | GPUTextureFormat);
    get presentationFormat(): PresentationFormat | string | GPUTextureFormat;
    /**
     * Shows or hides all the logs and warnings from the library.
     * Meant to be set as false in production environment.
     * By default is shows all the logs for development.
     * @param {Boolean} val
     * @default true
     * @example
     *
     * points.debug = false;
     */
    set debug(val: boolean);
    get debug(): boolean;
    /**
     * Select how the content should be displayed on different
     * screen sizes.
     * ```text
     * FIT: Preserves both, but might show black bars or extend empty content. All content is visible.
     * COVER: Preserves both, but might crop width or height. All screen is covered.
     * WIDTH: Preserves the visibility of the width, but might crop the height.
     * HEIGHT: Preserves the visibility of the height, but might crop the width.
     * ```
     * @param {ScaleMode|Number} val
     * @default ScaleMode.HEIGHT
     * @example
     *
     * points.scaleMode = ScaleMode.COVER;
     */
    set scaleMode(val: ScaleMode | number);
    get scaleMode(): ScaleMode | number;
    /**
     * Get the list of added uniforms, same as {@link uniforms}
     * @example
     *
     * points.setUniform('myuniform', 10);
     *
     * // later
     * points.params.myuniform.value = 12;
     */
    get params(): Uniforms;
    /**
     * @type {Uniforms & { [key: string]: Uniform }}
     *
     * Get the list of added uniforms, same as {@link params}
     * @example
     *
     * points.setUniform('myuniform', 10);
     *
     * // later
     * points.uniforms.myuniform.value = 12;
     */
    get uniforms(): Uniforms & {
        [key: string]: Uniform;
    };
    /**
     * @type {Storages & { [key: string]: Storage }}
     */
    get storages(): Storages & {
        [key: string]: Storage;
    };
    /**
     * @type {Constants & { [key: string]: Constant }}
     */
    get constants(): Constants & {
        [key: string]: Constant;
    };
    /**
     * Reset memory before calling again `init()`, this without calling
     * the constructor `new Points()`.
     * Useful to switch to a new set of shaders and erase internal references,
     * basically cleaning memory to start again. It also calls `.destroy()` on
     * buffers and textures.
     * A call to the constructor doesn't do this.
     * If you are going to call `destroy()` afterwards, there's no need to call
     * `reset()`.
     * This keeps the Device and Adapter alive.
     */
    reset(): void;
    /**
     * Nuke everything from memory.
     * Similar to reset, but it nullyfies everything to be garbage collected.
     * Calls `.destroy()` on buffers, textures, the Device and Adapter.
     * This would force a call to the constructor or to `reset()`.
     * If you are going to call `reset()` afterwards, then
     * there's no need to call `destroy()`.
     */
    destroy(): void;
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
/**
 * Class that handles the creation of new {@link Uniform}s in Points.
 * @example
 * // js side
 * points.uniforms.myUniform = 10
 *
 * // wgsl side
 * let val = params.myUniform; // value is 10.0 f32
 * @class Uniforms
 */
declare class Uniforms {
    /**
     * List of all {@link Uniform}s
     * @param {Array} value
     * @memberof Uniforms
     */
    set list(value: any[]);
    get list(): any[];
    /**
     * Retrieves a {@link Uniform} by its name.
     * @param {String} name
     * @returns {Uniform}
     * @memberof Uniforms
     */
    find(name: string): Uniform;
    /**
     * Add a new {@link Uniform}
     * @param {Uniform} uniform
     * @memberof Uniforms
     */
    add(uniform: Uniform): void;
    #private;
}
/**
 * Class that handles the creation of new {@link Storage}s in Points.
 * @example
 * // js side
 * points.storages.myStorage = [1, 2, 3]
 *
 * // wgsl side
 * let val = myStorage; // value is vec3f(1, 2, 3)
 * @class Storages
 */
declare class Storages {
    /**
     * List of all {@link Storage}
     * @param {Array} value
     * @memberof Storages
     */
    set list(value: any[]);
    get list(): any[];
    /**
     * Retrieves a {@link Storage} by its name.
     * @param {String} name
     * @returns {Storage}
     * @memberof Storages
     */
    find(name: string): Storage;
    /**
     * Add a new {@link Storage}
     * @param {Storage} storage
     * @memberof Storages
     */
    add(storage: Storage): void;
    #private;
}
/**
 * Class that handles the creation of new {@link Constant}s in Points.
 * @example
 * // js side
 * points.constants.MYCONST = 10;
 *
 * // wgsl side
 * let val = MYCONST; // value is 10 u32 by default
 * @class Constants
 */
declare class Constants {
    /**
     * List of all {@link Constant}s
     * @param {Array} value
     * @memberof Constants
     */
    set list(value: any[]);
    get list(): any[];
    /**
     * Retrieves a {@link Constant} by its name.
     * @param {String} name
     * @returns {Constant}
     * @memberof Constants
     */
    find(name: string): Constant;
    /**
     * Add a new {@link Constant}
     * @param {Constant} constant
     * @memberof Constants
     */
    add(constant: Constant): void;
    /**
     * Object list with the constants that are overridable.
     * This object will be passed into the pipeline.
     * @param {GPUShaderStage|Number} filter
     * @returns {Object}
     * @memberof Constants
     */
    listOfOverrides(filter: GPUShaderStage | number): any;
    /**
     * List of constants formatted as WGSL string to be interpolated in the
     * shaders.
     * @param {GPUShaderStage|Number} filter
     * @returns {String}
     * @memberof Constants
     */
    stringOfNonOverrides(filter: GPUShaderStage | number): string;
    #private;
}
export { Points as default };
