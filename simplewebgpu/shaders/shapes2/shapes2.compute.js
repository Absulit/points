import { clearAlpha, sdfCircle, sdfLine2, sdfSegment, soften4, soften8 } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';

const shapes2Compute = /*wgsl*/`

${defaultStructs}

${soften8}
${soften4}
${clearAlpha}
${sdfSegment}
${sdfLine2}
${sdfCircle}

struct Colors{
    items: array< vec4<f32>, 800*800 >
}

fn getPointsIndex(position:vec2<u32>) -> u32{
    return position.y + (position.x * u32(params.screenWidth));
}

fn getColorAt(position:vec2<u32>) -> vec4<f32> {
    let index:u32 = getPointsIndex(position);
    return points[index];
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

@compute @workgroup_size(8,8,1)
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



    var x = 450.;
    var y = 450.;
    var index = u32(y + (x * numColumns));
    let point = &points[index];

    (*point) = vec4(1,0,0,1);


    x = 555.;
    y = 455.;
    index = u32(y + (x * numColumns));
    let point2 = &points[index];

    (*point2) = vec4(1,0,1,1);


    var rgba = vec4(0.);
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
            // let rgba = &points[uIndex];
            // let a = sin(uv.x * params.utime);
            // (*rgba) = vec4(a * uv.x, 1-uv.y, a, 1);

            rgba = points[uIndex];
            colorsAround = getColorsAround4Layer(positionU, 1);
            let rgbaP = &points[uIndex];

            (*rgbaP) = soften4(rgba, colorsAround, 1.);
            rgba = points[uIndex];
            (*rgbaP) = clearAlpha(rgba, 1.01);

            let sdf = sdfCircle(vec2<f32>(.3,.3), .1, 0., uv);
            (*rgbaP) += sdf;


            rgba = points[uIndex];


            textureStore(outputTex, positionU, rgba);
        }
    }






}
`;

export default shapes2Compute;
