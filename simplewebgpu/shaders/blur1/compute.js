import { clearMix, fnusin, getColorsAroundTexture, soften8 } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';

const compute = /*wgsl*/`

${defaultStructs}

struct Variables{
    particlesCreated: f32,
    testValue: f32
}

struct Chemical{
    a: f32,
    b: f32
}

struct Particles{
    chemicals: array<Chemical>
}

${clearMix}
${getColorsAroundTexture}
${soften8}
${fnusin}

const workgroupSize = 8;

//'function', 'private', 'push_constant', 'storage', 'uniform', 'workgroup'

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let utime = params.utime;

    //let dims : vec2<u32> = textureDimensions(feedbackTexture, 0);
    //let rgb = textureSampleLevel(feedbackTexture, feedbackSampler, (vec2<f32>(0) + vec2<f32>(0.25, 0.25)) / vec2<f32>(dims),0.0).rgb;
    //--------------------------------------------------------------

    let dims: vec2<u32> = textureDimensions(feedbackTexture, 0);

    let numColumns:f32 = f32(dims.x);
    let numRows:f32 = f32(dims.y);
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

            //let index:f32 = y + (x * screenSize.numColumns);
            var rgba = textureLoad(feedbackTexture, vec2<i32>(ix,iy), 0).rgba;

            let colorsAround = getColorsAroundTexture(feedbackTexture, vec2<i32>(ix,iy), i32(10 + 200 * fnusin(.5)));
            rgba = soften8(rgba, colorsAround, 1.);

            //rgba = vec4<f32>(1,0,0,1);
            //rgba = clearMix(rgba, 1.1);
            //sftn(vec2<i32>(ix,iy), 1, 1);

            textureStore(outputTex, vec2<u32>(ux,uy), rgba);

        }


    }
}
`;

export default compute;
