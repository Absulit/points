import { clearAlpha, clearMix, fnusin, fucos, fusin, polar, sdfCircle, sdfLine2, sdfSegment, soften4, soften8 } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';

const compute = /*wgsl*/`

${defaultStructs}

${soften8}
${soften4}
${clearAlpha}
${clearMix}
${sdfSegment}
${sdfLine2}
${sdfCircle}
${polar}
${fusin}
${fucos}
${fnusin}

fn getPointsIndex(position:vec2<u32>) -> u32{
    return position.y + (position.x * u32(params.screenWidth));
}

fn getColorAt(position:vec2<u32>) -> vec4<f32> {
    let index:u32 = getPointsIndex(position);
    return layers[0][index];
}

fn getColorsAroundLayer(position: vec2<u32>, distance: u32) -> array<  vec4<f32>, 8  > {
    return array< vec4<f32>,8 >(
        getColorAt( vec2<u32>( position.x-distance, position.y-distance  ) ).rgba,
        getColorAt( vec2<u32>( position.x, position.y-distance  ) ).rgba,
        getColorAt( vec2<u32>( position.x+distance, position.y-distance  ) ).rgba,
        getColorAt( vec2<u32>( position.x-distance, position.y  ) ).rgba,
        getColorAt( vec2<u32>( position.x+distance, position.y  ) ).rgba,
        getColorAt( vec2<u32>( position.x-distance, position.y+distance  ) ).rgba,
        getColorAt( vec2<u32>( position.x, position.y+distance  ) ).rgba,
        getColorAt( vec2<u32>( position.x+distance, position.y+distance  ) ).rgba,
    );
}

fn getColorsAround4Layer(position: vec2<u32>, distance: u32) -> array<  vec4<f32>, 4 > {
    return array< vec4<f32>, 4 >(
        //getColorAt( vec2<u32>( position.x-distance, position.y-distance  ) ).rgba,
        getColorAt( vec2<u32>( position.x, position.y-distance  ) ).rgba,
        //getColorAt( vec2<u32>( position.x+distance, position.y-distance  ) ).rgba,
        getColorAt( vec2<u32>( position.x-distance, position.y  ) ).rgba,
        getColorAt( vec2<u32>( position.x+distance, position.y  ) ).rgba,
        //getColorAt( vec2<u32>( position.x-distance, position.y+distance  ) ).rgba,
        getColorAt( vec2<u32>( position.x, position.y+distance  ) ).rgba,
        //getColorAt( vec2<u32>( position.x+distance, position.y+distance  ) ).rgba,
    );
}

const workgroupSize = 8;
const radius = 10;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let utime = params.utime;

    let numColumns:f32 = params.screenWidth;
    let numRows:f32 = params.screenHeight;
    let numColumnsPiece:i32 = i32(numColumns / f32(workgroupSize));
    let numRowsPiece:i32 = i32(numRows / f32(workgroupSize));
    //let constant = u32(numColumns) / 93u;



    var x = params.screenWidth*.5;
    var y = params.screenHeight*.5;
    // var index = u32(y + (x * numColumns));
    // let point = &points[index];


    var rgba = vec4(0.);

    let totalAngle = 360.;
    let totalAnglePiece = totalAngle / f32(workgroupSize);

    for (var angleIndex:f32 = 0; angleIndex < totalAnglePiece; angleIndex += .1) {
        let angle:f32 = f32(WorkGroupID.x) * f32(totalAnglePiece) + f32(angleIndex);

        let rads = radians(angle);
        let pointFromCenter = polar(radius * fusin(1) * fucos(1) * angle / (100 / numColumns * 40), rads / fusin(1));

        ///////
        let positionU = vec2<u32>(u32(pointFromCenter.x + x), u32(pointFromCenter.y + y));

        let uIndex = getPointsIndex(positionU);
        let rgbaP = &layers[0][uIndex];
        (*rgbaP) = vec4(1);

        //rgba = points[uIndex];
    }
    //workgroupBarrier();






    var colorsAround = array<  vec4<f32>, 4  >();
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

            let positionU = vec2<u32>(ux,uy);

            let uIndex = getPointsIndex(positionU);


            rgba = layers[0][uIndex];
            let rgbaP = &layers[0][uIndex];

            colorsAround = getColorsAround4Layer(positionU, 1);

            (*rgbaP) = soften4(rgba, colorsAround, 1.);
            rgba = layers[0][uIndex];
            //(*rgbaP) = clearAlpha(rgba, 10.01);
            (*rgbaP) = clearMix(rgba, 1.01);

            rgba = layers[0][uIndex];

            textureStore(outputTex, positionU, rgba);
        }
    }








}
`;

export default compute;
