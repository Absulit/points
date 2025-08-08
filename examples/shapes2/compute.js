import { fnusin } from 'points/animation';
import { clearAlpha, soften4, soften8 } from 'points/effects';
import { sdfCircle, sdfLine2, sdfSegment } from 'points/sdf';

const compute = /*wgsl*/`

${soften8}
${soften4}
${clearAlpha}
${sdfSegment}
${sdfLine2}
${sdfCircle}
${fnusin}

// struct Colors{
//     // items: array< vec4f, 800*800 >
//     items: array< vec4f, 640000 >
// }

fn getPointsIndex(position:vec2<u32>) -> u32{
    return position.y + (position.x * u32(params.screen.x));
}

fn getColorAt(position:vec2<u32>) -> vec4f {
    let index:u32 = getPointsIndex(position);
    return points[index];
}

fn getColorsAroundLayer(position: vec2<u32>, distance: u32) -> array<  vec4f, 8  > {
    return array< vec4f,8 >(
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

fn getColorsAround4Layer(position: vec2<u32>, distance: u32) -> array<  vec4f, 4 > {
    return array< vec4f, 4 >(
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

const workgroupSize = 1;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let numColumns:f32 = params.screen.x;
    let numRows:f32 = params.screen.y;

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
    var colorsAround = array<  vec4f, 4  >();

    let nx = f32(GlobalId.x) / numColumns;
    let ny = f32(GlobalId.y) / numRows;
    let uv = vec2(nx,ny);
    let positionU = GlobalId.xy;

    let uIndex = getPointsIndex(positionU);
    // let rgba = &points[uIndex];
    // let a = sin(uv.x * params.time);
    // (*rgba) = vec4(a * uv.x, 1-uv.y, a, 1);

    rgba = points[uIndex];
    colorsAround = getColorsAround4Layer(positionU, 1);
    let rgbaP = &points[uIndex];

    (*rgbaP) = soften4(rgba, colorsAround, 1.);
    rgba = points[uIndex];
    (*rgbaP) = clearAlpha(rgba, 1000.01);
    if(rgba.a > 0){
        rgba -= .4;
    }
    (*rgbaP) = rgba;

    let sdf = sdfCircle(vec2f(1.,1.) * fnusin(1), .01, .2, uv);
    (*rgbaP) += sdf;


    rgba = points[uIndex];


    textureStore(outputTex, positionU, rgba);
}
`;

export default compute;
