/* @ts-self-types="./RenderPass.d.ts" */
function getWGSLCoordinate(value, side, invert = false) {
    const direction = invert ? -1 : 1;
    const p = value / side;
    return (p * 2 - 1) * direction;
}
const BARYCENTRICS = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
];

/**
 * To tell the {@link RenderPass} how to display the triangles.
 * Default `TRIANGLE_LIST`
 * @example
 *
 * renderPass.topology = PrimitiveTopology.POINT_LIST;
 */
class PrimitiveTopology {
    /** @type {GPUPrimitiveTopology} */
    static POINT_LIST = 'point-list';
    /** @type {GPUPrimitiveTopology} */
    static LINE_LIST = 'line-list';
    /** @type {GPUPrimitiveTopology} */
    static LINE_STRIP = 'line-strip';
    /** @type {GPUPrimitiveTopology} */
    static TRIANGLE_LIST = 'triangle-list';
    /** @type {GPUPrimitiveTopology} */
    static TRIANGLE_STRIP = 'triangle-strip';
}
/**
 * To tell the {@link RenderPass} how the data from the previous RenderPass
 * is preserved on screen or cleared.
 * Default `CLEAR`
 * @example
 *
 * renderPass.loadOp = LoadOp.LOAD;
 */
class LoadOp {
    /** @type {GPULoadOp} */
    static CLEAR = 'clear';
    /** @type {GPULoadOp} */
    static LOAD = 'load';
}

/**
 * To tell the {@link RenderPass} what polygons are Front Facing
 * Default `CCW`
 * @example
 *
 * renderPass.frontFace = FrontFace.CCW;
 */
class FrontFace {
    /** @type {GPUFrontFace} */
    static CCW = 'ccw';
    /** @type {GPUFrontFace} */
    static CW = 'cw';
}

/**
 * To tell the {@link RenderPass} what polygons should be discarded
 * Default `BACK`
 * @example
 *
 * renderPass.cullMode = CullMode.BACK;
 */
class CullMode {
    /** @type {GPUCullMode} */
    static NONE = 'none';
    /** @type {GPUCullMode} */
    static FRONT = 'front';
    /** @type {GPUCullMode} */
    static BACK = 'back';
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

class RenderPass {
    #index = null;
    #vertexShader;
    #computeShader;
    #fragmentShader;
    #compiledShaders
    #computePipeline = null;
    #renderPipeline = null;
    #name = null;
    /**
     * @type {GPUBindGroup}
     */
    #computeBindGroup = null;
    /**
     * @type {GPUBindGroup}
     */
    #fragmentBindGroup = null;
    /**
     * @type {GPUBindGroup}
     */
    #vertexBindGroup = null;
    /**
     * @type {GPUBindGroupLayout}
     */
    #bindGroupLayoutFragment = null;
    /**
     * @type {GPUBindGroupLayout}
     */
    #bindGroupLayoutVertex = null;
    /**
     * @type {GPUBindGroupLayout}
     */
    #bindGroupLayoutCompute = null;
    #hasComputeShader;
    #hasVertexShader;
    #hasFragmentShader;
    #hasVertexAndFragmentShader;
    #workgroupCountX;
    #workgroupCountY;
    #workgroupCountZ;

    #callback = null;
    #required = null;
    #instanceCount = 1;
    #internal = false;
    #params = null;

    #vertexArray = [];
    #vertexBuffer = null;
    #vertexBufferInfo = null;

    #depthWriteEnabled = false;
    #textureDepth = null;
    #loadOp = LoadOp.CLEAR;
    #clearValue = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };

    #meshCounter = 0;
    #meshes = [];

    #topology = PrimitiveTopology.TRIANGLE_LIST;
    #cullMode = CullMode.BACK;
    #frontFace = FrontFace.CCW;

    #descriptor = {
        colorAttachments: [
            {
                //view: textureView,
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }
        ],
        // depthStencilAttachment: {
        //     //view: this.#depthTexture.createView(),
        //     depthClearValue: 1.0,
        //     depthLoadOp: 'clear',
        //     depthStoreOp: 'store'
        // }
    };

