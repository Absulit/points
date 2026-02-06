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
declare class RenderPass {
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
     * Adds a mesh cube
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
     * Adds a mesh sphere
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
     * Adds a Torus mesh
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
     * Adds a Cylinder mesh
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
     * Add a external mesh with the provided required data.
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
     * For internal purposes
     * ids and names of the meshes
     */
    get meshes(): any[];
    destroy(): void;
    #private;
}
export { RenderPass as default };
