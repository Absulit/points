import { getShaderSource } from '../shader_loader.js';

export class VertexBufferInfo {
    /**
     * Along with the vertexArray it calculates some info like offsets required for the pipeline.
     * @param {Float32Array} vertexArray array with vertex, color and uv data
     * @param {Number} triangleDataLength how many items does a triangle row has in vertexArray
     * @param {Number} vertexOffset index where the vertex data starts in a row of `triangleDataLength` items
     * @param {Number} colorOffset index where the color data starts in a row of `triangleDataLength` items
     * @param {Number} uvOffset index where the uv data starts in a row of `triangleDataLength` items
     */
    constructor(vertexArray, triangleDataLength = 10, vertexOffset = 0, colorOffset = 4, uvOffset = 8) {
        this._vertexSize = vertexArray.BYTES_PER_ELEMENT * triangleDataLength; // Byte size of ONE triangle data (vertex, color, uv). (one row)
        this._vertexOffset = vertexArray.BYTES_PER_ELEMENT * vertexOffset;
        this._colorOffset = vertexArray.BYTES_PER_ELEMENT * colorOffset; // Byte offset of triangle vertex color attribute.
        this._uvOffset = vertexArray.BYTES_PER_ELEMENT * uvOffset;
        this._vertexCount = vertexArray.byteLength / this._vertexSize;

        console.log('vertexArray.BYTES_PER_ELEMENT:', vertexArray.BYTES_PER_ELEMENT);
        console.log('vertexArray.byteLength:', vertexArray.byteLength);
        console.log('vertexCount  = vertexArray.byteLength / vertexSize:', vertexArray.byteLength / this._vertexSize);

        console.log({ vertexSize: this._vertexSize, vertexOffset: this._vertexOffset, colorOffset: this._colorOffset, vertexCount: this._vertexCount, uvOffset: this._uvOffset });
    }

    get vertexSize() {
        return this._vertexSize
    }

    get vertexOffset() {
        return this._vertexOffset;
    }

    get colorOffset() {
        return this._colorOffset;
    }

    get uvOffset() {
        return this._uvOffset;
    }

    get vertexCount() {
        return this._vertexCount;
    }
}

export default class WebGPU {
    constructor(canvasId) {
        this._canvasId = canvasId;
        this._canvas = null;
        this._device = null;
        this._context = null;
        this._presentationFormat = null;
        this._useTexture = false;
        this._shaders = null;
        this._pipeline = null;
        this._vertexBufferInfo = null;
        this._buffer = null;
        this._uniformBindGroup = null;

    }

    async init() {
        const colorsVertWGSL = await getShaderSource('./shaders/demo6_colors.vert.wgsl');
        const colorsFragWGSL = await getShaderSource('./shaders/demo6_colors.frag.wgsl');

        const textureVertWGSL = await getShaderSource('./shaders/demo6_texture.vert.wgsl');
        const textureFragWGSL = await getShaderSource('./shaders/demo6_texture.frag.wgsl');

        this._shaders = {
            false: {
                vertex: colorsVertWGSL,
                fragment: colorsFragWGSL
            },
            true: {
                vertex: textureVertWGSL,
                fragment: textureFragWGSL
            }
        }

        this._canvas = document.getElementById(this._canvasId);
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) { return false; }
        this._device = await adapter.requestDevice();
        this._device.lost.then(info => {
            console.log(info);
        });

        if (this._canvas === null) return false;
        this._context = this._canvas.getContext('webgpu');

