'use strict';
import { print } from '../js/utils.js';
import WebGPU, { VertexBufferInfo } from './js/absulit.webgpu.module.js';
import RGBAColor from './js/color.js';
import Coordinate from './js/coordinate.js';
/***************/
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let capturer = new CCapture({
    format: 'webm',
    //timeLimit: 10,
    verbose: true
});
/***************/



/*const vertexArray = new Float32Array([
    // float4 position, float4 color,
    // there are itemsPerRow items in this row, that's why vertexSize is 4*itemsPerRow
    -1, +1, 0, 1, 1, 1, 0, 1, 0, 0,// top left
    +1, +1, 0, 1, 1, 0, 0, 1, 1, 0,// top right
    -1, -1, 0, 1, 0, 0, 1, 1, 0, 1,// bottom left

    +1, +1, 0, 1, 1, 0, 0, 1, 1, 0,// top right
    +1, -1, 0, 1, 0, 1, 0, 1, 1, 1,// bottom right
    -1, -1, 0, 1, 0, 0, 1, 1, 0, 1,// bottom left

]);*/


const webGPU = new WebGPU('gl-canvas');
webGPU.useTexture = false;

let utime = 0;

let side = 744;
let numColumns = side;
let numRows = side;

let shaderModule;


async function init() {
    const initialized = await webGPU.init();
    if (initialized) {
        //webGPU.createVertexBuffer(vertexArray);
        // COMPUTE SHADER WGSL
        shaderModule = webGPU._device.createShaderModule({
            code: /* wgsl */`

            var<private> rand_seed : vec2<f32>;

            fn rand() -> f32 {
              rand_seed.x = fract(cos(dot(rand_seed, vec2<f32>(23.14077926, 232.61690225))) * 136.8168);
              rand_seed.y = fract(cos(dot(rand_seed, vec2<f32>(54.47856553, 345.84153136))) * 534.7645);
              return rand_seed.y;
            }

            

            struct Vertex {
                position: array<f32,4>,
                color: array<f32,4>,
                uv: array<f32,2>,
            }

            struct Screen{
                size: vec2<f32>,
                points: array<f32>
            }

            struct ScreenSize {
                numRows: f32,
                numColumns: f32,
                uTime: f32
            }

            struct Point {
                vertex0: Vertex,
                vertex1: Vertex,
                vertex2: Vertex,
                vertex3: Vertex,
                vertex4: Vertex,
                vertex5: Vertex,
            }

            struct Points{
                points: array<Point>
            }

            fn fusin(speed:f32, utime:f32) -> f32{
                return (sin(utime * speed) + 1) * .5;
            }

            @group(0) @binding(0) var<storage, read> firstMatrix : array<f32>;
            @group(0) @binding(1) var<storage, read_write> resultMatrix : Points;
            @group(0) @binding(2) var<storage, read> screenSize : ScreenSize;

            @compute @workgroup_size(8,8)
            fn main(
                    @builtin(global_invocation_id) GlobalId : vec3<u32>,
                    @builtin(workgroup_id) WorkGroupID : vec3<u32>,
                    @builtin(local_invocation_id) LocalInvocationID : vec3<u32>
                ) {

                let longvarname  = firstMatrix[0];
                //resultMatrix[0] = -1;
                // let b = secondMatrix.size.x;

                let numColumns:f32 = screenSize.numColumns;
                let numRows:f32 = screenSize.numRows;



                var indexC:i32 = 0;
                for(var indexColumns: i32 = 0; indexColumns < i32(screenSize.numColumns/8); indexColumns++) {
                    for(var indexRows: i32 = 0; indexRows < i32(screenSize.numRows/8); indexRows++) {

                        let x:f32 = f32(WorkGroupID.x) * screenSize.numColumns/8 + f32(indexColumns);
                        let y:f32 = f32(WorkGroupID.y) * screenSize.numRows/8 + f32(indexRows);

                        let index:f32 = y  + (x * screenSize.numColumns);
                        //let index:f32 = (x + f32(LocalInvocationID.x) * 2);
                        indexC = i32(index);
                        //indexC = i32(WorkGroupID.x + WorkGroupID.y);

                        let indexSin = sin( y * x  * screenSize.uTime * .00001);
                        let indexCos = 1 - cos( y * x  * screenSize.uTime * .00002);
                        let indexTan = tan(index * screenSize.uTime * .003);
                        let z = fusin(1, screenSize.uTime * .1 * x) * fusin(1, screenSize.uTime*.1* y);

                        //let color = array<f32,4>(z,0,0,1);
                        let color = array<f32,4>(indexSin,indexCos,0,1);
                        resultMatrix.points[indexC].vertex0.color = color;
                        resultMatrix.points[indexC].vertex1.color = color;
                        resultMatrix.points[indexC].vertex2.color = color;
                        resultMatrix.points[indexC].vertex3.color = color;
                        resultMatrix.points[indexC].vertex4.color = color;
                        resultMatrix.points[indexC].vertex5.color = color;
                    }
                }
            }

        `
        });

        webGPU._shaderModule = shaderModule;
        await webGPU.createScreen(numColumns, numRows);
    }
    await update();
}

async function update() {
    stats.begin();
    utime += 1 / 60;

    webGPU._screenSizeArray[2] = utime;
    webGPU.update();

    stats.end();

    capturer.capture(document.getElementById('gl-canvas'));
    requestAnimationFrame(update);
}

init();


let downloadBtn = document.getElementById('downloadBtn');
let started = false;
downloadBtn.addEventListener('click', onClickDownloadButton);
let buttonTitle = downloadBtn.textContent;
function onClickDownloadButton(e) {
    started = !started;
    if (started) {
        // start
        capturer.start();
        downloadBtn.textContent = 'RECORDING (STOP)';
    } else {
        downloadBtn.textContent = buttonTitle;
        // stop and download
        capturer.stop();
        // default save, will download automatically a file called {name}.extension (webm/gif/tar)
        capturer.save();
    }
}
