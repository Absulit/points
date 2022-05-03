'use strict';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

async function init() {

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) { return; }
    const device = await adapter.requestDevice();

    console.log(device);



    // Get a GPU buffer in a mapped state and an arrayBuffer for writing.
    const gpuWriteBuffer = device.createBuffer({
        mappedAtCreation: true,
        size: 4,
        usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
        label: 'gpuWriteBuffer'
    });
    const arrayBuffer = gpuWriteBuffer.getMappedRange();


    // Write bytes to buffer.
    new Uint8Array(arrayBuffer).set([0, 1, 2, 3]);

    console.log(arrayBuffer);

    //At this point, the GPU buffer is mapped, meaning it is owned by the CPU, 
    //and it's accessible in read/write from JavaScript. So that the GPU can access it,
    //it has to be unmapped which is as simple as calling `gpuBuffer.unmap()`.

    // Unmap buffer so that it can be used later for copy.
    gpuWriteBuffer.unmap();


    // Get a GPU buffer for reading in an unmapped state.
    const gpuReadBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        label: 'gpuReadBuffer'
    });

    console.log(gpuReadBuffer);


    // Encode commands for copying buffer to buffer.
    const copyEncoder = device.createCommandEncoder();
    copyEncoder.copyBufferToBuffer(
        gpuWriteBuffer /* source buffer */,
        0 /* source offset */,

        gpuReadBuffer /* destination buffer */,
        0 /* destination offset */,

        4 /* size */
    );

    // Submit copy commands.
    const copyCommands = copyEncoder.finish();
    device.queue.submit([copyCommands]);

    // Read buffer.
    await gpuReadBuffer.mapAsync(GPUMapMode.READ);
    const copyArrayBuffer = gpuReadBuffer.getMappedRange();
    console.log(new Uint8Array(copyArrayBuffer));
    console.log(copyArrayBuffer);



}

function update() {

}


init();
update();