import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import FlowFields from '../flowfields.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';
import SpriteLoader from '../spriteloader.js';
import { print } from '../utils.js';
import Particle from './Particle.js';


export default class EffectsTester {
    /**
     *
     * @param {Screen} screen
     */
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor(0, 0, 0);

        /*const is10K = (screen.numRows * screen.numColumns) == 10000
        if (!is10K) {
            throw ('this demo needs 10K items, so the recommended side should be 100')
        }
        if(screen._numMargin != 1){
            throw ('this demo needs 1px margin')
        }*/
        /*if (screen.layers.length != 3) {
            throw new Error(`This demo needs 3 layers to work`);
        }

        if (screen.numColumns != 800 && screen.numRows != 80) {
            throw new Error(`This demo needs 800x80`);
        }*/

        this._constant = screen.numColumns / 100;
        console.log('---- CONSTANT: ' + this._constant);

        this._red = new RGBAColor(1, 0, 0);
        this._orange = new RGBAColor(1, .5, 0);

        this._device = null;
        this._gpuReadBuffer = null;
        this._commandEncoder = null;
        this._resultMatrixBufferSize=0;
        this._resultMatrixBuffer = null;
        this._computePipeline = null;
        this._bindGroup = null;
        this._firstMatrix = null;
        this._secondMatrix = null;
        this._gpuBufferFirstMatrix = null;
        this._gpuBufferSecondMatrix = null;

        this._callUpdateWebGPU = false;

