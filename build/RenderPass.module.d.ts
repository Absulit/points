export { RenderPass as default };
declare class RenderPass {
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
