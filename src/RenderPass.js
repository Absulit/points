'use strict';

export default class RenderPass {
    /**
     * A collection of Vertex, Compute and Fragment shaders that represent a RenderPass.
     * This is useful for PostProcessing.
     * @param {String} vertexShader  WGSL Vertex Shader in a String.
     * @param {String} fragmentShader  WGSL Fragment Shader in a String.
     * @param {String} computeShader  WGSL Compute Shader in a String.
     */
    constructor(vertexShader, fragmentShader, computeShader, workgroupCountX, workgroupCountY, workgroupCountZ) {
        this._vertexShader = vertexShader;
        this._computeShader = computeShader;
        this._fragmentShader = fragmentShader;

        this._computePipeline = null;
        this._renderPipeline = null;

        this._computeBindGroup = null;
        this._uniformBindGroup = null;

        this._internal = false;

        this._compiledShaders = {
            vertex: '',
            compute: '',
            fragment: '',
        };

        this._hasComputeShader = !!this._computeShader;
        this._hasVertexShader = !!this._vertexShader;
        this._hasFragmentShader = !!this._fragmentShader;

        this._hasVertexAndFragmentShader = this._hasVertexShader && this._hasFragmentShader;

        this._workgroupCountX = workgroupCountX || 8;
        this._workgroupCountY = workgroupCountY || 8;
        this._workgroupCountZ = workgroupCountZ || 1;
    }

    get internal() {
        return this._internal;
    }

    set internal(value) {
        this._internal = value;
    }

    get vertexShader() {
        return this._vertexShader;
    }

    get computeShader() {
        return this._computeShader;
    }

    get fragmentShader() {
        return this._fragmentShader;
    }

    set computePipeline(value) {
        this._computePipeline = value;
    }

    get computePipeline() {
        return this._computePipeline;
    }

    set renderPipeline(value) {
        this._renderPipeline = value;
    }

    get renderPipeline() {
        return this._renderPipeline;
    }

    set computeBindGroup(value) {
        this._computeBindGroup = value;
    }

    get computeBindGroup() {
        return this._computeBindGroup;
    }

    set uniformBindGroup(value) {
        this._uniformBindGroup = value;
    }

    get uniformBindGroup() {
        return this._uniformBindGroup;
    }

    get compiledShaders() {
        return this._compiledShaders;
    }

    get hasComputeShader() {
        return this._hasComputeShader;
    }

    get hasVertexShader() {
        return this._hasVertexShader;
    }

    get hasFragmentShader() {
        return this._hasFragmentShader;
    }

    get hasVertexAndFragmentShader() {
        return this._hasVertexAndFragmentShader;
    }

    get workgroupCountX() {
        return this._workgroupCountX;
    }

    get workgroupCountY() {
        return this._workgroupCountY;
    }

    get workgroupCountZ() {
        return this._workgroupCountZ;
    }
}