        this.init();
    }
    async init(){
        await this.initWebGPU();
        this._callUpdateWebGPU = true;
    }
    
    async initWebGPU() {

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) { return; }
        this._device = await adapter.requestDevice();


        // First Matrix

        this._firstMatrix = new Float32Array([
            2 /* rows */, 4 /* columns */,
            1, 2, 3, 4,
            5, 6, 7, 8
        ]);

        this._gpuBufferFirstMatrix = this._device.createBuffer({
            mappedAtCreation: true,
            size: this._firstMatrix.byteLength,
            usage: GPUBufferUsage.STORAGE,
        });
        const arrayBufferFirstMatrix = this._gpuBufferFirstMatrix.getMappedRange();
        new Float32Array(arrayBufferFirstMatrix).set(this._firstMatrix);
        this._gpuBufferFirstMatrix.unmap();


        // Second Matrix

        this._secondMatrix = new Float32Array([
            4 /* rows */, 2 /* columns */,
            1, 2,
            3, 4,
            5, 6,
            7, 8
        ]);

        this._gpuBufferSecondMatrix = this._device.createBuffer({
            mappedAtCreation: true,
            size: this._secondMatrix.byteLength,
            usage: GPUBufferUsage.STORAGE,
        });
        const arrayBufferSecondMatrix = this._gpuBufferSecondMatrix.getMappedRange();
        new Float32Array(arrayBufferSecondMatrix).set(this._secondMatrix);
        this._gpuBufferSecondMatrix.unmap();


        // Result Matrix

        this._resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * (2 + this._firstMatrix[0] * this._secondMatrix[1]);
        this._resultMatrixBuffer = this._device.createBuffer({
            size: this._resultMatrixBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });


        // COMPUTE SHADER WGSL
        const shaderModule = this._device.createShaderModule({
            code: /* wgsl */`
              struct Matrix {
                size : vec2<f32>,
                numbers: array<f32>,
              }

              @group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
              @group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
              @group(0) @binding(2) var<storage, read_write> resultMatrix : Matrix;

              @compute @workgroup_size(8, 8)
              fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
                // Guard against out-of-bounds work group sizes
                if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
                  return;
                }

                resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);

                let resultCell = vec2(global_id.x, global_id.y);
                var result = 0.0;
                for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
                  let a = i + resultCell.x * u32(firstMatrix.size.y);
                  let b = resultCell.y + i * u32(secondMatrix.size.y);
                  result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
                }

                let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
                resultMatrix.numbers[index] = result;
              }
            `
        });


        // Describe the compute operation
        // takes bind group layout and the compute shader `shaderModule`
        this._computePipeline = this._device.createComputePipeline({
            /*layout: this._device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            }),*/
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: "main"
            }
        });







        //await this.updateWebGPU();

    }

    async updateWebGPU() {
        // bind group is the data itself
        // we tell the GPU the expected data defined in the layout
        this._bindGroup = this._device.createBindGroup({
            //layout: bindGroupLayout,
            layout: this._computePipeline.getBindGroupLayout(0 /* index */),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this._gpuBufferFirstMatrix
                    }
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this._gpuBufferSecondMatrix
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this._resultMatrixBuffer
                    }
                }
            ]
        });


        // Dispatch to GPU
        this._commandEncoder = this._device.createCommandEncoder();

        const passEncoder = this._commandEncoder.beginComputePass();
        passEncoder.setPipeline(this._computePipeline);
        passEncoder.setBindGroup(0, this._bindGroup);
        const workgroupCountX = Math.ceil(this._firstMatrix[0] / 8);
        const workgroupCountY = Math.ceil(this._secondMatrix[1] / 8);
        passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
        passEncoder.end();



        // ------------
        // Get a GPU buffer for reading in an unmapped state.
        // (unmapped because this is happening on the GPU side, not Javascript)
        this._gpuReadBuffer = this._device.createBuffer({
            size: this._resultMatrixBufferSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });

        // Encode commands for copying buffer to buffer.
        this._commandEncoder.copyBufferToBuffer(
            this._resultMatrixBuffer /* source buffer */,
            0 /* source offset */,
            this._gpuReadBuffer /* destination buffer */,
            0 /* destination offset */,
            this._resultMatrixBufferSize /* size */
        );
        // Submit GPU commands.
        const gpuCommands = this._commandEncoder.finish();
        this._device.queue.submit([gpuCommands]);


        let arrayBuffer = null;
        try {
            
            await this._gpuReadBuffer.mapAsync(GPUMapMode.READ);
            arrayBuffer = this._gpuReadBuffer.getMappedRange();
        } catch (error) {
            //console.log(error);
        }finally{

            console.log(new Float32Array(arrayBuffer));
        }
    }



    // sdfCircle(position, currentPosition, percent){
    //     let d = distance( currentPosition, position) / screenSize.numColumns;
    //     return d < percent;
    // }

    async update({ usin, ucos, side, utime, nusin, fnusin }) {
        const screen = this._screen;

        this._callUpdateWebGPU && await this.updateWebGPU();

        screen.layerIndex = 1;//--------------------------- LAYER 1
        screen.clear(this._clearMixColor);

        screen.points.forEach(point => {
            let d = MathUtil.distance(point.coordinates, { x: 35 * this._constant, y: screen.center.y }) / side;

            if (d < .1 + .1 * fnusin(2)) {
                point.modifyColor(color => {
                    color.set(1, 0, 0);
                });
            }
        });

        // const point = screen.getPointAt(50,50);
        // point.modifyColor(color => color.set(1,1,0));
        // const point2 = screen.getPointAt(40,60);
        // point2.modifyColor(color => color.set(1,1,0));
        // this._screen.drawLineWithPoints(point2, point);

        // screen.drawLine(0,0, 50,50, this._red);
        // screen.drawCircle(50,50, 1 + 10 * fnusin(2), 1,0,0);
        // screen.drawPolygon(50, 50, 30, 3, this._orange, 180 * fnusin(2.144));


        // const point = screen.getPointAt(screen.center.x, Math.floor( side * fnusin(3.14)));
        // point && point.modifyColor(color => {
        //     color.set(1, 1, 1);
        // });


        // screen.layerIndex = 0;//--------------------------- LAYER 1
        // screen.clear(this._clearMixColor);
        // screen.points.forEach(point => {
        //     let d = MathUtil.distance(point.coordinates, { x: 55 * this._constant, y: screen.center.y }) / side;

        //     if (d < .1 + .1 * fnusin(2.1)) {
        //         point.modifyColor(color => {
        //             color.set(1, 1, 1, 1);
        //         });
        //     }
        // });



        //screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.layerIndex = 3;//--------------------------- LAYER 3

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(30);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.01);
        //this._effects.orderedDithering();
    }


}
