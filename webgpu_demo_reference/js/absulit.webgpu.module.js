import Coordinate from './coordinate.js';
import { getShaderSource } from '../shader_loader.js';
import RGBAColor from './color.js';
import { print } from '../../js/utils.js';

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
        this._computePipeline = null;
        this._vertexBufferInfo = null;
        this._buffer = null;
        this._screenSizeArrayBuffer = null;
        this._uniformBindGroup = null;
        this._computeBindGroups = null;
        this._presentationSize = null;
        this._depthTexture = null;
        this._commandEncoder = null;

        this._vertexArray = [];
        this._screenSizeArray = [];
        this._gpuBufferFirstMatrix = [];
        this._layer0Buffer = [];
        this._layer0BufferSize = null;

        this._numColumns = null;
        this._numRows = null;

        this._commandsFinished = [];

        this._shaderModule = null;

        this._renderPassDescriptor = null;
    }

    async init() {
        const colorsVertWGSL = await getShaderSource('./shaders/demo6_colors.vert.wgsl');
        const colorsFragWGSL = await getShaderSource('./shaders/demo6_colors.frag.wgsl');

        const textureVertWGSL = await getShaderSource('./shaders/demo6_texture.vert.wgsl');
        const textureFragWGSL = await getShaderSource('./shaders/demo6_texture.frag.wgsl');

        const updatePointsWGSL = await getShaderSource('./shaders/demo6_update.points.wgsl');

        this._shaders = {
            false: {
                vertex: colorsVertWGSL,
                fragment: colorsFragWGSL
            },
            true: {
                vertex: textureVertWGSL,
                fragment: textureFragWGSL
            },
            points: {
                update: updatePointsWGSL
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
        this._presentationSize = [
            this._canvas.clientWidth * devicePixelRatio,
            this._canvas.clientHeight * devicePixelRatio,
        ];
        //this._presentationFormat = this._context.getPreferredFormat(adapter);
        this._presentationFormat = navigator.gpu.getPreferredCanvasFormat();


        this._context.configure({
            device: this._device,
            format: this._presentationFormat,
            //size: this._presentationSize,
            width: this._canvas.clientWidth,
            height: this._canvas.clientHeight,
            alphaMode: 'premultiplied',
        });

        this._depthTexture = this._device.createTexture({
            size: this._presentationSize,
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this._renderPassDescriptor = {
            colorAttachments: [
                {
                    //view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },

            ],
            depthStencilAttachment: {
                //view: this._depthTexture.createView(),

                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        };

        return true;
    }

    /**
     * 
     * @param {Number} numColumns 
     * @param {Number} numRows 
     */
    async createScreen(numColumns = 10, numRows = 10) {
        let colors = [
            new RGBAColor(1, 0, 0),
            new RGBAColor(0, 1, 0),
            new RGBAColor(0, 0, 1),
            new RGBAColor(1, 1, 0),
        ];

        this._numColumns = numColumns;
        this._numRows = numRows;

        for (let xIndex = 0; xIndex < numRows; xIndex++) {
            for (let yIndex = 0; yIndex < numColumns; yIndex++) {
                const coordinate = new Coordinate(xIndex * this._canvas.clientWidth / this._numColumns, yIndex * this._canvas.clientHeight / this._numRows, .3);
                this.addPoint(coordinate, this._canvas.clientWidth / this._numColumns, this._canvas.clientHeight / this._numRows, colors);
            }
        }
        this.createVertexBuffer(new Float32Array(this._vertexArray));
        this.createComputeBuffers();


        await this.createPipeline();
    }

    /**
     *
     * @param {Float32Array} vertexArray
     * @returns buffer
     */
    createVertexBuffer(vertexArray) {
        this._vertexBufferInfo = new VertexBufferInfo(vertexArray);
        this._buffer = this._device.createBuffer({
            size: vertexArray.byteLength,//TODO: fill via shader this._numColumns*this._numRows*4*60,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(this._buffer.getMappedRange()).set(vertexArray);
        this._buffer.unmap();
        return this._buffer;
    }

    createComputeBuffers() {
        this._screenSizeArray = new Float32Array([this._numColumns, this._numRows, 0, 0]);

        this._screenSizeArrayBuffer = this._device.createBuffer({
            mappedAtCreation: true,
            size: this._screenSizeArray.byteLength,
            usage: GPUBufferUsage.STORAGE,
        });
        const screenSizeArrayMappedRange = this._screenSizeArrayBuffer.getMappedRange();
        new Float32Array(screenSizeArrayMappedRange).set(this._screenSizeArray);
        this._screenSizeArrayBuffer.unmap();
        //--------------------------------------------



        // First Matrix

        const firstMatrix = new Float32Array(this._vertexArray);

        this._gpuBufferFirstMatrix = this._device.createBuffer({
            mappedAtCreation: true,
            size: firstMatrix.byteLength,
            usage: GPUBufferUsage.STORAGE,
        });
        const arrayBufferFirstMatrix = this._gpuBufferFirstMatrix.getMappedRange();
        new Float32Array(arrayBufferFirstMatrix).set(firstMatrix);
        this._gpuBufferFirstMatrix.unmap();

        // Layer0

        this._layer0BufferSize = firstMatrix.byteLength;
        this._layer0Buffer = this._device.createBuffer({
            size: firstMatrix.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: true,
        });

        const b = this._layer0Buffer.getMappedRange();
        new Float32Array(b).set(firstMatrix);
        this._layer0Buffer.unmap();

        // Layer1

        this._layer1BufferSize = firstMatrix.byteLength;
        this._layer1Buffer = this._device.createBuffer({
            size: firstMatrix.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: true,
        });

        const l1b = this._layer1Buffer.getMappedRange();
        new Float32Array(l1b).set(firstMatrix);
        this._layer1Buffer.unmap();

        // particles

        const particles = new Float32Array(Array(2000).fill(0));
        this._particlesBufferSize = firstMatrix.byteLength;
        this._particlesBuffer = this._device.createBuffer({
            size: particles.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: false,
        });

    }

    /**
     * 
     * @param {Array} data 
     */
    createWriteCopyBuffer(data) {
        const va = new Float32Array(data)
        const gpuWriteBuffer = this._device.createBuffer({
            mappedAtCreation: true,
            size: va.byteLength,
            usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC
        });
        const arrayBuffer = gpuWriteBuffer.getMappedRange();

        // Write bytes to buffer.
        new Float32Array(arrayBuffer).set(va);

        // Unmap buffer so that it can be used later for copy.
        gpuWriteBuffer.unmap();
        return gpuWriteBuffer;
    }


    async createPipeline() {

        this._computePipeline = this._device.createComputePipeline({
            /*layout: device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            }),*/
            layout: 'auto',
            compute: {
                module: this._shaderModule,
                entryPoint: "main"
            }
        });





        this._computeBindGroups = this._device.createBindGroup({
            //layout: bindGroupLayout,
            layout: this._computePipeline.getBindGroupLayout(0 /* index */),
            entries: [
                // {
                //     binding: 0,
                //     resource: {
                //         buffer: this._gpuBufferFirstMatrix
                //     }
                // },
                {
                    binding: 0,
                    resource: {
                        buffer: this._layer0Buffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this._layer1Buffer
                    }
                },
                {
                    binding: 7,
                    resource: {
                        buffer: this._particlesBuffer
                    }
                },
                {
                    binding: 8,
                    resource: {
                        buffer: this._screenSizeArrayBuffer
                    }
                }
            ]
        });

        //--------------------------------------


        //this.createVertexBuffer(new Float32Array(this._vertexArray));
        // enum GPUPrimitiveTopology {
        //     'point-list',
        //     'line-list',
        //     'line-strip',
        //     'triangle-list',
        //     'triangle-strip',
        // };
        this._pipeline = this._device.createRenderPipeline({
            layout: 'auto',
            //layout: bindGroupLayout,
            //primitive: { topology: 'triangle-strip' },
            primitive: { topology: 'triangle-list' },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
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
        if (!this._device) return;

        this._screenSizeArrayBuffer = this._device.createBuffer({
            mappedAtCreation: true,
            size: this._screenSizeArray.byteLength,
            usage: GPUBufferUsage.STORAGE,
        });

        new Float32Array(this._screenSizeArrayBuffer.getMappedRange()).set(this._screenSizeArray);
        this._screenSizeArrayBuffer.unmap();
        ///----------------

        this._computeBindGroups = this._device.createBindGroup({
            //layout: bindGroupLayout,
            layout: this._computePipeline.getBindGroupLayout(0 /* index */),
            entries: [
                // {
                //     binding: 0,
                //     resource: {
                //         buffer: this._gpuBufferFirstMatrix
                //     }
                // },
                {
                    binding: 0,
                    resource: {
                        buffer: this._layer0Buffer
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this._layer1Buffer
                    }
                },
                {
                    binding: 7,
                    resource: {
                        buffer: this._particlesBuffer
                    }
                },
                {
                    binding: 8,
                    resource: {
                        buffer: this._screenSizeArrayBuffer
                    }
                }
            ]
        });

        let commandEncoder = this._device.createCommandEncoder();



        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(this._computePipeline);
        passEncoder.setBindGroup(0, this._computeBindGroups);
        passEncoder.dispatchWorkgroups(8,8,2);
        passEncoder.end();


        commandEncoder.copyBufferToBuffer(
            this._layer0Buffer /* source buffer */,
            0 /* source offset */,
            this._buffer /* destination buffer */,
            0 /* destination offset */,
            this._layer0BufferSize /* size */
        );

        // ---------------------

        this._renderPassDescriptor.colorAttachments[0].view = this._context.getCurrentTexture().createView();
        this._renderPassDescriptor.depthStencilAttachment.view = this._depthTexture.createView();

        //commandEncoder = this._device.createCommandEncoder();
        {
            //---------------------------------------
            const passEncoder = commandEncoder.beginRenderPass(this._renderPassDescriptor);
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
        }

        this._commandsFinished.push(commandEncoder.finish());
        this._device.queue.submit(this._commandsFinished);
        this._commandsFinished = [];

        //
        //this._vertexArray = [];
    }

    _getWGSLCoordinate(value, side, invert = false) {
        const direction = invert ? -1 : 1;
        const p = value / side;
        return (p * 2 - 1) * direction;
    };

    /**
     * 
     * @param {Coordinate} coordinate `x` from 0 to canvas.width, `y` from 0 to canvas.height, `z` it goes from 0.0 to 1.0 and forward
     * @param {Number} width point width
     * @param {Number} height point height
     * @param {Array<RGBAColor>} colors one color per corner
     * @param {Boolean} useTexture 
     */
    addPoint(coordinate, width, height, colors, useTexture = false) {
        const { x, y, z } = coordinate;
        const nx = this._getWGSLCoordinate(x, this._canvas.width);
        const ny = this._getWGSLCoordinate(y, this._canvas.height, true);
        const nz = z;

        const nw = this._getWGSLCoordinate(x + width, this._canvas.width);
        const nh = this._getWGSLCoordinate(y + height, this._canvas.height);

        const { r: r0, g: g0, b: b0, a: a0 } = colors[0];
        const { r: r1, g: g1, b: b1, a: a1 } = colors[1];
        const { r: r2, g: g2, b: b2, a: a2 } = colors[2];
        const { r: r3, g: g3, b: b3, a: a3 } = colors[3];
        this._vertexArray.push(
            +nx, +ny, nz, 1, r0, g0, b0, a0, 1, 0,// 0 top left
            +nw, +ny, nz, 1, r1, g1, b1, a1, 0, 0,// 1 top right
            +nw, -nh, nz, 1, r3, g3, b3, a3, 0, 1,// 2 bottom right

            +nx, +ny, nz, 1, r0, g0, b0, a0, 1, 0,// 3 top left
            +nx, -nh, nz, 1, r2, g2, b2, a2, 1, 1,// 4 bottom left
            +nw, -nh, nz, 1, r3, g3, b3, a3, 0, 1,// 5 bottom right
        );
    }

    modifyPointColor(coordinate, color) {
        const { x, y, z } = coordinate;
        const { r, g, b, a } = color;

        const numColumns = 100;
        const index = y + (x * numColumns);

        for (let row = 0; row < 6; row++) {
            //const rowIndex = row * this._vertexBufferInfo.vertexSize;
            const rowIndex = row * 10;
            this._vertexArray[rowIndex + index * 60 + 4] = r;
            this._vertexArray[rowIndex + index * 60 + 5] = g;
            this._vertexArray[rowIndex + index * 60 + 6] = b;
            this._vertexArray[rowIndex + index * 60 + 7] = a;
        }

    }
    /**
     * 
     * @param {Coordinate} coordinate 
     * @param {*} buffer 
     */
    modifyPointColor2(coordinate, gpuWriteBuffer) {
        const { x, y, z } = coordinate;
        //const coordinateValue = coordinate.value;
        //const colorValue = color.value;

        const index = y + (x * this._numColumns);

        const commandEncoder = this._device.createCommandEncoder();
        for (let vertexIndex = 0; vertexIndex < 6; vertexIndex++) {
            commandEncoder.copyBufferToBuffer(
                gpuWriteBuffer /* source buffer */,
                0 /* source offset */,
                this._buffer /* destination buffer */,
                4 * (vertexIndex * 10 + index * 60 + 4)/* destination offset */, //4 * (index * 10 + 4)
                gpuWriteBuffer.size /* size */
            );
        }

        const copyCommands = commandEncoder.finish();
        this._commandsFinished.push(copyCommands);
        //this._device.queue.submit([copyCommands]);
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

    get buffer() {
        return this._buffer;
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
