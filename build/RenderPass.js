/* @ts-self-types="./RenderPass.d.ts" */
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
     * @param {Object} params data that can be assigned to the RenderPass when
     * the {@link Points#addRenderPass} method is called.
     */
    init(points, params) {
        params ||= {};
        this.#callback?.(points, params);
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

    get instanceCount(){
        return this.#instanceCount;
    }
}

export { RenderPass as default };
