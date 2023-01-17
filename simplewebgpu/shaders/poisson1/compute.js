import { brightness } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';
import { rand } from '../random.js';
import { Point } from './utils.js';

const compute = /*wgsl*/`

${defaultStructs}
${Point}


struct Variable{
    init: i32,
    activeIndex: i32,
    lastRandom: f32,
}

${brightness}
${rand}

const workgroupSize = 8;


@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    _ = params.utime;



    _ = points[0];

    //--------------------------------------------------
    let dims = textureDimensions(image);

    let numColumns:f32 = params.screenWidth;
    let numRows:f32 = params.screenHeight;
    //let constant = u32(numColumns) / 93u;

    let numColumnsPiece:i32 = i32(numColumns / f32(workgroupSize));
    let numRowsPiece:i32 = i32(numRows / f32(workgroupSize));

    var layerIndex = 0;
    if(variables.init == 0){
        rand_seed.y = fract(params.epoch);
        rand();
        let point = Point(rand_seed.x, rand_seed.y, 2, 1);

        points[0] = point;




        variables.init = 1;
    }else{
        layerIndex = 1;
    }








    //--------------------------------------------------




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

            let pointIndex = i32(x + (y * numColumns));

            var point = textureLoad(image, vec2<i32>(ix,iy), 0); // image
            //var point = textureLoad(image, vec2<i32>(ix,iy) * factor); // video
            // layers[0][pointIndex] = point;
            // layers[1][pointIndex] = point;

            let positionU = vec2<u32>(ux,uy);
            textureStore(outputTex, positionU, point);
        }
    }


}
`;

export default compute;
