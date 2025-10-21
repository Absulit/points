/* @ts-self-types="./points.d.ts" */
import { RenderPass as RenderPass$1 } from 'points';

function getWGSLCoordinate(value, side, invert = false) {
    const direction = invert ? -1 : 1;
    const p = value / side;
    return (p * 2 - 1) * direction;
}
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
    #renderBindGroup = null;
    /**
     * @type {GPUBindGroup}
     */
    #vertexBindGroup = null;
    /**
     * @type {GPUBindGroupLayout}
     */
    #bindGroupLayoutRender = null;
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
    #loadOp = 'clear';
    #clearValue = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };

    #meshCounter = 0;
    #meshes = [];

    #topology = PrimitiveTopology.TRIANGLE_LIST;

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

    set renderBindGroup(value) {
        this.#renderBindGroup = value;
    }

    get renderBindGroup() {
        return this.#renderBindGroup;
    }

    set vertexBindGroup(value) {
        this.#vertexBindGroup = value;
    }

    get vertexBindGroup() {
        return this.#vertexBindGroup;
    }

    set bindGroupLayoutRender(value) {
        this.#bindGroupLayoutRender = value;
    }

    get bindGroupLayoutRender() {
        return this.#bindGroupLayoutRender;
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

    get loadOp() {
        return this.#loadOp;
    }

    /**
     * Controls if the last RenderPass data is preserved on screen or cleared.
     * Default `clear`
     * @param {'clear'|'load'} val
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

    get topology(){
        return this.#topology;
    }
    /**
     * To render as Triangles, lines or points.
     * Use class {@link PrimitiveTopology}
     * @param {GPUPrimitiveTopology} val
     */
    set topology(val){
        this.#topology = val;
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
        const nx = getWGSLCoordinate(x, canvas.width);
        const ny = getWGSLCoordinate(y, canvas.height, true);
        const nz = z;
        const nw = getWGSLCoordinate(x + width, canvas.width);
        const nh = getWGSLCoordinate(y + height, canvas.height);
        const { r: r0, g: g0, b: b0, a: a0 } = colors[0];
        const { r: r1, g: g1, b: b1, a: a1 } = colors[1];
        const { r: r2, g: g2, b: b2, a: a2 } = colors[2];
        const { r: r3, g: g3, b: b3, a: a3 } = colors[3];
        const normals = [0, 0, 1];

        const id = this.#meshCounter;
        this.#vertexArray.push(
            +nx, +ny, nz, 1, r0, g0, b0, a0, (+nx + 1) * .5, (+ny + 1) * .5, ...normals, id, // 0 top left
            +nw, +ny, nz, 1, r1, g1, b1, a1, (+nw + 1) * .5, (+ny + 1) * .5, ...normals, id, // 1 top right
            +nw, -nh, nz, 1, r3, g3, b3, a3, (+nw + 1) * .5, (-nh + 1) * .5, ...normals, id, // 2 bottom right
            +nx, +ny, nz, 1, r0, g0, b0, a0, (+nx + 1) * .5, (+ny + 1) * .5, ...normals, id, // 3 top left
            +nx, -nh, nz, 1, r2, g2, b2, a2, (+nx + 1) * .5, (-nh + 1) * .5, ...normals, id, // 4 bottom left
            +nw, -nh, nz, 1, r3, g3, b3, a3, (+nw + 1) * .5, (-nh + 1) * .5, ...normals, id, // 5 bottom right
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

                for (const { position: [vx, vy, vz], uv: [u, v] } of quad) {
                    this.#vertexArray.push(+vx, +vy, +vz, 1, r, g, b, a, u, v, ...normal, id);
                }
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
            [0, 1, 2, 3], // back
            [5, 4, 7, 6], // front
            [4, 0, 3, 7], // left
            [1, 5, 6, 2], // right
            [3, 2, 6, 7], // top
            [4, 5, 1, 0], // bottom
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

            for (const [[vx, vy, vz], [u, v]] of verts) {
                this.#vertexArray.push(+vx, +vy, +vz, 1, r, g, b, a, u, v, ...normals, this.#meshCounter);
            }
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

        // generate vertices
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

        // generate triangles
        for (let lat = 0; lat < rings; lat++) {
            for (let lon = 0; lon < segments; lon++) {
                const v1 = vertexGrid[lat][lon];
                const v2 = vertexGrid[lat + 1][lon];
                const v3 = vertexGrid[lat + 1][lon + 1];
                const v4 = vertexGrid[lat][lon + 1];

                // triangle 1
                this.#vertexArray.push(...v1, ...v2, ...v3);
                // triangle 2
                this.#vertexArray.push(...v1, ...v3, ...v4);
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
                this.#vertexArray.push(vx, vy, vz, 1, r, g, b, a, u, v, nx, ny, nz, this.#meshCounter);
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

        for (const [i0, i1, i2] of indices) {
            for (const i of [i0, i1, i2]) {
                const [vx, vy, vz] = vertices[i];
                const [nx, ny, nz] = normals[i];
                const [u, v] = uvs[i];
                this.#vertexArray.push(vx, vy, vz, 1, r, g, b, a, u, v, nx, ny, nz, this.#meshCounter);
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
            this.#vertexArray.push(+x, +y, +z, 1, r, g, b, 1, u, v, ...normal, this.#meshCounter);
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


}

const vert$8 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv, normal);
}
`;

/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/image
 */

/**
 * Places a texture. The texture being an image loaded from the JS side.
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} aSampler `sampler`
 * @param {vec2f} uv `vec2f`
 * @param {bool} crop `bool`
 * @returns {vec4f}
 *
 * @example
 *
 * // js
 * import { texture } from 'points/image';
 *
 * await points.setTextureImage('image', 'myimage.jpg');
 *
 * // wgsl string
 * ${texture}
 * let value = texture(image, imageSampler, uvr, true);
 */
const texture = /*wgsl*/`
fn texture(texture:texture_2d<f32>, aSampler:sampler, uv:vec2f, crop:bool) -> vec4f {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims:vec2u = textureDimensions(texture, 0);
    let dimsF32 = vec2f(dims);

    let minScreenSize = params.screen.y;
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition =  vec2(0., 1.);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;

    var rgbaImage = textureSample(texture, aSampler, imageUV);

    // e.g. if uv.x < 0. OR uv.y < 0. || uv.x > imageRatio.x OR uv.y > imageRatio.y
    if (crop && (any(uv < vec2(0.0)) || any(uv > imageRatio))) {
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}
`;

/**
 * Places texture in a position
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} aSampler `sampler`
 * @param {vec2f} position `vec2f`
 * @param {vec2f} uv `vec2f`
 * @param {bool} crop `bool`
 * @returns {vec4f}
 *
 * @example
 * // js
 * import { texturePosition } from 'points/image';
 *
 * await points.setTextureImage('image', 'myimage.jpg');
 *
 * // wgsl string
 * ${texturePosition}
 * let value = texturePosition(image, imageSampler, vec2f(), uvr, true);
 */
const texturePosition = /*wgsl*/`
fn texturePosition(texture:texture_2d<f32>, aSampler:sampler, position:vec2f, uv:vec2f, crop:bool) -> vec4f {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture, 0);
    let dimsF32 = vec2f(dims);

    let minScreenSize = params.screen.y;
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + vec2(0., 1.);
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSample(texture, aSampler, imageUV);

    // e.g. if uv.x < 0. OR uv.y < 0. || uv.x > imageRatio.x OR uv.y > imageRatio.y
    if (crop && (any(uv < position) || any(uv > position + imageRatio))) {
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}
`;

/**
 * Increase the aparent pixel size of the texture image using `texturePosition`.
 * This reduces the quality of the image.
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {vec2f} position `vec2f`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2f} uv `vec2f`
 * @returns {vec4f}
 *
 * @example
 * // js
 * import { pixelateTexturePosition } from 'points/image';
 *
 * // wgsl string
 * ${pixelateTexturePosition}
 * let value = pixelateTexturePosition(image, imageSampler, vec2f(), 10,10, uvr);
 */
const pixelateTexturePosition = /*wgsl*/`
fn pixelateTexturePosition(texture:texture_2d<f32>, textureSampler:sampler, position:vec2f, pixelsWidth:f32, pixelsHeight:f32, uv:vec2f) -> vec4f {
    let dx = pixelsWidth * (1. / params.screen.x);
    let dy = pixelsHeight * (1. / params.screen.y);

    let coord = vec2(dx*floor( uv.x / dx), dy * floor( uv.y / dy));

    //texturePosition(texture:texture_2d<f32>, aSampler:sampler, position:vec2f, uv:vec2f, crop:bool) -> vec4f {
    return texturePosition(texture, textureSampler, position, coord, true);
}
`;

const frag$8 = /*wgsl*/`

${texture}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let imageColor = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, uvr, true);
    let finalColor = (imageColor + params.color_color) * params.color_blendAmount;

    return finalColor;
}
`;

const color = new RenderPass$1(vert$8, frag$8, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('color_blendAmount', params.blendAmount || .5);
    points.setUniform('color_color', params.color || [1, .75, .79, 1], 'vec4f');
});
color.required = ['color', 'blendAmount'];
color.name = 'Color';

const vert$7 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv, normal);
}
`;

/**
 * Utilities for animation.
 * <br>
 * Functions that use sine and `params.time` to increase and decrease a value over time.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/animation
 */


/**
 * Animates `sin()` over `params.time` and a provided `speed`.
 * The value is normalized, so in the range 0..1
 * @type {String}
 * @param {f32} speed
 * @example
 * // js
 * import { fnusin } from 'points/animation';
 *
 * // wgsl string
 * ${fnusin}
 * let value = fnusin(2.);
 */
const fnusin = /*wgsl*/`
fn fnusin(speed: f32) -> f32{
    return (sin(params.time * speed) + 1.) * .5;
}
`;

/**
 * A few color constants and wgsl methods to work with colors.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/color
 */


/**
 * WHITE color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { WHITE } from 'points/color';
 *
 * // wgsl string
 * ${WHITE}
 * let value = WHITE * vec4f(.5);
 */
const WHITE = /*wgsl*/`
const WHITE = vec4(1.,1.,1.,1.);
`;

/**
 * Compute the FFT (Fast Fourier Transform)
 * @type {String}
 * @param {f32} input `f32`
 * @param {i32} iterations `i32` 2, two is good
 * @param {f32} intensity `f32` 0..1 a percentage
 * @returns {f32}
 *
 * @example
 * // js
 * import { bloom } from 'points/color';
 *
 * // wgsl string
 * ${bloom}
 * let value = bloom(input, iterations, intensity);
 */
const bloom$1 = /*wgsl*/`
fn bloom(input:f32, iterations:i32, intensity:f32) -> f32 {
    var output = 0.;
    let iterationsF32 = f32(iterations);
    for (var k = 0; k < iterations; k++) {
        let kf32 = f32(k);
        for (var n = 0; n < iterations; n++) {
            let coef = cos(2. * PI * kf32 * f32(n) / iterationsF32 );
            output += input * coef * intensity;
        }
    }
    return output;
}
`;


/**
 * Returns the perceived brightness of a color by the eye.<br>
 * // Standard<br>
 * `LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)`
 * @type {String}
 * @param {vec4f} color
 * @returns {f32}
 * @example
 * // js
 * import { brightness } from 'points/color';
 *
 * // wgsl string
 * ${brightness}
 * let value = brightness(rgba);
 */
const brightness = /*wgsl*/`
fn brightness(color:vec4f) -> f32 {
    // // Standard
    // LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)
    // // Percieved A
    // LuminanceB = (0.299*R + 0.587*G + 0.114*B)
    // // Perceived B, slower to calculate
    // LuminanceC = sqrt(0.299*(R**2) + 0.587*(G**2) + 0.114*(B**2))
    return (0.2126 * color.r) + (0.7152 * color.g) + (0.0722 * color.b);
}
`;

const frag$7 = /*wgsl*/`

${fnusin}
${texturePosition}
${brightness}
${WHITE}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr, true);
    let finalColor:vec4f = brightness(imageColor) * WHITE;

    return finalColor;
}
`;

const grayscale = new RenderPass$1(vert$7, frag$7, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
});
grayscale.name = 'Grayscale';

const vert$6 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv, normal);
}
`;

const frag$6 = /*wgsl*/`

