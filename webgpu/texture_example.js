// Image texture example for WebGPU API for Chrome-100: https://www.w3.org/TR/webgpu/

import { getShaderSource } from './shader_loader.js';


const triangleVertWGSL = await getShaderSource('./shaders/texture_example.vert.wgsl');
const redFragWGSL = await getShaderSource('./shaders/texture_example.frag.wgsl');

const canvas = document.getElementById('gl-canvas');
let device = null;
let context = null;
let pipeline = null;
let verticesBuffer = null;
let uniformBindGroup = null;

const vertexSize = 4 * 8; // Byte size of one triangle vertex.
const positionOffset = 0;
const colorOffset = 4 * 4; // Byte offset of triangle vertex color attribute.
const vertexCount = 4;
const UVOffset = 4 * 8;


async function init() {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) { return; }
    device = await adapter.requestDevice();
    device.lost.then((info) => {
        console.log(info);
    });

    if (canvas === null) return;
    context = canvas.getContext('webgpu');

    const devicePixelRatio = window.devicePixelRatio || 1;
    const presentationSize = [
        canvas.clientWidth * devicePixelRatio,
        canvas.clientHeight * devicePixelRatio,
    ];
    const format = context.getPreferredFormat(adapter);

    context.configure({
        device,
        format: format,
        size: presentationSize,
        compositingAlphaMode: 'premultiplied',
    });

    /////
    // prepare image

    const response = await fetch('./assets/old_king_600x600.jpg');
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);


    const max = Math.max(bitmap.width, bitmap.height);
    const [w, h] = [bitmap.width / max, bitmap.height / max];

    // triangle-strip square: 4-(x,y, u, v); top-left: (u,v)=(0,0)
    const square = new Float32Array([
        -w, -h, 0, 1,
        -w, +h, 0, 0,
        +w, -h, 1, 1,
        +w, +h, 1, 0,
    ]);
    verticesBuffer = device.createBuffer({ size: square.byteLength, usage: GPUBufferUsage.VERTEX, mappedAtCreation: true });
    new Float32Array(verticesBuffer.getMappedRange()).set(square);
    verticesBuffer.unmap();
    const stride = {
        arrayStride: 4 * square.BYTES_PER_ELEMENT,
        attributes: [
            { shaderLocation: 0, offset: 0, format: "float32x2" },
            { shaderLocation: 1, offset: 2 * square.BYTES_PER_ELEMENT, format: "float32x2" },
        ]
    };


    // texture and sampler
    const samp = device.createSampler({ minFilter: "linear", magFilter: "linear" });
    const tex = device.createTexture({
        format: "rgba8unorm", size: [bitmap.width, bitmap.height],
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    device.queue.copyExternalImageToTexture(
        { source: bitmap },
        { texture: tex },
        [bitmap.width, bitmap.height]
    );

    // pipeline
    pipeline = device.createRenderPipeline({
        layout: 'auto',
        primitive: { topology: "triangle-strip" },
        vertex: {
            module: device.createShaderModule({ code: triangleVertWGSL }),
            entryPoint: "main",
            buffers: [stride]
        },
        fragment: {
            module: device.createShaderModule({ code: redFragWGSL }),
            entryPoint: "main",
            targets: [{ format }]
        },
    });

    // bind group
    const bindGroupLayout = pipeline.getBindGroupLayout(0);
    uniformBindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
            { binding: 0, resource: samp },
            { binding: 1, resource: tex.createView() },
        ]
    });



    update();
}

// render
function update() {
    // Sample is no longer the active page.
    if (!canvas) return;

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPass = {
        colorAttachments: [
            {
                view: textureView,
                loadOp: "clear",
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                storeOp: "store"
            }
        ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPass);
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, uniformBindGroup);
    passEncoder.setVertexBuffer(0, verticesBuffer);
    passEncoder.draw(vertexCount, 1);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(update);
};

init();