    #depthStencilAttachment = {
        //view: this.#depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store'
    }

    #bundle = null;
    #device = null;

    #enabled = true;

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
    constructor(vertexShader, fragmentShader, computeShader, workgroupCountX, workgroupCountY, workgroupCountZ, init) {
        this.#vertexShader = vertexShader;
        this.#computeShader = computeShader;
        this.#fragmentShader = fragmentShader;

        this.#callback = init;
        this.#internal = !!init; // if it has the init then is a external Render Pass (Post Process)

        this.#compiledShaders = {
            vertex: '',
            compute: '',
            fragment: '',
        };

        this.#hasComputeShader = !!this.#computeShader;
        this.#hasVertexShader = !!this.#vertexShader;
        this.#hasFragmentShader = !!this.#fragmentShader;

        this.#hasVertexAndFragmentShader = this.#hasVertexShader && this.#hasFragmentShader;

        this.#workgroupCountX = workgroupCountX || 8;
        this.#workgroupCountY = workgroupCountY || 8;
        this.#workgroupCountZ = workgroupCountZ || 1;
        Object.seal(this);
    }

    /**
     * Get the current RenderPass index order in the pipeline.
     * When you add a RenderPass to the constructor or via
     * {@link Points#addRenderPass}, this is the order it receives.
     */
    get index() {
        return this.#index;
    }

    set index(value) {
        this.#index = value;
    }

    /**
     * get the vertex shader content
     */
    get vertexShader() {
        return this.#vertexShader;
    }

    /**
     * get the compute shader content
     */
    get computeShader() {
        return this.#computeShader;
    }

    /**
     * get the fragment shader content
     */
    get fragmentShader() {
        return this.#fragmentShader;
    }

    set computePipeline(value) {
        this.#computePipeline = value;
    }

    get computePipeline() {
        return this.#computePipeline;
    }

    set renderPipeline(value) {
        this.#renderPipeline = value;
    }

    get renderPipeline() {
        return this.#renderPipeline;
    }

    set computeBindGroup(value) {
        this.#computeBindGroup = value;
    }

    get computeBindGroup() {
        return this.#computeBindGroup;
    }

    set fragmentBindGroup(value) {
        this.#fragmentBindGroup = value;
    }

    get fragmentBindGroup() {
        return this.#fragmentBindGroup;
    }

    set vertexBindGroup(value) {
        this.#vertexBindGroup = value;
    }

    get vertexBindGroup() {
        return this.#vertexBindGroup;
    }

    set bindGroupLayoutFragment(value) {
        this.#bindGroupLayoutFragment = value;
    }

    get bindGroupLayoutFragment() {
        return this.#bindGroupLayoutFragment;
    }

    set bindGroupLayoutVertex(value) {
        this.#bindGroupLayoutVertex = value;
    }

    get bindGroupLayoutVertex() {
        return this.#bindGroupLayoutVertex;
    }

    set bindGroupLayoutCompute(value) {
        this.#bindGroupLayoutCompute = value;
    }

    get bindGroupLayoutCompute() {
        return this.#bindGroupLayoutCompute;
    }

    get compiledShaders() {
        return this.#compiledShaders;
    }

    get hasComputeShader() {
        return this.#hasComputeShader;
    }

    get hasVertexShader() {
        return this.#hasVertexShader;
    }

    get hasFragmentShader() {
        return this.#hasFragmentShader;
    }

    get hasVertexAndFragmentShader() {
        return this.#hasVertexAndFragmentShader;
    }

    /**
     * How many workgroups are in the X dimension.
     */
    get workgroupCountX() {
        return this.#workgroupCountX;
    }

    /**
     * @param {Number} val
     */
    set workgroupCountX(val) {
        this.#workgroupCountX = val;
    }

    /**
     * How many workgroups are in the Y dimension.
     */
    get workgroupCountY() {
        return this.#workgroupCountY;
    }

    /**
     * @param {Number} val
     */
    set workgroupCountY(val) {
        this.#workgroupCountY = val;
    }

    /**
     * How many workgroups are in the Z dimension.
     */
    get workgroupCountZ() {
        return this.#workgroupCountZ;
    }

    /**
     * @param {Number} val
     */
    set workgroupCountZ(val) {
        this.#workgroupCountZ = val;
    }

    /**
     * Function where the `init` parameter (set in the constructor) is executed
     * and this call will pass the parameters that the RenderPass
     * requires to run.
     * @param {Points} points instance of {@link Points} to call set* functions
     * like {@link Points#setUniform}  and others.
     */
    init(points) {
        this.#params ||= {};
        this.#callback?.(points, this.#params);
    }

    get required() {
        return this.#required;
    }
    /**
     * List of buffer names that are required for this RenderPass so if it shows
     * them in the console.
     * @param {Array<String>} val names of the parameters `params` in
     * {@link RenderPass#setInit} that are required.
     * This is only  used for a post processing RenderPass.
     */
    set required(val) {
        this.#required = val;
    }

    /**
     * Number of instances that will be created of the current mesh (Vertex Buffer)
     * in this RenderPass. This means if you have a quad, it will create
     * `instanceCount` number of independent quads on the screen.
     * Useful for instanced particles driven by a Storage buffer.
     */

    get instanceCount() {
        // TODO: lock the value with a flag
        this.#instanceCount = this.#meshes.reduce((sum, mesh) => sum + mesh.instanceCount, 0);
        return this.#instanceCount;
    }

    get name() {
        return this.#name;
    }

    set name(val) {
        this.#name = val;
    }

    get internal() {
        return this.#internal;
    }

    /**
     * Parameters specifically for Post RenderPass
     */
    get params() {
        return this.#params;
    }
    /**
     * @param {Object} val data that can be assigned to the RenderPass when
     * the {@link Points#addRenderPass} method is called.
     */
    set params(val) {
        this.#params = val;
    }

    get vertexArray() {
        return new Float32Array(this.#vertexArray);
    }

    set vertexArray(val) {
        this.#vertexArray = val;
    }

    get vertexBufferInfo() {
        return this.#vertexBufferInfo;
    }

    set vertexBufferInfo(val) {
        this.#vertexBufferInfo = val;
    }

    get vertexBuffer() {
        return this.#vertexBuffer;
    }

    set vertexBuffer(val) {
        this.#vertexBuffer = val;
    }

    get depthWriteEnabled() {
        return this.#depthWriteEnabled;
    }

    /**
     * Controls whether your fragment shader can write to the depth buffer.
     * By default `true`.
     * To allow transparency and a custom type of sort, set this as false;
     * @param {Boolean} val
     */
    set depthWriteEnabled(val) {

        if (val) {
            this.#descriptor.depthStencilAttachment = this.#depthStencilAttachment;
        }

        this.#depthWriteEnabled = val;
    }

    get textureDepth() {
        return this.#textureDepth;
    }

    /**
     * Holder for the depth map for this RenderPass only
     * @param {GPUTexture} val
     */
    set textureDepth(val) {
        this.#textureDepth = val;
    }

    get loadOp() {
        return this.#loadOp;
    }

    /**
     * Controls if the last RenderPass data is preserved on screen or cleared.
     * Default {@link LoadOp#CLEAR}
     * @param {LoadOp | GPULoadOp} val
     */
    set loadOp(val) {
        this.#loadOp = val;
        this.#descriptor.colorAttachments[0].loadOp = this.#loadOp;
    }

    get clearValue() {
        return this.#clearValue;
    }

    /**
     * Sets the color used to clear the RenderPass before drawing.
     * (only if {@link RenderPass#loadOp | loadOp} is set to `clear`)
     * default: black
     * @param {{ r: Number, g: Number, b: Number, a: Number }} val
     */
    set clearValue(val) {
        this.#clearValue = val;
        this.#descriptor.colorAttachments[0].clearValue = this.#clearValue;
    }

    /**
     * @type {GPURenderPassDescriptor}
     */
    get descriptor() {
        return this.#descriptor;
    }

    get topology() {
        return this.#topology;
    }

    /**
     * To render as Triangles, lines or points.
     * Use class {@link PrimitiveTopology}
     * @param {GPUPrimitiveTopology} val
     */
    set topology(val) {
        this.#topology = val;
    }

    get cullMode() {
        return this.#cullMode;
    }

    /**
     * Triangles to discard.
     * Default `BACK`.
     * Use class {@link CullMode}
     * @param {CullMode | GPUCullMode} val
     */
    set cullMode(val) {
        this.#cullMode = val;
    }

    get frontFace() {
        return this.#frontFace;
    }

    /**
     * Direction of the triangles.
     * Counter Clockwise (CCW) or Clockwise (CW)
     * Default `CCW`.
     * Use class {@link frontFace}
     * @param {FrontFace | GPUFrontFace} val
     */
    set frontFace(val) {
        this.#frontFace = val;
    }

    get bundle() {
        return this.#bundle;
    }

    /**
     * Render Bundle for performance
     * @param {GPURenderBundle} val
     */
    set bundle(val) {
        this.#bundle = val;
    }

    get device() {
        return this.#device;
    }
    /**
     * Device reference to check if RenderBundle needs to be rebuilt
     * @param {GPUDevice} val
     */
    set device(val) {
        this.#device = val;
    }

    get enabled() {
        return this.#enabled;
    }

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
    set enabled(val) {
        this.#enabled = val;
    }

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
    addPoint(coordinate, width, height, colors, canvas, useTexture = false) {
        const { x, y, z } = coordinate;

        const nx = getWGSLCoordinate(x, canvas.width);                  // left
        const ny = getWGSLCoordinate(y, canvas.height, true);           // top
        const nw = getWGSLCoordinate(x + width, canvas.width);          // right
        const nh = getWGSLCoordinate(y + height, canvas.height);        // bottom

        const nz = z;
        const normals = [0, 0, 1];
        const id = this.#meshCounter;

        const { r: r0, g: g0, b: b0, a: a0 } = colors[0]; // top-left
        const { r: r1, g: g1, b: b1, a: a1 } = colors[1]; // bottom-left
        const { r: r2, g: g2, b: b2, a: a2 } = colors[2]; // top-right
        const { r: r3, g: g3, b: b3, a: a3 } = colors[3]; // bottom-right

        this.#vertexArray.push(
            +nx, +ny, nz, 1, r0, g0, b0, a0, (+nx + 1) * 0.5, (+ny + 1) * 0.5, ...normals, id, ...BARYCENTRICS[0], // top-left
            +nx, -nh, nz, 1, r1, g1, b1, a1, (+nx + 1) * 0.5, (-nh + 1) * 0.5, ...normals, id, ...BARYCENTRICS[1], // bottom-left
            +nw, +ny, nz, 1, r2, g2, b2, a2, (+nw + 1) * 0.5, (+ny + 1) * 0.5, ...normals, id, ...BARYCENTRICS[2], // top-right
        );

        this.#vertexArray.push(
            +nx, -nh, nz, 1, r1, g1, b1, a1, (+nx + 1) * 0.5, (-nh + 1) * 0.5, ...normals, id, ...BARYCENTRICS[0], // bottom-left
            +nw, -nh, nz, 1, r3, g3, b3, a3, (+nw + 1) * 0.5, (-nh + 1) * 0.5, ...normals, id, ...BARYCENTRICS[1], // bottom-right
            +nw, +ny, nz, 1, r2, g2, b2, a2, (+nw + 1) * 0.5, (+ny + 1) * 0.5, ...normals, id, ...BARYCENTRICS[2], // top-right
        );

        const mesh = {
            name: '_plane_',
            id,
            instanceCount: 1,
            verticesCount: 6
        };
        this.#meshes.push(mesh);
        ++this.#meshCounter;

        return mesh;
    }

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
    addPlane(
        name,
        coordinate = { x: 0, y: 0, z: 0 },
        dimensions = { width: 1, height: 1 },
        color = { r: 1, g: 0, b: 1, a: 0 },
        segments = { x: 1, y: 1 }
    ) {
        const { x, y, z } = coordinate;
        const { width, height } = dimensions;
        const { x: sx, y: sy } = segments;
        const hw = width / 2;
        const hh = height / 2;

        const { r, g, b, a } = color;
        const normal = [0, 0, 1];

        const id = this.#meshCounter;

        const grid = [];
        for (let iy = 0; iy <= sy; iy++) {
            const v = iy / sy;
            const posY = y - hh + v * height;

            for (let ix = 0; ix <= sx; ix++) {
                const u = ix / sx;
                const posX = x - hw + u * width;

                grid.push({
                    position: [posX, posY, z],
                    uv: [u, v]
                });
            }
        }

        for (let iy = 0; iy < sy; iy++) {
            for (let ix = 0; ix < sx; ix++) {
                const rowSize = sx + 1;
                const i0 = iy * rowSize + ix;
                const i1 = i0 + 1;
                const i2 = i0 + rowSize;
                const i3 = i2 + 1;

                const quad = [
                    grid[i0], grid[i1], grid[i3],
                    grid[i0], grid[i3], grid[i2]
                ];

                quad.forEach(({ position: [vx, vy, vz], uv: [u, v] }, i) => {
                    this.#vertexArray.push(+vx, +vy, +vz, 1, r, g, b, a, u, v, ...normal, id, ...BARYCENTRICS[i % 3]);
                });
            }
        }

        const mesh = {
            name,
            id,
            instanceCount: 1,
            verticesCount: sx * sy * 6
        };
        this.#meshes.push(mesh);
        ++this.#meshCounter;

        return mesh;
    }

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
    addCube(
        name,
        coordinate = { x: 0, y: 0, z: 0 },
        dimensions = { width: 1, height: 1, depth: 1 },
        color = { r: 1, g: 0, b: 1, a: 0 }
    ) {
        const { x, y, z } = coordinate;
        const { width, height, depth } = dimensions;
        const hw = width / 2;
        const hh = height / 2;
        const hd = depth / 2;

        const corners = [
            [x - hw, y - hh, z - hd], // 0: left-bottom-back
            [x + hw, y - hh, z - hd], // 1: right-bottom-back
            [x + hw, y + hh, z - hd], // 2: right-top-back
            [x - hw, y + hh, z - hd], // 3: left-top-back
            [x - hw, y - hh, z + hd], // 4: left-bottom-front
            [x + hw, y - hh, z + hd], // 5: right-bottom-front
            [x + hw, y + hh, z + hd], // 6: right-top-front
            [x - hw, y + hh, z + hd], // 7: left-top-front
        ];

        const faceUVs = [
            [[0, 0], [1, 0], [1, 1], [0, 1]], // back
            [[0, 0], [1, 0], [1, 1], [0, 1]], // front
            [[0, 0], [1, 0], [1, 1], [0, 1]], // left
            [[0, 0], [1, 0], [1, 1], [0, 1]], // right
            [[0, 0], [1, 0], [1, 1], [0, 1]], // top
            [[0, 0], [1, 0], [1, 1], [0, 1]], // bottom
        ];

        const faceNormals = [
            [0, 0, -1],  // back
            [0, 0, 1],   // front
            [-1, 0, 0],  // left
            [1, 0, 0],   // right
            [0, 1, 0],   // top
            [0, -1, 0],  // bottom
        ];

        const faces = [
            [0, 3, 2, 1], // back
            [4, 5, 6, 7], // front
            [0, 4, 7, 3], // left
            [5, 1, 2, 6], // right
            [3, 7, 6, 2], // top
            [0, 1, 5, 4], // bottom
        ];

        for (let i = 0; i < 6; i++) {
            const [i0, i1, i2, i3] = faces[i];
            // const color = faceColors[i];
            const { r, g, b, a } = color;
            const normals = faceNormals[i];

            const v = [corners[i0], corners[i1], corners[i2], corners[i3]];

            const uv = faceUVs[i];
            const verts = [
                [v[0], uv[0]],
                [v[1], uv[1]],
                [v[2], uv[2]],
                [v[0], uv[0]],
                [v[2], uv[2]],
                [v[3], uv[3]],
            ];

            verts.forEach(([[vx, vy, vz], [u, v]], i) => {
                this.#vertexArray.push(+vx, +vy, +vz, 1, r, g, b, a, u, v, ...normals, this.#meshCounter, ...BARYCENTRICS[i % 3]);
            });
        }

        const mesh = {
            name,
            id: this.#meshCounter,
            instanceCount: 1,
            verticesCount: 36
        };
        this.#meshes.push(mesh);

        ++this.#meshCounter;

        return mesh;
    }

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
    addSphere(
        name,
        coordinate = { x: 0, y: 0, z: 0 },
        color = { r: 1, g: 0, b: 1, a: 0 },
        radius = 1,
        segments = 16,
        rings = 12
    ) {
        const { x, y, z } = coordinate;
        const { r, g, b, a } = color;

        const vertexGrid = [];
        for (let lat = 0; lat <= rings; lat++) {
            const theta = (lat * Math.PI) / rings;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            vertexGrid[lat] = [];

            for (let lon = 0; lon <= segments; lon++) {
                const phi = (lon * 2 * Math.PI) / segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const nx = cosPhi * sinTheta;
                const ny = cosTheta;
                const nz = sinPhi * sinTheta;

                const vx = x + radius * nx;
                const vy = y + radius * ny;
                const vz = z + radius * nz;

                const u = lon / segments;
                const v = lat / rings;

                vertexGrid[lat][lon] = [vx, vy, vz, 1, r, g, b, a, u, v, nx, ny, nz, this.#meshCounter];
            }
        }

        const b0 = BARYCENTRICS[0];
        const b1 = BARYCENTRICS[1];
        const b2 = BARYCENTRICS[2];
        // generate triangles
        for (let lat = 0; lat < rings; lat++) {
            for (let lon = 0; lon < segments; lon++) {
                const v1 = vertexGrid[lat][lon];
                const v2 = vertexGrid[lat + 1][lon];
                const v3 = vertexGrid[lat + 1][lon + 1];
                const v4 = vertexGrid[lat][lon + 1];

                // triangle 1
                this.#vertexArray.push(...v1, ...b0, ...v3, ...b1, ...v2, ...b2);
                // triangle 2
                this.#vertexArray.push(...v1, ...b0, ...v4, ...b1, ...v3, ...b2);
            }
        }

        const mesh = {
            name,
            id: this.#meshCounter,
            instanceCount: 1,
            verticesCount: rings * segments * 6
        };
        this.#meshes.push(mesh);

        ++this.#meshCounter;

        return mesh;
    }

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
    addTorus(
        name,
        coordinate = { x: 0, y: 0, z: 0 },
        radius = 1,
        tube = .4,
        radialSegments = 32,
        tubularSegments = 24,
        color = { r: 1, g: 0, b: 1, a: 1 }
    ) {
        const { x, y, z } = coordinate;
        const { r, g, b, a } = color;

        const vertices = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        for (let k = 0; k <= radialSegments; k++) {
            const v = k / radialSegments * Math.PI * 2;
            const cosV = Math.cos(v);
            const sinV = Math.sin(v);

            for (let i = 0; i <= tubularSegments; i++) {
                const u = i / tubularSegments * Math.PI * 2;
                const cosU = Math.cos(u);
                const sinU = Math.sin(u);

                const tx = (radius + tube * cosV) * cosU + x;
                const ty = (radius + tube * cosV) * sinU + y;
                const tz = tube * sinV + z;

                const nx = cosV * cosU;
                const ny = cosV * sinU;
                const nz = sinV;

                vertices.push([tx, ty, tz]);
                normals.push([nx, ny, nz]);
                uvs.push([i / tubularSegments, k / radialSegments]);
            }
        }

        for (let k = 1; k <= radialSegments; k++) {
            for (let i = 1; i <= tubularSegments; i++) {
                const a = (tubularSegments + 1) * k + i - 1;
                const b = (tubularSegments + 1) * (k - 1) + i - 1;
                const c = (tubularSegments + 1) * (k - 1) + i;
                const d = (tubularSegments + 1) * k + i;

                indices.push([a, b, d]);
                indices.push([b, c, d]);
            }
        }

        for (const [i0, i1, i2] of indices) {
            for (const i of [i0, i1, i2]) {
                const [vx, vy, vz] = vertices[i];
                const [nx, ny, nz] = normals[i];
                const [u, v] = uvs[i];
                this.#vertexArray.push(vx, vy, vz, 1, r, g, b, a, u, v, nx, ny, nz, this.#meshCounter, ...BARYCENTRICS[i % 3]);
            }
        }

        const mesh = {
            name,
            id: this.#meshCounter,
            instanceCount: 1,
            verticesCount: indices.length * 3
        };
        this.#meshes.push(mesh);

        ++this.#meshCounter;

        return mesh;
    }

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
    addCylinder(
        name,
        coordinate = { x: 0, y: 0, z: 0 },
        radius = .5,
        height = 1,
        radialSegments = 32,
        cap = true,
        color = { r: 1, g: 0, b: 1, a: 1 }
    ) {
        const { x: cx, y: cy, z: cz } = coordinate;
        const { r, g, b, a } = color;
        const halfHeight = height / 2;

        const vertices = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        // sides
        for (let i = 0; i <= radialSegments; i++) {
            const theta = (i / radialSegments) * Math.PI * 2;
            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);

            const px = cx + radius * cosTheta;
            const pz = cz + radius * sinTheta;

            vertices.push([px, cy - halfHeight, pz]); // bottom
            normals.push([cosTheta, 0, sinTheta]);
            uvs.push([i / radialSegments, 0]);

            vertices.push([px, cy + halfHeight, pz]); // top
            normals.push([cosTheta, 0, sinTheta]);
            uvs.push([i / radialSegments, 1]);
        }

        for (let i = 0; i < radialSegments; i++) {
            const base = i * 2;
            indices.push([base, base + 1, base + 3]);
            indices.push([base, base + 3, base + 2]);
        }

        // caps
        if (cap) {
            const bottomCenterIndex = vertices.length;
            vertices.push([cx, cy - halfHeight, cz]);
            normals.push([0, -1, 0]);
            uvs.push([.5, .5]);

            const topCenterIndex = vertices.length;
            vertices.push([cx, cy + halfHeight, cz]);
            normals.push([0, 1, 0]);
            uvs.push([.5, .5]);

            for (let i = 0; i < radialSegments; i++) {
                const theta = (i / radialSegments) * Math.PI * 2;
                const nextTheta = ((i + 1) / radialSegments) * Math.PI * 2;

                const x0 = cx + radius * Math.cos(theta);
                const z0 = cz + radius * Math.sin(theta);
                const x1 = cx + radius * Math.cos(nextTheta);
                const z1 = cz + radius * Math.sin(nextTheta);

                const bottomIdx0 = vertices.length;
                vertices.push([x0, cy - halfHeight, z0]);
                normals.push([0, -1, 0]);
                uvs.push([.5 + .5 * Math.cos(theta), .5 + .5 * Math.sin(theta)]);

                const bottomIdx1 = vertices.length;
                vertices.push([x1, cy - halfHeight, z1]);
                normals.push([0, -1, 0]);
                uvs.push([.5 + .5 * Math.cos(nextTheta), .5 + .5 * Math.sin(nextTheta)]);

                indices.push([bottomCenterIndex, bottomIdx0, bottomIdx1]);

                const topIdx0 = vertices.length;
                vertices.push([x0, cy + halfHeight, z0]);
                normals.push([0, 1, 0]);
                uvs.push([.5 + .5 * Math.cos(theta), .5 + .5 * Math.sin(theta)]);

                const topIdx1 = vertices.length;
                vertices.push([x1, cy + halfHeight, z1]);
                normals.push([0, 1, 0]);
                uvs.push([.5 + .5 * Math.cos(nextTheta), .5 + .5 * Math.sin(nextTheta)]);

                indices.push([topCenterIndex, topIdx1, topIdx0]);
            }
        }

        for (const ii of indices) {
            ii.forEach((i, k) => {
                const [vx, vy, vz] = vertices[i];
                const [nx, ny, nz] = normals[i];
                const [u, v] = uvs[i];
                this.#vertexArray.push(vx, vy, vz, 1, r, g, b, a, u, v, nx, ny, nz, this.#meshCounter, ...BARYCENTRICS[k % 3]);
            });
        }

        const mesh = {
            name,
            id: this.#meshCounter,
            instanceCount: 1,
            verticesCount: indices.length * 3
        };
        this.#meshes.push(mesh);

        ++this.#meshCounter;

        return mesh;
    }

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
    addMesh(name, vertices, colors, colorSize, uvs, normals, indices) {
        const verticesCount = indices.length;

        for (let i = 0; i < verticesCount; i++) {
            const index = indices[i];
            const vertex = vertices.slice(index * 3, index * 3 + 3);

            const color = colors?.slice(index * colorSize, index * colorSize + colorSize);
            const uv = uvs.slice(index * 2, index * 2 + 2);
            const normal = normals.slice(index * 3, index * 3 + 3);

            const [x, y, z] = vertex;
            const [r, g, b] = color || [1, 0, 1];
            const [u, v] = uv;
            this.#vertexArray.push(+x, +y, +z, 1, r, g, b, 1, u, v, ...normal, this.#meshCounter, ...BARYCENTRICS[i % 3]);
        }

        const mesh = {
            name,
            id: this.#meshCounter,
            instanceCount: 1,
            verticesCount
        };
        this.#meshes.push(mesh);
        ++this.#meshCounter;

        return mesh;
    }

    /**
     * For internal purposes
     * ids and names of the meshes
     */
    get meshes() {
        return this.#meshes;
    }

    destroy() {
        this.#device = null;
        this.#textureDepth.destroy();


        this.#vertexBuffer.destroy();

        this.#compiledShaders = {
            vertex: '',
            compute: '',
            fragment: '',
        };

        this.#computeBindGroup = null;
        this.#fragmentBindGroup = null;
        this.#vertexBindGroup = null;
        this.#bindGroupLayoutFragment = null;
        this.#bindGroupLayoutVertex = null;
        this.#bindGroupLayoutCompute = null;

        this.#computePipeline = null;
        this.#renderPipeline = null;

        this.#bundle = null;
    }

}

export { CullMode, FrontFace, LoadOp, PrimitiveTopology, RenderPass as default };
