export default class WebGPU {
    constructor(canvasId) {
        this._canvasId = canvasId;
        this._canvas = null;
        this._device = null;
        this._context = null;
    }

    async init() {
        this._canvas = document.getElementById(this._canvasId);
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) { return false; }
        this._device  = await adapter.requestDevice();
        this._device .lost.then(info => {
            console.log(info);
        });

        if (this._canvas === null) return false;
        this._context = this._canvas.getContext('webgpu');

        const devicePixelRatio = window.devicePixelRatio || 1;
        const presentationSize = [
            this._canvas.clientWidth * devicePixelRatio,
            this._canvas.clientHeight * devicePixelRatio,
        ];
        const presentationFormat = this._context.getPreferredFormat(adapter);

        this._context.configure({
            device: this._device,
            format: presentationFormat,
            size: presentationSize,
            compositingAlphaMode: 'premultiplied',
        });

        return true;
    }

    /**
     * 
     * @param {Float32Array} vertexArray 
     * @returns buffer
     */
    createVertexBuffer(vertexArray){
        const buffer = this._device.createBuffer({
            size: vertexArray.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        new Float32Array(buffer.getMappedRange()).set(vertexArray);
        buffer.unmap();
        return buffer
    }

    get canvas() {
        return this._canvas;
    }

    get device() {
        return this._device;
    }

    get context(){
        return this._context;
    }
}