import { PI } from '../defaultConstants.js';
import { brightness, fnusin, polar } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';
import { snoise } from '../noise2d.js';
import { rand } from '../random.js';

const noise2Compute = /*wgsl*/`

${defaultStructs}

struct Point{
    position: vec2<f32>,
    prev: vec2<f32>,
}

struct Variable{
    initialized: i32,
    indexPoints: i32,
}

${rand}
${brightness}
${polar}
${PI}
${snoise}
${fnusin}

const workgroupSize = 8;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let utime = params.utime;
    let epoch = params.epoch;
    //let dims : vec2<u32> = textureDimensions(feedbackTexture, 0);
    _ = points[0];

    let ratioX = params.screenWidth / params.screenHeight;
    let ratioY = 1 / ratioX / (params.screenHeight / params.screenWidth);
    let ratio = vec2(ratioX, ratioY);


        //--------------------------------------------------
        let numColumns:f32 = params.screenWidth;
        let numRows:f32 = params.screenHeight;
        //let constant = u32(numColumns) / 93u;

        let numColumnsPiece:i32 = i32(numColumns / f32(workgroupSize));
        let numRowsPiece:i32 = i32(numRows / f32(workgroupSize));

        for (var indexColumns:i32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
            let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
            let ux = u32(x);
            // let ix = i32(x);
            let nx = x / numColumns;
            for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

                let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
                let uy = u32(y);
                // let iy = i32(y);
                let ny = y / numRows;
                let uv = vec2(nx,ny);

                let pointIndex = i32(y + (x * numColumns));

                // var n1 = snoise(uv * 15 * params.sliderA + 10 * .033 ); //fnusin(.01)
                // n1 = (n1+1) * .5;
                let n1 = snoise(uv * 200 * params.sliderA + 10 * fnusin(.01));
                // let n2 = snoise(uv * 200 * params.sliderB + 10 * fnusin(.02));
                // let n3 = snoise(uv * 200 * params.sliderC + 10 * fnusin(.03));
                // let n4 = fract(n1 * n2 + n3);


                let pointP = &layers[0][pointIndex];
                (*pointP) = vec4(n1);

                let positionU = vec2<u32>(ux,uy);
                textureStore(outputTex, positionU, vec4(n1));
            }
        }
        //--------------------------------------------------



    if(variables.initialized == 0){
        // rand_seed = vec2(1, .1);
        // for(var pointIndex = 0; pointIndex < i32(params.numPoints); pointIndex++){
        //     let pointP = &points[pointIndex];
        //     rand();
        //     (*pointP).position = rand_seed * ratio;
        // }

        //-----------------------
        //-----------------------

        variables.initialized = 1;
    }else{

        rand_seed = vec2( f32(variables.indexPoints), fract(epoch) + .01);

        for(var indexLineAmount = 0; indexLineAmount < i32(params.lineAmount); indexLineAmount++){

            if(variables.indexPoints < i32(params.numPoints)){
                let pointP = &points[variables.indexPoints];
                rand();
                (*pointP).position = rand_seed * ratio;
            }else{
                let pointP = &points[variables.indexPoints];
                variables.indexPoints = 0;
                // (*pointP).position = vec2(0,0);
                // (*pointP).prev = vec2(0,0);
            }
            variables.indexPoints++;
        }



        let numColumns:f32 = sqrt(params.numPoints);
        let numRows:f32 = sqrt(params.numPoints);
        //let constant = u32(numColumns) / 93u;

        let numColumnsPiece:i32 = i32(numColumns / f32(workgroupSize));
        let numRowsPiece:i32 = i32(numRows / f32(workgroupSize));

        for (var indexColumns:i32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
            let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
            let ux = u32(x);
            let ix = i32(x);
            let nx = x / numColumns;
            for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

                let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
                let uy = u32(y);
                let iy = i32(y);
                let ny = y / numRows;

                let pointIndex = i32(y + (x * numColumns));

                let pointP = &points[pointIndex];
                let iPosition = vec2<i32>( i32((*pointP).position.x * params.screenWidth),  i32((*pointP).position.y * params.screenHeight));
                //rand();

                //var rgba = textureLoad(feedbackTexture, iPosition, 0);
                var rgba = layers[0][ iPosition.y + (iPosition.x * i32(params.screenWidth)) ];

                let b = brightness(rgba);
                //let b = rgba.g;

                let mathpoint = polar(.01, b * PI * 2. * params.sliderB);

                (*pointP).prev = (*pointP).position;


                (*pointP).position.x += mathpoint.x;
                (*pointP).position.y += mathpoint.y;


            }
        }


    }

}
`;

export default noise2Compute;