${texturePosition}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr, true);


    // --------- chromatic displacement vector
    let cdv = vec2(params.chromaticAberration_distance, 0.);
    let d = distance(vec2(.5,.5), uvr);
    let imageColorR = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, uvr + cdv * d, true).r;
    let imageColorG = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, uvr, true).g;
    let imageColorB = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, uvr - cdv * d, true).b;

    let finalColor:vec4f = vec4(imageColorR, imageColorG, imageColorB, 1);

    return finalColor;
}
`;

const chromaticAberration = new RenderPass$1(vert$6, frag$6, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('chromaticAberration_distance', params.distance || .02);
});
chromaticAberration.required = ['distance'];
chromaticAberration.name = 'Chromatic Aberration';

const vert$5 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv, normal);
}
`;

const frag$5 = /*wgsl*/`

${texturePosition}
${pixelateTexturePosition}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {


    let pixelatedColor = pixelateTexturePosition(
        renderpass_feedbackTexture,
        renderpass_feedbackSampler,
        vec2(0.),
        params.pixelate_pixelDims.x,
        params.pixelate_pixelDims.y,
        uvr
    );

    let finalColor:vec4f = pixelatedColor;

    return finalColor;
}
`;

const pixelate = new RenderPass$1(vert$5, frag$5, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('pixelate_pixelDims', params.pixelDimensions || [10, 10], 'vec2f');
});
pixelate.required = ['pixelDimensions'];
pixelate.name = 'Pixelate';

const vert$4 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv, normal);
}
`;

/**
 * Math utils
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/math
 */

/**
 * PI is the ratio of a circle's circumference to its diameter.
 *
 * @see https://en.wikipedia.org/wiki/Pi
 *
 * @example
 * // js
 * import { PI } from 'points/math';
 *
 * // wgsl string
 * ${PI}
 * let value = PI * 3;
 */
const PI = /*wgsl*/`const PI = 3.14159265;`;

/**
 * Using polar coordinates, calculates the final point as `vec2f`
 * @type {String}
 * @param {f32} distance distance from origin
 * @param {f32} radians Angle in radians
 *
 * @example
 * // js
 * import { polar } from 'points/math';
 *
 * // wgsl string
 * ${polar}
 * let value = polar(distance, radians);
 */
const polar = /*wgsl*/`
fn polar(distance: f32, radians: f32) -> vec2f {
    return vec2f(distance * cos(radians), distance * sin(radians));
}
`;

/**
 * Rotates a vector an amount of radians
 * @type {String}
 * @param {vec2f} p vector to rotate
 * @param {f32} rads angle in radians
 *
 * @example
 * // js
 * import { rotateVector } from 'points/math';
 *
 * // wgsl string
 * ${rotateVector}
 * let value = rotateVector(position, radians);
 */
const rotateVector = /*wgsl*/`
fn rotateVector(p:vec2f, rads:f32 ) -> vec2f {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.y * s;
    let ynew = p.x * s + p.y * c;
    return vec2(xnew, ynew);
}
`;

/**
 * original: Author : Ian McEwan, Ashima Arts.
 * https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/noise2d
 */

/**
 * Sinplex Noise function
 * @type {String}
 * @param {vec2f} v usually the uv
 * @returns {f32}
 *
 * @example
 * // js
 * import { snoise } from 'points/noise2d';
 *
 * // wgsl string
 * ${snoise}
 * let value = snoise(uv);
 */

const snoise = /*wgsl*/`

