import { brightness } from 'points/color';

const compute = /*wgsl*/`

struct Variable{
    init: i32
}

${brightness}

const distance:u32 = 1;
const workgroupSize = 8;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    //--------------------------------------------------
    let dims = textureDimensions(image);

    let numColumns = dims.x;
    let numRows = dims.y;

    let numColumnsPiece = numColumns / workgroupSize;
    let numRowsPiece = numRows / workgroupSize;

    var layerIndex = 0;
    if(variables.init == 0){

        for (var indexColumns:u32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
            let x = WorkGroupID.x * numColumnsPiece + indexColumns;
            let nx = x / numColumns;
            for (var indexRows:u32 = 0; indexRows < numRowsPiece; indexRows++) {

                let y = WorkGroupID.y * numRowsPiece + indexRows;
                let ny = y / numRows;
                let uv = vec2(nx,ny);

                let pointIndex = i32(y + (x * numColumns));

                var point = textureLoad(image, vec2(x,y), 0); // image
                //var point = textureLoad(image, vec2<i32>(ix,iy)); // video
                layers[0][pointIndex] = point;
                layers[1][pointIndex] = point;
            }
        }



        // variables.init = 1;
    }else{
        layerIndex = 1;
    }



    //--------------------------------------------------

    for (var indexColumns:u32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
        let x = WorkGroupID.x * numColumnsPiece + indexColumns;
        let nx = x / numColumns;
        for (var indexRows:u32 = 0; indexRows < numRowsPiece; indexRows++) {

            let y = WorkGroupID.y * numRowsPiece + indexRows;
            let ny = y / numRows;
            let uv = vec2(nx,ny);

            let pointIndex = i32(y + (x * numColumns));

            var point = layers[layerIndex][pointIndex];
            let b = brightness(point);
            let newBrightness = step(.5, b); // if(b > .5){newBrightness = 1.;}

            let quant_error = b - newBrightness;

            point = vec4(newBrightness);

            layers[layerIndex][pointIndex] = point;


            let pointIndexC = y + (x + distance) * numColumns;
            var rightPoint = layers[layerIndex][pointIndexC];
            rightPoint = vec4(rightPoint.r + (.5 * quant_error * params.quantError));

            layers[layerIndex][pointIndexC] = rightPoint;


            let pointIndexR = y + distance + (x * numColumns);
            var bottomPoint = layers[layerIndex][pointIndexR];
            bottomPoint = vec4(bottomPoint.r + (.5 * quant_error * params.quantError));

            layers[layerIndex][pointIndexR] = bottomPoint;

            point = layers[layerIndex][pointIndex];
            let positionU = vec2u(x,y);
            textureStore(outputTex, positionU, point);
            storageBarrier();
        }
    }

}
`;

export default compute;
