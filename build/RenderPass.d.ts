export { RenderPass as default };
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
     * @param {(points:Points, params:Object)=>{}} init Method to add custom
     * uniforms or storage (points.set* methods).
     * This is made for post processing `RenderPass`es
     * The method `init` will be called to initialize the variables.
     *
     * @example
     * // init param example
     * const grayscale = new RenderPass(vertexShader, fragmentShader);
     * grayscale.setInit((points, params) => {
     *     points.setSampler('renderpass_feedbackSampler', null);
     *     points.setTexture2d('renderpass_feedbackTexture', true);
     * });
     */
    constructor(vertexShader: string, fragmentShader: string, computeShader: string, workgroupCountX: string, workgroupCountY: string, workgroupCountZ: string, init: (points: Points, params: any) => {});
    set index(value: any);
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
    get workgroupCountX(): string | number;
    get workgroupCountY(): string | number;
    get workgroupCountZ(): string | number;
    /**
     *
     * @param {Points} points
     * @param {Object} params
     */
    init(points: Points, params: any): void;
    /**
     * @param {Array<String>} val names of the parameters `params` in
     * {@link RenderPass#setInit} that are required.
     * This is only  used for a post processing RenderPass.
     */
    set required(val: Array<string>);
    get required(): Array<string>;
    #private;
}
