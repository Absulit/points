'use strict';
// import triangleVertWGSL from './shaders/triangle.vert.wgsl';
// import redFragWGSL from './shaders/red.frag.wgsl';
import { getShaderSource } from './shader_loader.js';

const colorsVertWGSL = await getShaderSource('./shaders/demo6_colors.vert.wgsl');
const colorsFragWGSL = await getShaderSource('./shaders/demo6_colors.frag.wgsl');

const textureVertWGSL = await getShaderSource('./shaders/demo6_texture.vert.wgsl');
const textureFragWGSL = await getShaderSource('./shaders/demo6_texture.frag.wgsl');

const useTexture = true;
const shaders = {
    false: {
        vertex: colorsVertWGSL,
        fragment: colorsFragWGSL
    },
    true: {
        vertex: textureVertWGSL,
        fragment: textureFragWGSL
    }
}

const canvas = document.getElementById('gl-canvas');
let device = null;
let context = null;
let pipeline = null;
let verticesBuffer = null;
let uniformBindGroup = null;




/***************/
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
/***************/



const vertexArray = new Float32Array([
    // float4 position, float4 color,
    // there are itemsPerRow items in this row, that's why vertexSize is 4*itemsPerRow
    +1, +1, 0, 1, 1, 0, 0, 1, 1, 0,
    +1, -1, 0, 1, 0, 1, 0, 1, 1, 1,
    -1, -1, 0, 1, 0, 0, 1, 1, 0, 1,

    +1, +1, 0, 1, 1, 0, 0, 1, 1, 0,
    -1, -1, 0, 1, 0, 0, 1, 1, 0, 1,
    -1, +1, 0, 1, 1, 1, 0, 1, 0, 0,
]);

const vertexSize = vertexArray.BYTES_PER_ELEMENT * 10; // Byte size of ONE triangle data (vertex, color, uv). (one row)
const positionOffset = vertexArray.BYTES_PER_ELEMENT * 0;
const colorOffset = vertexArray.BYTES_PER_ELEMENT * 4; // Byte offset of triangle vertex color attribute.
const vertexCount = vertexArray.byteLength / vertexSize;
const UVOffset = vertexArray.BYTES_PER_ELEMENT * 8;



// const w = 1;
// const h = 1;
// const vertexArray = new Float32Array([
//     -w, -h, 0, 1, 1, 0, 0, 1,
//     -w, +h, 0, 0, 1, 0, 0, 1,
//     +w, -h, 1, 1, 1, 0, 0, 1,
//     +w, +h, 1, 0, 1, 0, 0, 1,
// ]);


// const vertexSize = vertexArray.BYTES_PER_ELEMENT * 8; // Byte size of ONE triangle data (vertex, color, uv). (one row)
// const positionOffset = vertexArray.BYTES_PER_ELEMENT * 0;
// const colorOffset = vertexArray.BYTES_PER_ELEMENT * 4; // Byte offset of triangle vertex color attribute.
// const vertexCount = vertexArray.byteLength / vertexSize;
// const UVOffset = vertexArray.BYTES_PER_ELEMENT * 2;


console.log('vertexArray.BYTES_PER_ELEMENT:', vertexArray.BYTES_PER_ELEMENT);
console.log('vertexArray.byteLength:', vertexArray.byteLength);
console.log('vertexCount  = vertexArray.byteLength / vertexSize:', vertexArray.byteLength / vertexSize);

console.log({ vertexSize, positionOffset, colorOffset, vertexCount, UVOffset });

async function init() {

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) { return; }
    device = await adapter.requestDevice();
    device.lost.then(info => {
        console.log(info);
    });

    if (canvas === null) return;
    context = canvas.getContext('webgpu');

    const devicePixelRatio = window.devicePixelRatio || 1;
    const presentationSize = [
        canvas.clientWidth * devicePixelRatio,
        canvas.clientHeight * devicePixelRatio,
    ];
    const presentationFormat = context.getPreferredFormat(adapter);

    context.configure({
        device,
        format: presentationFormat,
        size: presentationSize,
        compositingAlphaMode: 'premultiplied',
    });

    // Create a vertex buffer from the triangle data.
    verticesBuffer = device.createBuffer({
        size: vertexArray.byteLength,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(verticesBuffer.getMappedRange()).set(vertexArray);
    verticesBuffer.unmap();


    // enum GPUPrimitiveTopology {
    //     "point-list",
    //     "line-list",
    //     "line-strip",
    //     "triangle-list",
    //     "triangle-strip",
    // };

    pipeline = device.createRenderPipeline({
        layout: 'auto',
        primitive: { topology: 'triangle-strip' },
        vertex: {
            module: device.createShaderModule({
                code: shaders[useTexture].vertex,
            }),
            entryPoint: 'main', // shader function name

            buffers: [
                {
                    arrayStride: vertexSize,
                    //arrayStride: vertexArray.BYTES_PER_ELEMENT,
                    //arrayStride: vertexCount * vertexArray.BYTES_PER_ELEMENT,//vertexSize,
                    attributes: [
                        {
                            // position
                            shaderLocation: 0,
                            offset: positionOffset,
                            format: 'float32x4',
                        },
                        {
                            // colors
                            shaderLocation: 1,
                            offset: colorOffset,
                            format: 'float32x4',
                        },
                        {
                            // uv
                            shaderLocation: 2,
                            offset: UVOffset,
                            format: 'float32x2',
                        },
                    ],
                },
            ],
        },
        fragment: {
            module: device.createShaderModule({
                code: shaders[useTexture].fragment,
            }),
            entryPoint: 'main', // shader function name
            targets: [
                {
                    format: presentationFormat,

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
        primitive: {
            topology: 'triangle-list',
        },
    });

    // -- create texture


    if (useTexture) {
        const samp = device.createSampler({ minFilter: "linear", magFilter: "linear" });
        // Fetch the image and upload it into a GPUTexture.
        //let cubeTexture: GPUTexture;
        let cubeTexture;
        {
            const response = await fetch('./assets/old_king_600x600.jpg');
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob);

            cubeTexture = device.createTexture({
                size: [imageBitmap.width, imageBitmap.height, 1],
                format: 'rgba8unorm',
                usage:
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT,
            });
            device.queue.copyExternalImageToTexture(
                { source: imageBitmap },
                { texture: cubeTexture },
                [imageBitmap.width, imageBitmap.height]
            );
        }

        console.log(cubeTexture);

        uniformBindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
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


    // create texture --

    update();
}

function update() {
    stats.begin();

    // Sample is no longer the active page.
    if (!canvas) return;

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

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
    passEncoder.setPipeline(pipeline);
    if (useTexture) {
        passEncoder.setBindGroup(0, uniformBindGroup);
    }
    passEncoder.setVertexBuffer(0, verticesBuffer);

    /**
     * vertexCount: number The number of vertices to draw
     * instanceCount?: number | undefined The number of instances to draw
     * firstVertex?: number | undefined Offset into the vertex buffers, in vertices, to begin drawing from
     * firstInstance?: number | undefined First instance to draw
     */
    //passEncoder.draw(3, 1, 0, 0);
    passEncoder.draw(vertexCount);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);

    stats.end();
    requestAnimationFrame(update);
}

init();
