import { brightness } from 'points/color';

const compute = /*wgsl*/`

struct Variable{
    init: i32
}

${brightness}

const distance:u32 = 1;
const workgroupSize = 8;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(in: ComputeIn) {
    let  in.WID = in.WID;
    //--------------------------------------------------
    let dims = textureDimensions(image);

    let numColumns = dims.x;
    let numRows = dims.y;

    let numColumnsPiece = numColumns / workgroupSize;
    let numRowsPiece = numRows / workgroupSize;

    var layerIndex = 0;
    if(variables.init == 0){

        for (var indexColumns:u32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
            let x = in.WID.x * numColumnsPiece + indexColumns;
            let nx = x / numColumns;
            for (var indexRows:u32 = 0; indexRows < numRowsPiece; indexRows++) {

                let y = in.WID.y * numRowsPiece + indexRows;
                let ny = y / numRows;
                let uv = vec2(nx,ny);

                let pointIndex = i32(y + (x * numColumns));

                var point = textureLoad(image, vec2(x,y), 0); // image
                //var point = textureLoad(image, vec2<i32>(ix,iy)); // video
                points[pointIndex] = point;
                // points[pointIndex] = point;
            }
        }



        // variables.init = 1;
    }else{
        layerIndex = 1;
    }



    //--------------------------------------------------

    for (var indexColumns:u32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
        let x = in.WID.x * numColumnsPiece + indexColumns;
        for (var indexRows:u32 = 0; indexRows < numRowsPiece; indexRows++) {

            let y = in.WID.y * numRowsPiece + indexRows;

            let pointIndex = i32(y + (x * numColumns));

            var point = points[pointIndex];
            let b = brightness(point);
            let newBrightness = step(.5, b); // if(b > .5){newBrightness = 1.;}

            let quant_error = b - newBrightness;

            point = vec4(newBrightness);

            points[pointIndex] = point;


            let pointIndexC = y + (x + distance) * numColumns;
            var rightPoint = points[pointIndexC];
            rightPoint = vec4(rightPoint.r + (.5 * quant_error * params.quantError));

            points[pointIndexC] = rightPoint;


            let pointIndexR = y + distance + (x * numColumns);
            var bottomPoint = points[pointIndexR];
            bottomPoint = vec4(bottomPoint.r + (.5 * quant_error * params.quantError));

            points[pointIndexR] = bottomPoint;

            point = points[pointIndex];
            let positionU = vec2u(x,y);
            textureStore(outputTex, positionU, point);
            storageBarrier();
        }
    }

}
`;

export default compute;
