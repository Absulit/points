import { brightness } from '../../src/shaders/defaultFunctions.js';

const compute = /*wgsl*/`

struct Variable{
    init: i32
}

${brightness}

const workgroupSize = 8;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    _ = params.time;





    //--------------------------------------------------
    let dims = textureDimensions(image);

    let numColumns:f32 = f32(dims.x);
    let numRows:f32 = f32(dims.y);
    //let constant = u32(numColumns) / 93u;

    let numColumnsPiece:i32 = i32(numColumns / f32(workgroupSize));
    let numRowsPiece:i32 = i32(numRows / f32(workgroupSize));

    var layerIndex = 0;
    if(variables.init == 0){

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
                let uv = vec2(nx,ny);

                let pointIndex = i32(y + (x * numColumns));

                var point = textureLoad(image, vec2<i32>(ix,iy), 0); // image
                //var point = textureLoad(image, vec2<i32>(ix,iy)); // video
                layers[0][pointIndex] = point;
                layers[1][pointIndex] = point;
            }
        }



        //variables.init = 1;
    }else{
        layerIndex = 1;
    }



    //--------------------------------------------------
    // workgroupBarrier();

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
            let uv = vec2(nx,ny);

            let pointIndex = i32(y + (x * numColumns));

            var point = layers[layerIndex][pointIndex];
            let b = brightness(point);
            var newBrightness = 0.;
            if(b > .5){
                newBrightness = 1.;
            }

            let quant_error = b - newBrightness;
            let distance = 1;
            let distanceU = u32(distance);
            let distanceF = f32(distance);
            point = vec4(newBrightness);

            let pointP = &layers[layerIndex][pointIndex];
            (*pointP) = point;

            //let positionU = vec2<u32>(ux,uy);
            //textureStore(outputTex, positionU, point);

            //color.brightness = rightPoint.color.brightness + (.5 * quant_error)
            // if( (ix+distance) < numColumnsPiece){
                let pointIndexC = i32(y + ((x+distanceF) * numColumns));
                var rightPoint = layers[layerIndex][pointIndexC];
                rightPoint = vec4(brightness(rightPoint) + (.5 * quant_error));

                let pointPC = &layers[layerIndex][pointIndexC];
                (*pointPC) = rightPoint;
                //textureStore(outputTex, positionU + vec2(distanceU,0), rightPoint);

            // }

            // if( (iy+distance) < numRowsPiece ){
                let pointIndexR = i32((y+distanceF) + (x * numColumns));
                var bottomPoint = layers[layerIndex][pointIndexR];
                bottomPoint = vec4(brightness(bottomPoint) + (.5 * quant_error));

                let pointPR = &layers[layerIndex][pointIndexR];
                (*pointPR) = bottomPoint;
                //textureStore(outputTex, positionU + vec2(0,distanceU), bottomPoint);
            // }

            point = layers[layerIndex][pointIndex];
            let positionU = vec2<u32>(ux,uy);
            textureStore(outputTex, positionU, point);

        }
    }
    //--------------------------------------------------
    //workgroupBarrier();

    // for (var indexColumns:i32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
    //     let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
    //     let ux = u32(x);
    //     let ix = i32(x);
    //     let nx = x / numColumns;
    //     for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

    //         let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
    //         let uy = u32(y);
    //         let iy = i32(y);
    //         let ny = y / numRows;
    //         let uv = vec2(nx,ny);

    //         let pointIndex = i32(y + (x * numColumns));


    //         let point = layers[0][pointIndex];
    //         let positionU = vec2<u32>(ux,uy);
    //         textureStore(outputTex, positionU, point);

    //     }
    // }





}
`;

export default compute;