        const devicePixelRatio = window.devicePixelRatio || 1;
        const presentationSize = [
            this._canvas.clientWidth * devicePixelRatio,
            this._canvas.clientHeight * devicePixelRatio,
        ];
        this._presentationFormat = this._context.getPreferredFormat(adapter);
        console.log({ _presentationFormat: this._presentationFormat });
        this._context.configure({
            device: this._device,
            format: this._presentationFormat,
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
    createVertexBuffer(vertexArray) {
        this._vertexBufferInfo = new VertexBufferInfo(vertexArray);

        this._buffer = this._device.createBuffer({
            size: vertexArray.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        new Float32Array(this._buffer.getMappedRange()).set(vertexArray);
        this._buffer.unmap();
        return this._buffer;
    }

    async createPipeline() {
        // enum GPUPrimitiveTopology {
        //     'point-list',
        //     'line-list',
        //     'line-strip',
        //     'triangle-list',
        //     'triangle-strip',
        // };
        console.log({ _vertexBufferInfo: this._vertexBufferInfo });
        this._pipeline = this._device.createRenderPipeline({
            layout: 'auto',
            primitive: { topology: 'triangle-strip' },
            primitive: { topology: 'triangle-list' },
            vertex: {
                module: this._device.createShaderModule({
                    code: this._shaders[this._useTexture].vertex,
                }),
                entryPoint: 'main', // shader function name

                buffers: [
                    {
                        arrayStride: this._vertexBufferInfo.vertexSize,
                        attributes: [
                            {
                                // position
                                shaderLocation: 0,
                                offset: this._vertexBufferInfo.vertexOffset,
                                format: 'float32x4',
                            },
                            {
                                // colors
                                shaderLocation: 1,
                                offset: this._vertexBufferInfo.colorOffset,
                                format: 'float32x4',
                            },
                            {
                                // uv
                                shaderLocation: 2,
                                offset: this._vertexBufferInfo.uvOffset,
                                format: 'float32x2',
                            },
                        ],
                    },
                ],
            },
            fragment: {
                module: this._device.createShaderModule({
                    code: this._shaders[this._useTexture].fragment,
                }),
                entryPoint: 'main', // shader function name
                targets: [
                    {
                        format: this._presentationFormat,

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
        if (this._useTexture) {
            await this._createTexture();
        }
    }

    async _createTexture() {
        const samp = this._device.createSampler({ minFilter: 'linear', magFilter: 'linear' });
        // Fetch the image and upload it into a GPUTexture.
        //let cubeTexture: GPUTexture;
        let cubeTexture;
        {
            const response = await fetch('./assets/old_king_600x600.jpg');
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob);

            cubeTexture = this._device.createTexture({
                size: [imageBitmap.width, imageBitmap.height, 1],
                format: 'rgba8unorm',
                usage:
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT,
            });
            this._device.queue.copyExternalImageToTexture(
                { source: imageBitmap },
                { texture: cubeTexture },
                [imageBitmap.width, imageBitmap.height]
            );
        }

        console.log(cubeTexture);

        this._uniformBindGroup = this._device.createBindGroup({
            layout: this._pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: cubeTexture.createView(),
                },
                {
                    binding: 1,
                    resource: samp,
                }
            ],
        });
    }

    update() {
        if (!this._canvas) return;

        const commandEncoder = this._device.createCommandEncoder();
        const textureView = this._context.getCurrentTexture().createView();

        //const renderPassDescriptor: GPURenderPassDescriptor = {
        const renderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this._pipeline);
        if (this._useTexture) {
            passEncoder.setBindGroup(0, this._uniformBindGroup);
        }
        passEncoder.setVertexBuffer(0, this._buffer);

        /**
         * vertexCount: number The number of vertices to draw
         * instanceCount?: number | undefined The number of instances to draw
         * firstVertex?: number | undefined Offset into the vertex buffers, in vertices, to begin drawing from
         * firstInstance?: number | undefined First instance to draw
         */
        //passEncoder.draw(3, 1, 0, 0);
        passEncoder.draw(this._vertexBufferInfo.vertexCount);
        passEncoder.end();

        this._device.queue.submit([commandEncoder.finish()]);

    }

    get canvas() {
        return this._canvas;
    }

    get device() {
        return this._device;
    }

    get context() {
        return this._context;
    }

    get presentationFormat() {
        return this._presentationFormat;
    }

    /**
     * @param {Boolean} value
     */
    set useTexture(value) {
        this._useTexture = value;
    }

    get useTexture() {
        return this._useTexture;
    }

    get pipeline() {
        return this._pipeline;
    }
}