fn mod289_v3(x: vec3f) -> vec3f {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289_v2(x: vec2f) -> vec2f {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn permute(x: vec3f) -> vec3f {
    return mod289_v3(((x*34.0)+10.0)*x);
}

fn snoise(v:vec2f) -> f32 {
    let C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    // First corner
    var i  = floor(v + dot(v, C.yy) );
    var x0 = v -   i + dot(i, C.xx);

    // Other corners
    var i1 = vec2(0.);
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    //i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    if(x0.x > x0.y){ i1 = vec2(1.0, 0.0); }else{ i1 = vec2(0.0, 1.0); }
    //x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    var x12 = x0.xyxy + C.xxzz;
    //x12.xy -= i1;
    x12 = vec4(x12.xy - i1, x12.zw); // ?? fix

    // Permutations
    i = mod289_v2(i); // Avoid truncation effects in permutation
    let p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));

    var m = max(vec3(0.5) - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), vec3(0.0));
    m = m*m ;
    m = m*m ;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

    let x = 2.0 * fract(p * C.www) - 1.0;
    let h = abs(x) - 0.5;
    let ox = floor(x + 0.5);
    let a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    // Compute final noise value at P
    var g = vec3(0.);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    //g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    g = vec3(g.x,a0.yz * x12.xz + h.yz * x12.yw);
    return 130.0 * dot(m, g);
  }
`;

// https://www.geeks3d.com/20140213/glsl-shader-library-fish-eye-and-dome-and-barrel-distortion-post-processing-filters/

const frag$4 = /*wgsl*/`

${texture}
${rotateVector}
${snoise}
${PI}
${WHITE}
${polar}

fn angle(p1:vec2f, p2:vec2f) -> f32 {
    let d = p1 - p2;
    return abs(atan2(d.y, d.x)) / PI;
}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let imagePosition = vec2(0.0,0.0) * ratio;
    let center = vec2(.5,.5) * ratio;
    let d = distance(center, uvr); // sqrt(dot(d, d));

    //vector from center to current fragment
    let vectorToCenter = uvr - center;
    let sqrtDotCenter = sqrt(dot(center, center));

    //amount of effect
    let power =  2.0 * PI / (2.0 * sqrtDotCenter )  * (params.lensDistortion_amount - 0.5);
    //radius of 1:1 effect
    var bind = .0;
    if (power > 0.0){
        //stick to corners
        bind = sqrtDotCenter;
    } else {
        //stick to borders
        if (ratio.x < 1.0) {
            bind = center.x;
        } else {
            bind = center.y;
        };
    }

    //Weird formulas
    var nuv = uvr;
    if (power > 0.0){//fisheye
        nuv = center + normalize(vectorToCenter) * tan(d * power) * bind / tan( bind * power);
    } else if (power < 0.0){//antifisheye
        nuv = center + normalize(vectorToCenter) * atan(d * -power * 10.0) * bind / atan(-power * bind * 10.0);
    } else {
        nuv = uvr;
    }

    // let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, imagePosition, nuv, false);


    // Chromatic Aberration --
    // --------- chromatic displacement vector
    let cdv = vec2(params.lensDistortion_distance, 0.);
    // let dis = distance(vec2(.5,.5), uvr);
    let imageColorR = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, nuv + cdv * params.lensDistortion_amount , true).r;
    let imageColorG = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, nuv, true).g;
    let imageColorB = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, nuv - cdv * params.lensDistortion_amount , true).b;

    let chromaticAberration:vec4f = vec4(imageColorR, imageColorG, imageColorB, 1);
    // -- Chromatic Aberration


    let finalColor = chromaticAberration;
    // let finalColor = vec4(nuv,0,1) * WHITE;

    return finalColor;
}
`;

const lensDistortion = new RenderPass$1(vert$4, frag$4, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('lensDistortion_amount', params.amount || .4);
    points.setUniform('lensDistortion_distance', params.distance || .01);
});
lensDistortion.required = ['amount', 'distance'];
lensDistortion.name = 'Lens Distortion';

const vert$3 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv, normal);
}
`;

/**
 * Various random functions.
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/random
 */


/**
 * Random number that returns a `vec2f`.<br>
 * You have to set the `rand_seed` before calling `rand()`.
 * @type {String}
 * @return {f32} equivalent to `rand_seed.y` and `rand_seed` is the result.
 *
 * @example
 * // js
 * import { rand } from 'points/random';
 * rand_seed.x = .01835255;
 *
 * // wgsl string
 * ${rand}
 * let value = rand();
 */
const rand = /*wgsl*/`
var<private> rand_seed : vec2f;

fn rand() -> f32 {
    rand_seed.x = fract(cos(dot(rand_seed, vec2f(23.14077926, 232.61690225))) * 136.8168);
    rand_seed.y = fract(cos(dot(rand_seed, vec2f(54.47856553, 345.84153136))) * 534.7645);
    return rand_seed.y;
}
`;

const frag$3 = /*wgsl*/`

${texture}
${rand}
${snoise}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let imageColor = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, uvr, true);

    rand_seed = uvr + params.time;

    let noise = rand() * .5 + .5;
    return (imageColor + imageColor * noise)  * .5;
}
`;

const filmgrain = new RenderPass$1(vert$3, frag$3, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
});
filmgrain.name = 'Filmgrain';

const vert$2 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv, normal);
}
`;

const frag$2 = /*wgsl*/`

${texturePosition}
${bloom$1}
${brightness}
${PI}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let startPosition = vec2(0.,0.);
    let rgbaImage = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, startPosition, uvr, false); //* .998046;

    let input = brightness(rgbaImage);
    let bloomVal = bloom(input, i32(params.bloom_iterations), params.bloom_amount);
    let rgbaBloom = vec4(bloomVal);

    let finalColor:vec4f = rgbaImage + rgbaBloom;

    return finalColor;
}
`;

const bloom = new RenderPass$1(vert$2, frag$2, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('bloom_amount', params.amount || .5);
    points.setUniform('bloom_iterations', params.iterations || 2);
});
bloom.required = ['amount', 'iterations'];
bloom.name = 'Bloom';

const vert$1 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv, normal);
}
`;

/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/effects
 */


/**
 * Applies a blur to an image
 * <br>
 * based on https://github.com/Jam3/glsl-fast-gaussian-blur/blob/master/9.glsl
 *
 * @param {texture_2d} image
 * @param {sampler} imageSampler
 * @param {vec2f} position
 * @param {vec2f} uv
 * @param {vec2f} resolution
 * @param {vec2f} direction
 *
 * @example
 * // js
 * import { blur9 } from 'points/effects';
 *
 * // wgsl string
 * ${blur9}
 * let value = blur9(image, imageSampler, position, uv, resolution, direction);
 */
const blur9 = /*wgsl*/`
fn blur9(image: texture_2d<f32>, imageSampler:sampler, position:vec2f, uv:vec2f, resolution: vec2f, direction: vec2f) -> vec4f {
    var color = vec4(0.0);
    let off1 = vec2(1.3846153846) * direction;
    let off2 = vec2(3.2307692308) * direction;
    color += texturePosition(image, imageSampler, position, uv, true) * 0.2270270270;
    color += texturePosition(image, imageSampler, position, uv + (off1 / resolution), true) * 0.3162162162;
    color += texturePosition(image, imageSampler, position, uv - (off1 / resolution), true) * 0.3162162162;
    color += texturePosition(image, imageSampler, position, uv + (off2 / resolution), true) * 0.0702702703;
    color += texturePosition(image, imageSampler, position, uv - (off2 / resolution), true) * 0.0702702703;
    return color;
}
`;

/**
 * WIP
 */
// export const blur8 = /*wgsl*/`
// fn blur8(color:vec4f, colorsAround:array<vec4f, 8>, amount:f32) -> {

// }
// `;

const frag$1 = /*wgsl*/`

${texturePosition}
${PI}
${rotateVector}
${blur9}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    return blur9(
        renderpass_feedbackTexture,
        renderpass_feedbackSampler,
        vec2(),
        uvr,
        params.blur_resolution, // resolution
        rotateVector(params.blur_direction, params.blur_radians) // direction
    );

}
`;

const blur = new RenderPass$1(vert$1, frag$1, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('blur_resolution', params.resolution || [50, 50], 'vec2f');
    points.setUniform('blur_direction', params.direction || [.4, .4], 'vec2f');
    points.setUniform('blur_radians', params.radians || 0);
});
blur.required = ['resolution', 'direction', 'radians'];
blur.name = 'Blur';

const vert = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv, normal);
}
`;

const frag = /*wgsl*/`

