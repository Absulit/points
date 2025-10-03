'use strict';


function getWGSLCoordinate(value, side, invert = false) {
    const direction = invert ? -1 : 1;
    const p = value / side;
    return (p * 2 - 1) * direction;
};

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
     * @param {Number} val
     */
    set instanceCount(val) {
        this.#instanceCount = val;
    }

    get instanceCount() {
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
        const normals = [ 0, 0, 1];

        this.#vertexArray.push(
            +nx, +ny, nz, 1, r0, g0, b0, a0, (+nx + 1) * .5, (+ny + 1) * .5, ...normals, // 0 top left
            +nw, +ny, nz, 1, r1, g1, b1, a1, (+nw + 1) * .5, (+ny + 1) * .5, ...normals, // 1 top right
            +nw, -nh, nz, 1, r3, g3, b3, a3, (+nw + 1) * .5, (-nh + 1) * .5, ...normals, // 2 bottom right
            +nx, +ny, nz, 1, r0, g0, b0, a0, (+nx + 1) * .5, (+ny + 1) * .5, ...normals, // 3 top left
            +nx, -nh, nz, 1, r2, g2, b2, a2, (+nx + 1) * .5, (-nh + 1) * .5, ...normals, // 4 bottom left
            +nw, -nh, nz, 1, r3, g3, b3, a3, (+nw + 1) * .5, (-nh + 1) * .5, ...normals, // 5 bottom right
        );
    }

    /**
     * Adds a mesh cube
     * @param {{x:Number, y:Number, z:Number}} coordinate
     * @param {{width:Number, height:Number, depth:Number}} dimensions
     * @param {{r:Number, g:Number, b:Number, a:Number}} color
     */
    addCube(coordinate, dimensions, color) {
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
            console.log(normals);


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
                this.#vertexArray.push(+vx, +vy, +vz, 1, r, g, b, a, u, v, ...normals);
            }
        }
    }

}

export default RenderPass;
