'use strict';
// import triangleVertWGSL from './shaders/triangle.vert.wgsl';
// import redFragWGSL from './shaders/red.frag.wgsl';
import { getShaderSource } from './shader_loader.js';

const triangleVertWGSL = await getShaderSource('./shaders/triangle3_1.vert.wgsl');
const redFragWGSL = await getShaderSource('./shaders/red3_1.frag.wgsl');

const canvas = document.getElementById('gl-canvas');
let device = null
let context = null
let pipeline = null

/***************/
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
/***************/


async function init() {

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) { return; }
    device = await adapter.requestDevice();

    if (canvas === null) return;
    context = canvas.getContext('webgpu');

    const devicePixelRatio = window.devicePixelRatio || 1;
    const presentationSize = [
        canvas.clientWidth * devicePixelRatio,
        canvas.clientHeight * devicePixelRatio,
    ];
    const presentationFormat = context.getPreferredFormat(adapter);

    presentationFormat

    context.configure({
        device,
        format: presentationFormat,
        size: presentationSize,
        compositingAlphaMode: 'premultiplied',
    });

    pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: triangleVertWGSL,
            }),
            entryPoint: 'main', // shader function name
        },
        fragment: {
            module: device.createShaderModule({
                code: redFragWGSL,
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
    /**
     * vertexCount: number The number of vertices to draw
     * instanceCount?: number | undefined The number of instances to draw
     * firstVertex?: number | undefined Offset into the vertex buffers, in vertices, to begin drawing from
     * firstInstance?: number | undefined First instance to draw
     */
    //passEncoder.draw(3, 1, 0, 0);
    passEncoder.draw(3);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);

    stats.end();
    requestAnimationFrame(update);
}

init();