${texturePosition}
${snoise}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let scale = params.waves_scale;
    let intensity = params.waves_intensity;
    let n1 = (snoise(uv / scale + vec2(.03, .4) * params.time) * .5 + .5) * intensity;
    let n2 = (snoise(uv / scale + vec2(.3, .02) * params.time) * .5 + .5) * intensity;
    let n = n1 + n2;

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr + n2, true);
    let finalColor:vec4f = imageColor;

    return finalColor;
}
`;

const waves = new RenderPass$1(vert, frag, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('waves_scale', params.scale || .45);
    points.setUniform('waves_intensity', params.intensity || .03);
});
waves.required = ['scale', 'intensity'];
waves.name = 'Waves';

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
class RenderPasses {
    /**
     * Apply a color {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.COLOR, { color: [.5, 1, 0, 1], blendAmount: .5 });
     */
    static COLOR = color;
    /**
     * Apply a grayscale {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.GRAYSCALE);
     */
    static GRAYSCALE = grayscale;
    /**
     * Apply a chromatic aberration {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.CHROMATIC_ABERRATION, { distance: .02 });
     */
    static CHROMATIC_ABERRATION = chromaticAberration;
    /**
     * Apply a pixelation {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.PIXELATE);
     */
    static PIXELATE = pixelate;
    /**
     * Apply a lens distortion {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.LENS_DISTORTION);
     */
    static LENS_DISTORTION = lensDistortion;
    /**
     * Apply a film grain {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.FILM_GRAIN);
     */
    static FILM_GRAIN = filmgrain;
    /**
     * Apply a bloom {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.BLOOM);
     */
    static BLOOM = bloom;
    /**
     * Apply a blur {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.BLUR, { resolution: [100, 100], direction: [.4, 0], radians: 0 });
     */
    static BLUR = blur;
    /**
     * Apply a waives noise {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.WAVES, { scale: .05 });
     */
    static WAVES = waves;
}

/**
 * Collection of Keys used for the default uniforms
 * assigned in the {@link Points} class.
 * This is mainly for internal purposes.
 * @class UniformKeys
 * @ignore
 */
class UniformKeys {
    /**
     * To set the time in milliseconds
     * @type {string}
     * @static
     */
    static TIME = 'time';
    /**
     * To set the time after the last frame
     * @type {string}
     * @static
     */
    static DELTA = 'delta';
    /**
     * To set the current date and time in seconds
     * @type {string}
     * @static
     */
    static EPOCH = 'epoch';
    /**
     * To set screen dimensions
     * @type {string}
     * @static
     */
    static SCREEN = 'screen';
    /**
     * To set mouse coordinates
     * @type {string}
     * @static
     */
    static MOUSE = 'mouse';
    /**
     * To set if the mouse has been clicked.
     * @type {string}
     * @static
     */
    static MOUSE_CLICK = 'mouseClick';
    /**
     * To set if the mouse is down.
     * @type {string}
     * @static
     */
    static MOUSE_DOWN = 'mouseDown';
    /**
     * To set if the wheel is moving.
     * @type {string}
     * @static
     */
    static MOUSE_WHEEL = 'mouseWheel';
    /**
     * To set how much the wheel has moved.
     * @type {string}
     * @static
     */
    static MOUSE_DELTA = 'mouseDelta';
}

/**
 * Along with the vertexArray it calculates some info like offsets required for the pipeline.
 * Internal use.
 * @ignore
 */
class VertexBufferInfo {
    #vertexSize
    #vertexOffset;
    #colorOffset;
    #uvOffset;
    #normalOffset;
    #idOffset;
    #vertexCount;
    /**
     * Along with the vertexArray it calculates some info like offsets required for the pipeline.
     * @param {Float32Array} vertexArray array with vertex, color and uv data
     * @param {Number} triangleDataLength how many items does a triangle row has in vertexArray
     * @param {Number} vertexOffset index where the vertex data starts in a row of `triangleDataLength` items
     * @param {Number} colorOffset index where the color data starts in a row of `triangleDataLength` items
     * @param {Number} uvOffset index where the uv data starts in a row of `triangleDataLength` items
     */
    constructor(vertexArray, triangleDataLength = 14, vertexOffset = 0, colorOffset = 4, uvOffset = 8, normalsOffset = 10, idOffset = 13) {
        this.#vertexSize = vertexArray.BYTES_PER_ELEMENT * triangleDataLength; // Byte size of ONE triangle data (vertex, color, uv). (one row)
        this.#vertexOffset = vertexArray.BYTES_PER_ELEMENT * vertexOffset;
        this.#colorOffset = vertexArray.BYTES_PER_ELEMENT * colorOffset; // Byte offset of triangle vertex color attribute.
        this.#uvOffset = vertexArray.BYTES_PER_ELEMENT * uvOffset;
        this.#normalOffset = vertexArray.BYTES_PER_ELEMENT * normalsOffset;
        this.#idOffset = vertexArray.BYTES_PER_ELEMENT * idOffset;
        this.#vertexCount = vertexArray.byteLength / this.#vertexSize;
    }

    get vertexSize() {
        return this.#vertexSize;
    }

    get vertexOffset() {
        return this.#vertexOffset;
    }

    get colorOffset() {
        return this.#colorOffset;
    }

    get uvOffset() {
        return this.#uvOffset;
    }

    get normalOffset() {
        return this.#normalOffset;
    }

    get idOffset() {
        return this.#idOffset;
    }

    get vertexCount() {
        return this.#vertexCount;
    }
}

class Coordinate {
    #x;
    #y;
    #z;
    #value;
    constructor(x = 0, y = 0, z = 0) {
        this.#x = x;
        this.#y = y;
        this.#z = z;
        this.#value = [x, y, z];
    }

    set x(value) {
        this.#x = value;
        this.#value[0] = value;
    }

    set y(value) {
        this.#y = value;
        this.#value[1] = value;
    }

    set z(value) {
        this.#z = value;
        this.#value[2] = value;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get z() {
        return this.#z;
    }

    get value() {
        return this.#value;
    }

    set(x, y, z) {
        this.#x = x;
        this.#y = y;
        this.#z = z;
        this.#value[0] = x;
        this.#value[1] = y;
        this.#value[2] = z;
    }
}

/**
 * @class RGBAColor
 * @ignore
 */
class RGBAColor {
    #value;
    constructor(r = 0, g = 0, b = 0, a = 1) {
        if (r > 1 && g > 1 && b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
            if (a > 1) {
                a /= 255;
            }
        }
        this.#value = [r, g, b, a];
    }

    set r(value) {
        this.#value[0] = value;
    }

    set g(value) {
        this.#value[1] = value;
    }

    set b(value) {
        this.#value[2] = value;
    }

    set a(value) {
        this.#value[3] = value;
    }

    get r() {
        return this.#value[0];
    }

    get g() {
        return this.#value[1];
    }

    get b() {
        return this.#value[2];
    }

    get a() {
        return this.#value[3];
    }

    get value() {
        return this.#value;
    }

    get brightness() {
        // #Standard
        // LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)
        // #Percieved A
        // LuminanceB = (0.299*R + 0.587*G + 0.114*B)
        // #Perceived B, slower to calculate
        // LuminanceC = sqrt(0.299*(R**2) + 0.587*(G**2) + 0.114*(B**2))


        let [r, g, b, a] = this.#value;
        return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
    }

    set brightness(value) {
        this.#value = [value, value, value, 1];
    }

    set(r, g, b, a) {
        this.#value = [r, g, b, a];
    }

    setColor(color) {
        this.#value = [color.r, color.g, color.b, color.a];
    }

    add(color) {
        let [r, g, b, a] = this.#value;
        //this.#value = [(r + color.r)/2, (g + color.g)/2, (b + color.b)/2, (a + color.a)/2];
        //this.#value = [(r*a + color.r*color.a), (g*a + color.g*color.a), (b*a + color.b*color.a), 1];
        this.#value = [(r + color.r), (g + color.g), (b + color.b), (a + color.a)];


    }

    blend(color) {
        let [r0, g0, b0, a0] = this.#value;
        let [r1, b1, g1, a1] = color.value;

        let a01 = (1 - a0) * a1 + a0;

        let r01 = ((1 - a0) * a1 * r1 + a0 * r0) / a01;

        let g01 = ((1 - a0) * a1 * g1 + a0 * g0) / a01;

        let b01 = ((1 - a0) * a1 * b1 + a0 * b0) / a01;

        this.#value = [r01, g01, b01, a01];
    }


    additive(color) {
        // https://gist.github.com/JordanDelcros/518396da1c13f75ee057
        let base = this.#value;
        let added = color.value;

        let mix = [];
        mix[3] = 1 - (1 - added[3]) * (1 - base[3]); // alpha
        mix[0] = Math.round((added[0] * added[3] / mix[3]) + (base[0] * base[3] * (1 - added[3]) / mix[3])); // red
        mix[1] = Math.round((added[1] * added[3] / mix[3]) + (base[1] * base[3] * (1 - added[3]) / mix[3])); // green
        mix[2] = Math.round((added[2] * added[3] / mix[3]) + (base[2] * base[3] * (1 - added[3]) / mix[3])); // blue

        this.#value = mix;
    }

    equal(color) {
        return (this.#value[0] == color.r) && (this.#value[1] == color.g) && (this.#value[2] == color.b) && (this.#value[3] == color.a);
    }


    static average(colors) {
        // https://sighack.com/post/averaging-rgb-colors-the-right-way
        let r = 0, g = 0, b = 0;
        for (let index = 0; index < colors.length; index++) {
            const color = colors[index];
            //if (!color.isNull()) {
                r += color.r * color.r;
                g += color.g * color.g;
                b += color.b * color.b;
                //a += color.a * color.a;
            //}
        }
        return new RGBAColor(
            Math.sqrt(r / colors.length),
            Math.sqrt(g / colors.length),
            Math.sqrt(b / colors.length)
            //Math.sqrt(a),
        );
    }

    static difference(c1, c2) {
        let r = 0;
        let g = 0;
        let b = 0;
        if(c1 && !c1.isNull() && c2 && !c2.isNull()){
            const { r: r1, g: g1, b: b1 } = c1;
            const { r: r2, g: g2, b: b2 } = c2;
            r = r1 - r2;
            g = g1 - g2;
            b = b1 - b2;
        }

        return new RGBAColor(r, g, b);
    }

    isNull() {
        const [r, g, b, a] = this.#value;
        return !(isNaN(r) && isNaN(g) && isNaN(b) && isNaN(a))
    }

    static colorRGBEuclideanDistance(c1, c2) {
        return Math.sqrt(Math.pow(c1.r - c2.r, 2) +
            Math.pow(c1.g - c2.g, 2) +
            Math.pow(c1.b - c2.b, 2));
    }

    /**
     * Checks how close two colors are. Closest is `0`.
     * @param {RGBAColor} color : Color to check distance;
     * @returns Number distace up to `1.42` I think...
     */
    euclideanDistance(color) {
        const [r, g, b] = this.#value;
        return Math.sqrt(Math.pow(r - color.r, 2) +
            Math.pow(g - color.g, 2) +
            Math.pow(b - color.b, 2));
    }

    static getClosestColorInPalette(color, palette) {
        if(!palette){
            throw('Palette should be an array of `RGBA`s')
        }
        let distance = 100;
        let selectedColor = null;
        palette.forEach(paletteColor => {
            let currentDistance = color.euclideanDistance(paletteColor);
            if (currentDistance < distance) {
                selectedColor = paletteColor;
                distance = currentDistance;
            }
        });
        return selectedColor;
    }
}

/**
 * To manage time and delta time,
 * based on https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js
 * @class Clock
 * @ignore
 */
class Clock {
    #time = 0;
    #oldTime = 0;
    #delta = 0;
    constructor() {

    }

    /**
     * Gets the current time, it does not calculate the time, it's calcualted
     *  when `getDelta()` is called.
     */
    get time() {
        return this.#time;
    }

    /**
     * Gets the last delta value, it does not calculate the delta, use `getDelta()`
     */
    get delta() {
        return this.#delta;
    }

    #now() {
        return (typeof performance === 'undefined' ? Date : performance).now();
    }

    /**
     * Calculate time since last frame
     * It also calculates `time`
     */
    getDelta() {
        this.#delta = 0;
        const newTime = this.#now();
        this.#delta = (newTime - this.#oldTime) / 1000;
        this.#oldTime = newTime;
        this.#time += this.#delta;
        return this.#delta;
    }
}

/**
 * The defaultStructs are structs already incorporated onto the shaders you create,
 * so you can call them without import.
 * <br>
 * Fragment, Sound, and Event structs.
 * <br>
 * <br>
 * Fragment used in Vertex Shaders.<br>
 * Sound used along with {@link Points#setAudio}<br>
 * Event used along with {@link Points#addEventListener}<br>
 * @module defaultStructs
 */

const defaultStructs = /*wgsl*/`

struct Fragment {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,
    @location(3) uvr: vec2f,
    @location(4) mouse: vec2f,
    @location(5) normal: vec3f,
    @interpolate(flat) @location(6) id: u32
}

struct Sound {
    data: array<f32, 2048>,
    //play
    //dataLength
    //duration
    //currentPosition
}

struct Event {
    updated: u32,
    // data: array<f32>
}
`;

/**
 * The defaultFunctions are functions already incorporated onto the shaders you create,
 * so you can call them without import.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 *
 * Use the base example as reference: examples/base/vert.js
 * @module defaultFunctions
 */

/**
 * The defaultVertexBody is used as a drop-in replacement of the vertex shader content.
 * <br>
 * This is not required, but useful if you plan to use the default parameters of the library.
 * <br>
 * All the examples in the examples directory use this function in their vert.js file.
 * <br>
 * <br>
 * Default function for the Vertex shader that takes charge of automating the
 * creation of a few variables that are commonly used.
 * @example
 * // Inside the main vertex function add this
 * return defaultVertexBody(position, color, uv, normal);
 * @type {string}
 * @param {vec4f} position
 * @param {vec4f} color
 * @param {vec2f} uv
 * @return {Fragment}
 */
const defaultVertexBody = /*wgsl*/`
fn defaultVertexBody(position: vec4f, color: vec4f, uv: vec2f, normal: vec3f) -> Fragment {
    var result: Fragment;

    let ratioX = params.screen.x / params.screen.y;
    let ratioY = 1. / ratioX / (params.screen.y / params.screen.x);
    result.ratio = vec2(ratioX, ratioY);
    result.position = position;
    result.color = color;
    result.uv = uv;
    result.uvr = vec2(uv.x * result.ratio.x, uv.y);
    result.mouse = vec2(params.mouse.x / params.screen.x, params.mouse.y / params.screen.y);
    result.mouse = result.mouse * vec2(1.,-1.) - vec2(0., -1.); // flip and move up
    result.normal = normal;

    return result;
}
`;

/**
 * Utility types and methods to set wgsl types in memory.
 * This is mainly internal.
 * @module data-size
 * @ignore
 */

const size_2_align_2 = { size: 2, align: 2 };
const size_4_align_4 = { size: 4, align: 4 };
const size_8_align_8 = { size: 8, align: 8 };
const size_12_align_16 = { size: 12, align: 16 };
const size_16_align_16 = { size: 16, align: 16 };
const size_16_align_8 = { size: 16, align: 8 };
const size_32_align_8 = { size: 32, align: 8 };
const size_24_align_16 = { size: 24, align: 16 };
const size_48_align_16 = { size: 48, align: 16 };
const size_32_align_16 = { size: 32, align: 16 };
const size_64_align_16 = { size: 64, align: 16 };

const typeSizes = {
    'bool': size_4_align_4,
    'f32': size_4_align_4,
    'i32': size_4_align_4,
    'u32': size_4_align_4,

    'f16': size_2_align_2,

    'vec2<bool>': size_8_align_8,
    'vec2<f32>': size_8_align_8,
    'vec2<i32>': size_8_align_8,
    'vec2<u32>': size_8_align_8,

    // 'vec2<bool>': size_8_align_8,
    'vec2f': size_8_align_8,
    'vec2i': size_8_align_8,
    'vec2u': size_8_align_8,

    'vec3<bool>': size_12_align_16,
    'vec3<f32>': size_12_align_16,
    'vec3<i32>': size_12_align_16,
    'vec3<u32>': size_12_align_16,

    // 'vec3<bool>': size_12_align_16,
    'vec3f': size_12_align_16,
    'vec3i': size_12_align_16,
    'vec3u': size_12_align_16,

    'vec4<bool>': size_16_align_16,
    'vec4<f32>': size_16_align_16,
    'vec4<i32>': size_16_align_16,
    'vec4<u32>': size_16_align_16,
    'mat2x2<f32>': size_16_align_8,
    'mat2x3<f32>': size_32_align_8,
    'mat2x4<f32>': size_32_align_8,
    'mat3x2<f32>': size_24_align_16,
    'mat3x3<f32>': size_48_align_16,
    'mat3x4<f32>': size_48_align_16,
    'mat4x2<f32>': size_32_align_16,
    'mat4x3<f32>': size_64_align_16,
    'mat4x4<f32>': size_64_align_16,

    // 'vec4<bool>': size_16_align_16,
    'vec4f': size_16_align_16,
    'vec4i': size_16_align_16,
    'vec4u': size_16_align_16,
    'mat2x2f': size_16_align_8,
    'mat2x3f': size_32_align_8,
    'mat2x4f': size_32_align_8,
    'mat3x2f': size_24_align_16,
    'mat3x3f': size_48_align_16,
    'mat3x4f': size_48_align_16,
    'mat4x2f': size_32_align_16,
    'mat4x3f': size_64_align_16,
    'mat4x4f': size_64_align_16,

    'atomic<u32>': size_4_align_4,
    'atomic<i32>': size_4_align_4,
};


// ignore comments
const removeCommentsRE = /^(?:(?!\/\/|\/*.*\/).|\n)+/gim;

// struct name:
const getStructNameRE = /struct\s+?(\w+)\s*{[^}]+}\n?/g;

// what's inside a struct:
const insideStructRE = /struct\s+?\w+\s*{([^}]+)}\n?/g;

const arrayTypeAndAmountRE = /\s*<\s*([^,]+)\s*,?\s*(\d+)?\s*>/g;

const arrayIntegrityRE = /\s*(array\s*<\s*\w+\s*(?:,\s*\d+)?\s*>)\s*,?/g;

// you have to separete the result by splitting new lines

function removeComments(value) {
    const matches = value.matchAll(removeCommentsRE);
    let result = '';
    for (const match of matches) {
        const captured = match[0];
        result += captured;
    }
    return result;
}

function getInsideStruct(value) {
    const matches = value.matchAll(insideStructRE);
    let lines = null;
    for (const match of matches) {
        lines = match[1].split('\n');
        lines = lines.map(element => element.trim())
            .filter(e => e !== '');
    }
    return lines;
}

function getStructDataByName(value) {
    const matches = value.matchAll(getStructNameRE);
    let result = new Map();
    for (const match of matches) {
        const captured = match[0];
        const name = match[1];
        const lines = getInsideStruct(captured);
        const types = lines.map(l => {
            const right = l.split(':')[1];
            let type = '';
            if (isArray(right)) {
                const arrayMatch = right.matchAll(arrayIntegrityRE);
                type = arrayMatch.next().value[1];
            } else {
                type = right.split(',')[0].trim();
            }
            return type;
        });

        const names = lines.map(l => {
            const left = l.split(':')[0];
            let name = '';
            name = left.split(',')[0].trim();
            return name;
        });

        result.set(name, {
            captured,
            lines,
            types,
            unique_types: [...new Set(types)],
            names,
        });
    }
    return result;
}

function getArrayTypeAndAmount(value) {
    const matches = value.matchAll(arrayTypeAndAmountRE);
    let result = [];
    for (const match of matches) {
        const type = match[1];
        const amount = match[2];
        result.push({ type, amount: Number(amount) });
    }
    return result;
}

function getPadding(bytes, aligment, nextTypeDataSize) {
    const nextMultiple = (bytes + aligment - 1) & ~(aligment - 1);
    const needsPadding = (bytes + nextTypeDataSize) > nextMultiple;
    let padAmount = 0;
    if (needsPadding) {
        padAmount = nextMultiple - bytes;
    }
    return padAmount;
}

/**
 * Check if string has 'array' in it
 * @param {String} value
 * @returns {boolean}
 */
function isArray(value) {
    return value.indexOf('array') != -1;
}

function getArrayAlign(structName, structData) {
    const [d] = getArrayTypeAndAmount(structName);
    const t = typeSizes[d.type] || structData.get(d.type);
    if (!t) {
        throw new Error(`${d.type} type has not been declared previously`)
    }

    // if it's not in typeSizes is a struct,
    //therefore probably stored in structData
    return t.align || t.maxAlign;
}

function getArrayTypeData(currentType, structData) {
    const [d] = getArrayTypeAndAmount(currentType);
    if(!d){
        throw `${currentType} seems to have an error, maybe a wrong amount?`;
    }
    if (d.amount == 0) {
        throw new Error(`${currentType} has an amount of 0`);
    }
    // if is an array with no amount then use these default values
    let currentTypeData = { size: 16, align: 16 };
    if (!!d.amount) {
        const t = typeSizes[d.type];
        if (t) {
            // if array, the size is equal to the align
            currentTypeData = { size: t.align * d.amount, align: t.align };
            // currentTypeData = { size: t.size * d.amount, align: t.align };
            // currentTypeData = { size: 0, align: 0 };
        } else {
            const sd = structData.get(d.type);
            if (sd) {
                currentTypeData = { size: sd.bytes * d.amount, align: sd.maxAlign };
            }
        }
    } else {
        const t = typeSizes[d.type] || structData.get(d.type);
        currentTypeData = { size: t.size || t.bytes, align: t.maxAlign };
    }
    return currentTypeData;
}

const dataSize = value => {
    const noCommentsValue = removeComments(value);
    const structData = getStructDataByName(noCommentsValue);

    for (const [structDatumKey, structDatum] of structData) {
        // to obtain the higher max alignment, but this can be also calculated
        // in the next step
        structDatum.unique_types.forEach(ut => {
            let maxAlign = structDatum.maxAlign || 0;
            let align = 0;
            // if it doesn't exists in typeSizes is an Array or a new Struct
            if (!typeSizes[ut]) {
                if (isArray(ut)) {
                    align = getArrayAlign(ut, structData);
                } else {
                    const sd = structData.get(ut);
                    align = sd.maxAlign;
                }
            } else {
                align = typeSizes[ut].align;
            }
            maxAlign = align > maxAlign ? align : maxAlign;
            structDatum.maxAlign = maxAlign;
        });

        let byteCounter = 0;
        structDatum.types.forEach((t, i) => {
            const name = structDatum.names[i];
            const currentType = t;
            const nextType = structDatum.types[i + 1];
            let currentTypeData = typeSizes[currentType];
            let nextTypeData = typeSizes[nextType];

            structDatum.paddings = structDatum.paddings || {};

            // if currentTypeData or nextTypeData have no data it means
            // it's a struct or an array
            // if it's a struct the data is already saved in structData
            // because it was calculated previously
            // assuming the struct was declared previously
            if (!currentTypeData) {
                if (currentType) {
                    if (isArray(currentType)) {
                        currentTypeData = getArrayTypeData(currentType, structData);
                    } else {
                        const sd = structData.get(currentType);
                        if (sd) {
                            currentTypeData = { size: sd.bytes, align: sd.maxAlign };
                        }
                    }
                }
            }
            // read above
            if (!nextTypeData) {
                if (nextType) {
                    if (isArray(nextType)) {
                        nextTypeData = getArrayTypeData(nextType, structData);
                    } else {
                        const sd = structData.get(nextType);
                        if (sd) {
                            nextTypeData = { size: sd.bytes, align: sd.maxAlign };
                        }
                    }
                }
            }

            if (!!currentTypeData) {
                byteCounter += currentTypeData.size;
                if ((currentTypeData.size === structDatum.maxAlign) || !nextType) {
                    return;
                }
            }

            if (!!nextTypeData) {
                const padAmount = getPadding(byteCounter, structDatum.maxAlign, nextTypeData.size);
                if (padAmount) {
                    structDatum.paddings[name] = padAmount / 4;
                    byteCounter += padAmount;
                }
            }
        });

        const padAmount = getPadding(byteCounter, structDatum.maxAlign, 16);
        if (padAmount) {
            structDatum.paddings[''] = padAmount / 4;
            byteCounter += padAmount;
        }

        structDatum.bytes = byteCounter;
    }
    return structData;
};

/**
 * Utility methods to for the {@link Points#setTextureString | setTextureString()}
 * @module texture-string
 * @ignore
 */

/**
 * Method to load image with await
 * @param {String} src
 * @returns {Promise<void>}
 */
async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = err => reject(err);
    });
}

/**
 * Returns UTF-16 array of each char
 * @param {String} s
 * @returns {Array<Number>}
 */
function strToCodes(s) {
    return Array.from(s).map(c => c.charCodeAt(0))
}

/**
 *
 * @param {HTMLImageElement} atlas Image atlas to parse
 * @param {CanvasRenderingContext2D} ctx Canvas context
 * @param {Number} index index in the atlas, so 0 is the first char
 * @param {{x: number, y: number}} size cell dimensions
 * @param {Number} finalIndex final positional index in the canvas
 */
function sprite(atlas, ctx, index, size, finalIndex) {
    const { width } = atlas;
    const numColumns = width / size.x;

    const x = index % numColumns;
    const y = Math.floor(index / numColumns);

    ctx.drawImage(
        atlas,
        x * size.x,
        y * size.y,
        size.x,
        size.y,

        size.x * finalIndex,
        0,

        size.x,
        size.y);
}

/**
 * @typedef {number} SignedNumber
 * A numeric value that may be negative or positive.
 */

/**
 * Expects an atlas/spritesheed with chars in UTF-16 order.
 * This means `A` is expected at index `65`; if not there,
 * use offset to move backwards (negative) or forward (positive)
 * @param {String} str String used to extract letters from the image
 * @param {HTMLImageElement} atlasImg image with the Atlas to extract letters from
 * @param {{x: number, y: number}} size width and height in pixels of each letter
 * @param {SignedNumber} offset how many chars is the atlas offset from the UTF-16
 * @returns {string} Base64 image
 */
function strToImage(str, atlasImg, size, offset = 0) {
    const chars = strToCodes(str);
    const canvas = document.createElement('canvas');
    canvas.width = chars.length * size.x;
    canvas.height = size.y;
    const ctx = canvas.getContext('2d');

    chars.forEach((c, i) => sprite(atlasImg, ctx, c + offset, size, i));
    return canvas.toDataURL('image/png');
}

/**
 * @class LayersArray
 * @ignore
 */
class LayersArray extends Array {
    #buffer = null;
    #shaderType = null;
    constructor(...elements) {
        super(...elements);
    }

    get buffer() {
        return this.#buffer;
    }

    set buffer(v) {
        this.#buffer = v;
    }

    get shaderType() {
        return this.#shaderType;
    }

    /**
     * @param {GPUShaderStage} v
     */
    set shaderType(v) {
        this.#shaderType = v;
    }
}

/**
 * @class UniformsArray
 * @ignore
 */
class UniformsArray extends Array {
    #buffer = null;
    constructor(...elements) {
        super(...elements);
    }

    get buffer() {
        return this.#buffer;
    }

    /**
     * set buffer
     * @param {*} v
     */
    set buffer(v) {
        this.#buffer = v;
    }
}

/**

The idea here is that the columns are the current stage of the storage
being checked at entries and dynamic bindings, and the rows are the stage where
the storage should show; the table then matches both.
The thing to remember here is, if the storage is required in any combination,
then the fragment stage (if is included) then there the storage must be
read access mode; if there's no vertex then the storage during fragment can be
read_write. Compute is always read_write.


| storage      \     current| COMPUTE    | VERTEX	 | FRAGMENT
| --------------------------|:-----------|:----------|----------:|
| compute, vertex, fragment | read_write | read	     | read
| compute                   | read_write |           |
| vertex                    |            | read      |
| fragment                  |            |           | read_write
| compute, vertex           | read_write | read      |
| compute, fragment         | read_write |           | read_write
| vertex, fragment          |            | read	     | read

* @module storage-accessmode
* @ignore
*/

const R = 'r';
const RW = 'rw';

const cache = {
    [GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT]: {
        [GPUShaderStage.COMPUTE]: RW,
        [GPUShaderStage.VERTEX]: R,
        [GPUShaderStage.FRAGMENT]: R
    },//
    [GPUShaderStage.COMPUTE]: {
        [GPUShaderStage.COMPUTE]: RW,
        [GPUShaderStage.VERTEX]: null,
        [GPUShaderStage.FRAGMENT]: null
    },
    [GPUShaderStage.VERTEX]: {
        [GPUShaderStage.COMPUTE]: null,
        [GPUShaderStage.VERTEX]: R,
        [GPUShaderStage.FRAGMENT]: null
    },
    [GPUShaderStage.FRAGMENT]: {
        [GPUShaderStage.COMPUTE]: null,
        [GPUShaderStage.VERTEX]: null,
        [GPUShaderStage.FRAGMENT]: RW
    },//
    [GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX]: {
        [GPUShaderStage.COMPUTE]: RW,
        [GPUShaderStage.VERTEX]: R,
        [GPUShaderStage.FRAGMENT]: null
    },
    [GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT]: {
        [GPUShaderStage.COMPUTE]: RW,
        [GPUShaderStage.VERTEX]: null,
        [GPUShaderStage.FRAGMENT]: RW
    },//
    [GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT]: {
        [GPUShaderStage.COMPUTE]: null,
        [GPUShaderStage.VERTEX]: R,
        [GPUShaderStage.FRAGMENT]: R
    },
};

function getStorageAccessMode(currentStage, storageShaderTypes) {
    return cache[storageShaderTypes][currentStage];
}

const bindingModes = { [R]: 'read', [RW]: 'read_write' };
const entriesModes = { [R]: 'read-only-storage', [RW]: 'storage' };

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
    /** @type {Array<RenderPass>} */
    #renderPasses = null;
    #postRenderPasses = [];
    #vertexBufferInfo = null;
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
        });
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
        };
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
        };
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
        });
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
        };

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
        };
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
        };
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
        const exists = this.#nameExists(this.#samplers, name);
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
        };
        this.#textures2d.push(texture2d);
        return texture2d;
    }

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
        };
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
            internal: false
        };
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
        };

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
     * @param {GPUShaderStage} shaderType
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
            internal: false
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
        };
        // this.#audio.play();
        // audio
        const audioContext = new AudioContext();
        const resume = _ => { audioContext.resume(); };
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
        };
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

                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <storage, ${accessMode}> ${storageItem.name}: ${T};\n`;
                bindingIndex += 1;
            }
        });
        if (this.#layers.length) {
            if (!this.#layers.shaderType || this.#layers.shaderType & shaderType) {
                let totalSize = 0;
                this.#layers.forEach(layerItem => totalSize += layerItem.size);
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <storage, read_write> layers: array<array<vec4f, ${totalSize}>>;\n`;
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
        });
        dynamicStructParams += dynamicStructMesh;

        renderPass.index = index;
        renderPass.hasVertexShader && (dynamicGroupBindingsVertex += dynamicStructParams);
        renderPass.hasComputeShader && (dynamicGroupBindingsCompute += dynamicStructParams);
        renderPass.hasFragmentShader && (dynamicGroupBindingsFragment += dynamicStructParams);
        renderPass.hasVertexShader && (dynamicGroupBindingsVertex += this.#createDynamicGroupBindings(GPUShaderStage.VERTEX, renderPass));
        renderPass.hasComputeShader && (dynamicGroupBindingsCompute += this.#createDynamicGroupBindings(GPUShaderStage.COMPUTE, renderPass));
        dynamicGroupBindingsFragment += this.#createDynamicGroupBindings(GPUShaderStage.FRAGMENT, renderPass, 1);
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
            return vertex + compute + fragment;        }).join('\n');
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
        let adapter = null;
        try {
            adapter = await navigator.gpu.requestAdapter();
        } catch (err) {
            console.log(err);
        }
        if (!adapter) { return false; }
        this.#device = await adapter.requestDevice();
        console.log(this.#device.limits);

        this.#device.lost.then(info => console.log(info));
        if (this.#canvas !== null) this.#context = this.#canvas.getContext('webgpu');
        this.#presentationFormat = navigator.gpu.getPreferredCanvasFormat();
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
        });

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
        const hasVertexAndFragmentShader = this.#renderPasses.some(renderPass => renderPass.hasVertexAndFragmentShader);
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
        const paramsDataSize = this.#dataSize.get(structName);
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
            console.error('An attempt to create uniforms has been made but no setUniform has been called. Maybe an update was called before a setUniform.');
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
                };
                if (storageItem.mapped) {
                    readStorageItem = {
                        name: storageItem.name,
                        size: storageItem.array.length,
                    };
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
                const imageBitmap = texture2d.imageTexture.bitmap;
                const cubeTexture = this.#device.createTexture({
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
        // this.#texturesDepth2d.forEach(texture2d => this.#createTextureDepth(texture2d));
        this.#texturesDepth2d.forEach(texture2d => texture2d.texture = this.#depthTexture);
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
                });

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

    #createComputeBindGroup() {
        this.#renderPasses.forEach((renderPass, index) => {
            if (renderPass.hasComputeShader) {
                const entries = this.#createEntries(GPUShaderStage.COMPUTE, renderPass);
                if (entries.length) {
                    renderPass.bindGroupLayoutCompute = this.#device.createBindGroupLayout({ entries });
                    renderPass.computeBindGroup = this.#device.createBindGroup({
                        label: `_createComputeBindGroup 0 - ${index}`,
                        layout: renderPass.bindGroupLayoutCompute,
                        entries: entries
                    });
                }
            }
        });
    }

    /**
     * This is a slimmed down version of {@link #createComputeBindGroup}.
     * We don't create the bindingGroupLayout since it already exists.
     * We do update the entries. We have to update them because of
     * changing textures like videos.
     * TODO: this can be optimized even further by setting a flag to
     * NOT CALL the createBindGroup if the texture (video/other)
     * is not being updated at all. I have to make the createBindGroup call
     * only if the texture is updated.
     * @param {RenderPass} renderPass
     */
    #passComputeBindingGroup(renderPass) {
        const entries = this.#createEntries(GPUShaderStage.COMPUTE, renderPass);
        if (entries.length) {
            renderPass.computeBindGroup = this.#device.createBindGroup({
                label: `_passComputeBindingGroup 0`,
                layout: renderPass.bindGroupLayoutCompute,
                entries
            });
        }
    }

    #createPipeline() {
        this.#createComputeBindGroup();
        this.#renderPasses.forEach((renderPass, index) => {
            if (renderPass.hasComputeShader) {
                renderPass.computePipeline = this.#device.createComputePipeline({
                    layout: this.#device.createPipelineLayout({
                        bindGroupLayouts: [renderPass.bindGroupLayoutCompute]
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
        this.#createVertexBindGroup();
        this.#createRenderBindGroup();
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
                let depthStencil = undefined;
                if (renderPass.depthWriteEnabled) {
                    depthStencil = {
                        depthWriteEnabled: renderPass.depthWriteEnabled,
                        depthCompare: 'less',
                        format: 'depth32float',
                    };
                }
                renderPass.renderPipeline = this.#device.createRenderPipeline({
                    label: `render pipeline: renderPass ${renderPass.index} (${renderPass.name})`,
                    // layout: 'auto',
                    layout: this.#device.createPipelineLayout({
                        bindGroupLayouts: [renderPass.bindGroupLayoutVertex, renderPass.bindGroupLayoutRender]
                    }),
                    //primitive: { topology: 'triangle-strip' },
                    primitive: { topology: renderPass.topology },
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
        // console.log(shaderType, entries);debugger

        return entries;
    }

    #createVertexBindGroup() {
        this.#renderPasses.forEach(renderPass => {
            const entries = this.#createEntries(GPUShaderStage.VERTEX, renderPass);
            if (entries.length) {
                renderPass.bindGroupLayoutVertex = this.#device.createBindGroupLayout({ entries });
                renderPass.vertexBindGroup = this.#device.createBindGroup({
                    label: '_createVertexBindGroup() 0',
                    layout: renderPass.bindGroupLayoutVertex,
                    entries
                });
            }
        });
    }

    #createRenderBindGroup() {
        this.#renderPasses.forEach(renderPass => {
            const entries = this.#createEntries(GPUShaderStage.FRAGMENT, renderPass);
            if (entries.length) {
                renderPass.bindGroupLayoutRender = this.#device.createBindGroupLayout({ entries });
                renderPass.renderBindGroup = this.#device.createBindGroup({
                    label: '_createRenderBindGroup() 0',
                    layout: renderPass.bindGroupLayoutRender,
                    entries
                });
            }
        });
    }

    /**
     * This is a slimmed down version of {@link #createRenderBindGroup}.
     * We don't create the bindingGroupLayout since it already exists.
     * We do update the entries. We have to update them because of
     * changing textures like videos.
     * TODO: this can be optimized even further by setting a flag to
     * NOT CALL the createBindGroup if the texture (video/other)
     * is not being updated at all. I have to make the createBindGroup call
     * only if the texture is updated.
     * @param {RenderPass} renderPass
     */
    #passRenderBindGroup(renderPass) {
        const entries = this.#createEntries(GPUShaderStage.FRAGMENT, renderPass);
        if (entries.length) {
            renderPass.renderBindGroup = this.#device.createBindGroup({
                label: '_passRenderBindGroup() 0',
                layout: renderPass.bindGroupLayoutRender,
                entries
            });
        }
    }

    /**
     *
     * @param {RenderPass} renderPass
     */
    #passVertexBindGroup(renderPass) {
        const entries = this.#createEntries(GPUShaderStage.VERTEX, renderPass);
        if (entries.length) {
            renderPass.vertexBindGroup = this.#device.createBindGroup({
                label: '_passVertexBindGroup() 0',
                layout: renderPass.bindGroupLayoutVertex,
                entries
            });
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
                this.#passRenderBindGroup(renderPass);
                this.#passVertexBindGroup(renderPass);

                renderPass.descriptor.colorAttachments[0].view = swapChainTexture.createView();
                if (renderPass.depthWriteEnabled) {
                    renderPass.descriptor.depthStencilAttachment.view = this.#depthTexture.createView();
                    // renderPass.descriptor.depthStencilAttachment.view = this.#texturesDepth2d[0].texture.createView();
                }

                const passEncoder = commandEncoder.beginRenderPass(renderPass.descriptor);
                passEncoder.setPipeline(renderPass.renderPipeline);

                if (this.#uniforms.length) {
                    passEncoder.setBindGroup(0, renderPass.vertexBindGroup);
                    passEncoder.setBindGroup(1, renderPass.renderBindGroup);
                }
                passEncoder.setVertexBuffer(0, renderPass.vertexBuffer);

                // console.log(renderPass.meshes.find( mesh => mesh.instanceCount > 1));
                // console.log(renderPass.meshes.some( mesh => mesh.instanceCount > 1));
                // TODO: move this to renderPass because we can ask this just one time and have it as property
                const isThereInstancing = renderPass.meshes.some(mesh => mesh.instanceCount > 1);
                if (isThereInstancing) {
                    let vertexOffset = 0;
                    renderPass.meshes.forEach(mesh => {
                        passEncoder.draw(mesh.verticesCount, mesh.instanceCount, vertexOffset, 0);
                        vertexOffset = mesh.verticesCount;
                    });
                } else {
                    // no instancing, regular draw with all the meshes
                    passEncoder.draw(renderPass.vertexBufferInfo.vertexCount, 1);
                }

                passEncoder.end();
                // Copy the rendering results from the swapchain into |texture2d.texture|.
                this.#textures2d.forEach(texture2d => {
                    if (texture2d.renderPassIndex === renderPass.index || !texture2d.renderPassIndex) {
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
                this.#passComputeBindingGroup(renderPass);

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
                    const dataRead = await this.readStorage(`${name}_data`);
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

    destroy() {

        this.#uniforms = new UniformsArray();
        this.#meshUniforms = new UniformsArray();
    }
}

export { RenderPass, RenderPasses, Points as default };
